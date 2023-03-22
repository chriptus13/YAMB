const { Client, GatewayIntentBits, Events } = require('discord.js')
const ytdl = require('ytdl-core')
const ffmpeg = require('ffmpeg-static')
const dotenv = require('dotenv')

const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice')

dotenv.config()

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
})

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on(Events.MessageCreate, async message => {
    if (!message.content.startsWith('!play ')) return
    const url = message.content.replace('!play ', '')

    const channel = message.member.voice.channel
    if (!channel) return message.reply('You must be in a voice channel to play music!')

    const voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    })

    voiceConnection.on('stateChange', (oldState, newState) => {
        console.log(`[${channel.guild.name}-${channel.id}] Connection state changed from ${oldState.status} to ${newState.status}`)
    })

    const stream = ytdl(url, { filter: 'audioonly' })
    const player = createAudioPlayer()
    player.on('stateChange', (oldState, newState) => {
        console.log(`[${channel.guild.name}-${channel.id}] Player state changed from ${oldState.status} to ${newState.status}`)
    })
    const res = createAudioResource(stream)
    voiceConnection.subscribe(player)
    player.play(res)
})

client.login(process.env.BOT_TOKEN)
