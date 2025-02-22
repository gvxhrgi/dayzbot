const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token, defaultRoleId, verificationChannelId } = require('./config.json');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers, // Add this intent
	],
});;

client.cooldowns = new Collection();
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	const { cooldowns } = interaction.client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, flags: MessageFlags.Ephemeral });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(token);

require('./deploy-commands')

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;

	if (interaction.customId === 'verify-modal') {
		const dayzname = interaction.fields.getTextInputValue('dayz-name');
		console.log(`Your Dayz Username: ${dayzname}`);

		try {
			// Set the user's nickname
			await interaction.member.setNickname(dayzname);
			console.log(`Set nickname for ${interaction.user.tag} to ${dayzname}`);

			// Remove the old role
			await interaction.member.roles.remove('1342858380871729152');
			console.log(`Removed old role from ${interaction.user.tag}`);

			// Add the new role
			await interaction.member.roles.add('1342878360791154729');
			console.log(`Added new role to ${interaction.user.tag}`);

			// Reply to the interaction
			await interaction.reply({
				content: 'Nickname Sent! If Something Went Wrong, Contact Administration',
			});

			// Purge the verification channel
			const verificationChannel = interaction.guild.channels.cache.get(verificationChannelId);

			if (verificationChannel) {
				// Fetch the last 100 messages in the channel
				const messages = await verificationChannel.messages.fetch({ limit: 100 });

				// Filter out messages that are older than 14 days (Discord API limitation)
				const deletableMessages = messages.filter(msg => Date.now() - msg.createdTimestamp < 1209600000); // 14 days in milliseconds

				// Bulk delete the messages
				if (deletableMessages.size > 0) {
					await verificationChannel.bulkDelete(deletableMessages);
					console.log(`Purged ${deletableMessages.size} messages from the verification channel.`);
				} else {
					console.log('No messages to purge in the verification channel.');
				}
			} else {
				console.error('Verification channel not found.');
			}
		} catch (error) {
			console.error(`Error during role, nickname update, or channel purge: ${error}`);
			await interaction.reply({
				content: 'An error occurred while updating your roles, nickname, or purging the channel. Please contact an administrator.',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

client.on('guildMemberAdd', async (member) => {
	try {
		// Fetch the role by its ID
		const role = member.guild.roles.cache.get(defaultRoleId);
		console.log(defaultRoleId)
		if (!role) {
			console.error(`Role with ID ${defaultRoleId} not found.`);
			return;
		}

		// Assign the role to the new member
		await member.roles.add(role);
		console.log(`Assigned role ${role.name} to ${member.user.tag}`);
	} catch (error) {
		console.error(`Failed to assign role: ${error}`);
	}
});