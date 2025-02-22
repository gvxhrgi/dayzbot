const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../utils/database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user. After 3 warnings, they will be banned for 3 days.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for warning the user')
        .setRequired(false)
    ),
  async execute(interaction) {
    // Check if the user has permission to warn members
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: 'You do not have permission to warn members.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    try {
      // Fetch the member from the guild
      const member = await interaction.guild.members.fetch(user.id);

      // Get the user's current warnings from the database
      db.get('SELECT count FROM warnings WHERE user_id = ?', [user.id], (err, row) => {
        if (err) throw err;

        const userWarnings = row ? row.count : 0;
        const newWarnings = userWarnings + 1;

        // Update the warning count in the database
        db.run(
          'INSERT OR REPLACE INTO warnings (user_id, count) VALUES (?, ?)',
          [user.id, newWarnings],
          (err) => {
            if (err) throw err;

            // Check if the user has reached 3 warnings
            if (newWarnings >= 3) {
              // Ban the user for 3 days
              member.ban({ reason: '3 warnings reached. Automatic ban for 3 days.', days: 3 })
                .then(() => {
                  // Reset warnings
                  db.run('DELETE FROM warnings WHERE user_id = ?', [user.id]);
                  interaction.reply({
                    content: `${user.tag} has been banned for 3 days due to reaching 3 warnings.`,
                  });
                })
                .catch(console.error);
            } else {
              interaction.reply({
                content: `${user.tag} has been warned. They now have ${newWarnings} warnings. Reason: ${reason}`,
              });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error warning user:', error);
      interaction.reply({
        content: 'An error occurred while warning the user.',
        ephemeral: true,
      });
    }
  },
};