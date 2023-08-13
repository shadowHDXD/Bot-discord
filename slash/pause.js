const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Thanks for giving me a break")

    ,run: async ({ client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if(!queue) 
            return await interaction.editReply("You didn't even give me any work, thanks")
    
            queue.destroy()
            await interaction.editReply("See ya!")
        }
}