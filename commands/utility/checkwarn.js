const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../utils/database.js'); // Adjust the path as needed

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkwarn')
    .setDescription('Check the warning count of another user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(true)
    ),
  async execute(interaction) {
    // Check if the user has permission to view warnings
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: 'You do not have permission to view warnings.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');

    // Fetch the user's warning count from the database
    db.get('SELECT count FROM warnings WHERE user_id = ?', [user.id], (err, row) => {
      if (err) {
        console.error('Error fetching warnings:', err);
        return interaction.reply({
          content: 'An error occurred while fetching warnings.',
          ephemeral: true,
        });
      }

      const warningCount = row ? row.count : 0;
      interaction.reply({
        content: `${user.tag} has **${warningCount}** warning(s).`,
        ephemeral: true,
      });
    });
  },
};