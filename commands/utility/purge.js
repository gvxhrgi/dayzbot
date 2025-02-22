const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge up to 100 messages in this channel.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The number of messages to purge (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  async execute(interaction) {
    // Check if the user has permission to manage messages
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    // Get the amount of messages to delete
    const amount = interaction.options.getInteger('amount');

    try {
      // Fetch messages in the channel
      const messages = await interaction.channel.messages.fetch({ limit: amount });

      // Filter out messages older than 14 days (Discord API limitation)
      const deletableMessages = messages.filter(msg => Date.now() - msg.createdTimestamp < 1209600000); // 14 days in milliseconds

      // Bulk delete the messages
      if (deletableMessages.size > 0) {
        await interaction.channel.bulkDelete(deletableMessages);
        await interaction.reply({
          content: `Successfully purged ${deletableMessages.size} messages.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'No messages to purge in this channel.',
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error('Error purging messages:', error);
      await interaction.reply({
        content: 'An error occurred while purging messages.',
        ephemeral: true,
      });
    }
  },
};