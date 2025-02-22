const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands.'),
  async execute(interaction) {
    const commands = interaction.client.commands;

    // Create an embed to display the commands
    const embed = new EmbedBuilder()
      .setTitle('Command List')
      .setDescription('Here are all the commands available:')
      .setColor(0x0099FF) // Set the embed color
      .setTimestamp();

    // Add a field for each command
    commands.forEach(command => {
      embed.addFields({
        name: `/${command.data.name}`,
        value: command.data.description || 'No description available.',
        inline: false,
      });
    });

    // Send the embed as a reply
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};