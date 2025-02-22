const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Check your warning count.'),
  async execute(interaction) {
    const userId = interaction.user.id;

    // Fetch the user's warning count from the database
    db.get('SELECT count FROM warnings WHERE user_id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Error fetching warnings:', err);
        return interaction.reply({
          content: 'An error occurred while fetching your warnings.',
          ephemeral: true,
        });
      }

      const warningCount = row ? row.count : 0;
      interaction.reply({
        content: `You have **${warningCount}** warning(s).`,
        ephemeral: true,
      });
    });
  },
};