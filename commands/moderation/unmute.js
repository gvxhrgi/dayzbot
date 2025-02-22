const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove the timeout from a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to unmute')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for unmuting the user')
        .setRequired(false)
    ),
  async execute(interaction) {
    // Check if the user has permission to unmute members
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({
        content: 'You do not have permission to unmute members.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    try {
      // Fetch the member from the guild
      const member = await interaction.guild.members.fetch(user.id);

      // Check if the user is already not timed out
      if (!member.communicationDisabledUntil) {
        return interaction.reply({
          content: `${user.tag} is not currently timed out.`,
          ephemeral: true,
        });
      }

      // Remove the timeout
      await member.timeout(null, reason);
      await interaction.reply({
        content: `Removed timeout from ${user.tag}. Reason: ${reason}`,
      });
    } catch (error) {
      console.error('Error unmuting user:', error);
      await interaction.reply({
        content: 'An error occurred while unmuting the user.',
        ephemeral: true,
      });
    }
  },
};