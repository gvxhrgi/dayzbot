const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { category } = require('./reload');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('get access to server!'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('verify-modal')
            .setTitle('Account Verification')

        const accNameInput = new TextInputBuilder()
            .setCustomId('dayz-name')
            .setLabel('What Is Your Dayz Username?')
            .setStyle(TextInputStyle.Short);

        const firstrow = new ActionRowBuilder().addComponents(accNameInput)

        modal.addComponents(firstrow);

        await interaction.showModal(modal)
    }
}