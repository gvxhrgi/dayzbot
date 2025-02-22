const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for kicking the user')
        .setRequired(false)
    ),
  async execute(interaction) {
    // Check if the user has permission to kick members
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: 'You do not have permission to kick members.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    try {
      // Fetch the member from the guild
      const member = await interaction.guild.members.fetch(user.id);

      // Kick the user
      await member.kick(reason);
      await interaction.reply({
        content: `Kicked ${user.tag}. Reason: ${reason}`,
      });
    } catch (error) {
      console.error('Error kicking user:', error);
      await interaction.reply({
        content: 'An error occurred while kicking the user.',
        ephemeral: true,
      });
    }
  },
};