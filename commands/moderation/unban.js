const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server.')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('The ID of the user to unban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for unbanning the user')
        .setRequired(false)
    ),
  async execute(interaction) {
    // Check if the user has permission to unban members
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({
        content: 'You do not have permission to unban members.',
        ephemeral: true,
      });
    }

    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    try {
      // Unban the user
      await interaction.guild.members.unban(userId, reason);
      await interaction.reply({
        content: `Unbanned user with ID ${userId}. Reason: ${reason}`,
      });
    } catch (error) {
      console.error('Error unbanning user:', error);
      await interaction.reply({
        content: 'An error occurred while unbanning the user.',
        ephemeral: true,
      });
    }
  },
};