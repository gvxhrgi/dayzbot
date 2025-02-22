const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restart the bot.')
    .setDefaultMemberPermissions(0) // Only allow users with admin permissions
    .setDMPermission(false), // Disable use in DMs
  async execute(interaction) {
    // Check if the user has permission to restart the bot
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({
        content: 'You do not have permission to restart the bot.',
        ephemeral: true,
      });
    }

    // Acknowledge the command
    await interaction.reply({
      content: 'Restarting the bot...',
      ephemeral: true,
    });

    // Exit the process (external script or process manager will restart it)
    process.exit(0);
  },
};