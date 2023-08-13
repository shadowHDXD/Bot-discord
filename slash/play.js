const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("gimme url i give you the music")
        .addSubcommand((Subcommand) => 
            Subcommand
                .setName("song")
                .setDescription("Only one song from this")
                .addStringOption((Option) => Option.setname("url").setDescription("the song's url").setRequired(true))
        )

        .addSubcommand((Subcommand) =>
            Subcommand
                .setname("playlist")
                .setDescription("This plays a whole playlist")
                .addStringOption((option) => option.setname("url").setDescription("the playlist's url").setRequired(true))
        )

        .addSubcommand((Subcommand) =>
            Subcommand
                .setName("search")
                .setDescription("Gimme song name and i find it myself if you aren't capable of providing an url")
                .addStringOption((option) => option.setname("searchterms").setDescription("gimme song name").setRequired(true))
        ),
        run: async ({ client, interaction}) => {
            if(!interaction.member.voice.channel)
                return interaction.editReply("Join a voice channel first, you don't expect me to just write the lyrics, do you?")

            const queue = await client.player.createQueue(interaction.guild)
            if(!queue.connection)
                await queue.connect(interaction.member.voice.channel)

            let embed = new MessageEmbed()

            if(interaction.option.getSubcommand() == "song" ){
                let url = interaction.option.getString("url")
                const result = await client.player.search(url , {
                    requestBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO
                })
                if(result.tracks.length === 0)
                    return interaction.editReply("No results")

                const song = result.tracks[0]
                await queue.addTrack(song)
                embed
                    .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ test: `Duration: ${song.duration}`})
            }else if(interaction.option.getSubcommand() == "playlist" ){
                let url = interaction.option.getString("url")
                const result = await client.player.search(url , {
                    requestBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_PLAYLIST
                })
                if(result.tracks.length === 0)
                    return interaction.editReply("No results")

                const playlist = result.playlist
                await queue.addTracks(result.tracks)
                embed
                    .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** has been added to the Queue`)
                    .setThumbnail(playlist.thumbnail)
                    .setFooter({ test: `Duration: ${playlist.duration}`})
            }else if(interaction.option.getSubcommand() == "search" ){
                let url = interaction.option.getString("searchterms")
                const result = await client.player.search(url , {
                    requestBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_SEARCH
                })
                if(result.tracks.length === 0)
                    return interaction.editReply("No results")

                const song = result.tracks[0]
                await queue.addTrack(song)
                embed
                    .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ test: `Duration: ${song.duration}`})
            }
            if(!queue.playing) await queue.play
            await interaction.editReply({
                embeds: [embed]
            })
        }
}