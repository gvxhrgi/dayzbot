const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads all commands.')
    .setDefaultMemberPermissions(0) // Only allow users with admin permissions
    .setDMPermission(false), // Disable use in DMs
  async execute(interaction) {
    const commandsPath = path.join(__dirname, '..'); // Path to the commands folder
    const commandFolders = fs.readdirSync(commandsPath);

    // Clear the existing commands collection
    interaction.client.commands.clear();

    // Reload all commands
    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        delete require.cache[require.resolve(filePath)]; // Clear the cache
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
          interaction.client.commands.set(command.data.name, command);
        } else {
          console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
      }
    }

    await interaction.reply({
      content: 'All commands have been reloaded!',
      ephemeral: true,
    });
  },
};