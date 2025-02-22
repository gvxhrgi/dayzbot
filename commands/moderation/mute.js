const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a user for a specified duration.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('The duration of the timeout in minutes')
        .setRequired(true)
        .setMinValue(1) // Minimum 1 minute
        .setMaxValue(40320) // Maximum 28 days (Discord's limit)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the timeout')
        .setRequired(false)
    ),
  async execute(interaction) {
    // Check if the user has permission to timeout members
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({
        content: 'You do not have permission to timeout members.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    try {
      // Fetch the member from the guild
      const member = await interaction.guild.members.fetch(user.id);

      // Calculate the timeout duration in milliseconds
      const timeoutDuration = duration * 60 * 1000; // Convert minutes to milliseconds

      // Timeout the user
      await member.timeout(timeoutDuration, reason);
      await interaction.reply({
        content: `Timed out ${user.tag} for ${duration} minutes. Reason: ${reason}`,
      });
    } catch (error) {
      console.error('Error timing out user:', error);
      await interaction.reply({
        content: 'An error occurred while timing out the user.',
        ephemeral: true,
      });
    }
  },
};