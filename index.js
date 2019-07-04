// Chandler
// A Discord Bot

let bot  = require('./data/config.json')
const DB = require('./utils/db.js')

const Discord = require('discord.js')

const plugins = [
  require('./plugins/basics.js'),
  require('./plugins/editor.js'),
  require('./plugins/locked.js'),
  require('./plugins/shifty.js'),
  require('./plugins/speaks.js'),
  require('./plugins/zoning.js')  
]

const Client = new Discord.Client()

const getCount = () => Client.guilds.keyArray()
const setCount = amt => {
  let count = `${amt} Servers.`
  Client.user.setActivity(count, { type: 'LISTENING' })
  return count
}

Client.on('ready', async () => {
  console.info("Loading Servers...")
  let servers = getCount()
  let count = setCount(servers.length)
  bot.conf = await DB.loadAll(servers)
  console.info("Loaded " + count)
  bot.ready = true
})

Client.on('message', async msg => {
  let modID = await DB.get(msg.guild.id, 'modID')
  let prefix = await DB.get(msg.guild.id, 'prefix')
  if (!bot.ready || !msg.member || msg.author.bot) return
  if (msg.content.indexOf(prefix) !== 0) return

  let opts = msg.content.slice(prefix.length).trim().split(/ +/g)
  let cmd = opts.shift().toLowerCase()

  const canExecute = plugin => {
    // is it free? (can anyone use it)
    if (plugin.free && plugin.free.includes(cmd)) return true
    // mods and the owner can always execute
    if (msg.member.user.id == msg.member.guild.ownerID) return true
    else return msg.member.roles.has(modID)
  }

  for (var p in plugins) {
    let plugin = plugins[p]
    if (plugin[cmd] && canExecute(plugin)) {
      return plugin[cmd](msg, opts)
    }
  }
})

Client.on('guildCreate', async guild => {
  let servers = getCount()
  let count = setCount(servers.length)
  bot.conf[guild.id] = await DB.load(guild.id)
  console.info("Added to: " + guild.id)
})

Client.on('guildDelete', async guild => {
  let servers = getCount()
  let count = setCount(servers.length)
  console.info("Removed From: " + guild.id)
})

Client.login(bot.token)