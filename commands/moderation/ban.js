const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for banning the user')
        .setRequired(false)
    ),
  async execute(interaction) {
    // Check if the user has permission to ban members
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({
        content: 'You do not have permission to ban members.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    try {
      // Fetch the member from the guild
      const member = await interaction.guild.members.fetch(user.id);

      // Ban the user
      await member.ban({ reason });
      await interaction.reply({
        content: `Banned ${user.tag}. Reason: ${reason}`,
      });
    } catch (error) {
      console.error('Error banning user:', error);
      await interaction.reply({
        content: 'An error occurred while banning the user.',
        ephemeral: true,
      });
    }
  },
};