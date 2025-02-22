const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../utils/database.js'); // Adjust the path as needed

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Remove warnings from a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove warnings from')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The number of warnings to remove')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for removing warnings')
        .setRequired(false)
    ),
  async execute(interaction) {
    // Check if the user has permission to manage warnings
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: 'You do not have permission to remove warnings.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    try {
      // Fetch the user's current warnings from the database
      db.get('SELECT count FROM warnings WHERE user_id = ?', [user.id], (err, row) => {
        if (err) {
          console.error('Error fetching warnings:', err);
          return interaction.reply({
            content: 'An error occurred while fetching warnings.',
            ephemeral: true,
          });
        }

        const userWarnings = row ? row.count : 0;

        // Check if the user has any warnings
        if (userWarnings === 0) {
          return interaction.reply({
            content: `${user.tag} has no warnings to remove.`,
            ephemeral: true,
          });
        }

        // Calculate the new warning count
        const newWarnings = Math.max(userWarnings - amount, 0);

        // Update the warning count in the database
        db.run(
          'INSERT OR REPLACE INTO warnings (user_id, count) VALUES (?, ?)',
          [user.id, newWarnings],
          (err) => {
            if (err) {
              console.error('Error updating warnings:', err);
              return interaction.reply({
                content: 'An error occurred while updating warnings.',
                ephemeral: true,
              });
            }

            interaction.reply({
              content: `Removed ${amount} warning(s) from ${user.tag}. They now have ${newWarnings} warning(s). Reason: ${reason}`,
            });
          }
        );
      });
    } catch (error) {
      console.error('Error removing warnings:', error);
      await interaction.reply({
        content: 'An error occurred while removing warnings.',
        ephemeral: true,
      });
    }
  },
};