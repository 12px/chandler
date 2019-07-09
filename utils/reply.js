// Response Utilities

const Moment = require('moment')

module.exports = {

  with(msg, data, val1, val2) {
    let embed = { author: {} }
    if (typeof data == 'string') {
      embed.description = this.parse(data, val1, val2)
    } else {
      for (var prop in data) {
        if (prop == 'name') {
          embed.author.name = this.parse(data[prop], val1, val2)
        }
        else if (prop == 'desc') {
          embed.description = this.parse(data[prop], val1, val2)
        }
        else if (prop != 'fields') {
          embed[prop] = this.parse(data[prop], val1, val2)
        } else {
          embed[prop] = data[prop]
        }
      }  
    }
    return msg.channel.send({ embed })
  },

  list(msg, title, data, join) {
    // split list at 2k characters
    data = this.split(data, join)
    for (var i = 0; i < data.length; i++) {
      let embed = {
        description: data[i],
        author: { name: this.parse(title) },
        footer: { text: `Page ${i + 1}/${data.length}` }
      }
      return msg.channel.send({ embed })
    }
  },

  parse(str, val1, val2) {
    if (!str) return str
    let invite = '[Invite Link](https://discordapp.com/api/oauth2/authorize?client_id=596194094275887116&permissions=8&scope=bot)'
    let website = '[Command List](https://chandler.12px.io)'
    let support = '[Support Server](https://discord.gg/tjRC7E4)'

    str = str.split('{invite}').join(invite)
    str = str.split('{website}').join(website)
    str = str.split('{support}').join(support)
    str = str.split('{val1}').join(val1)
    str = str.split('{val2}').join(val2)
    return str
  },

  getEmbed(str) {
    try {
      let obj = JSON.parse(str)
      return obj.embed ? obj : { embed: obj }
    }
    catch(e) { return false }
  },

  strip(str) {
    if (str.indexOf('<') == 0) {
      let trim = str.indexOf('@&') == 1 ? 3 : 2
      return str.substring(trim, str.length - 1)
    } else return str
  },

  when(time) { 
    return Moment(time).fromNow() 
  },

  to(msg, reply, val1, val2) {
    reply = this.parse(reply, val1, val2)
    return msg.channel.send(reply)
  },

  embed(msg, name, desc, opts) {
    name = this.parse(name)
    desc = this.parse(desc)
    let res = {
      description: desc ? desc : '',
      author: { name: name ? name : '' }
    }
    res = Object.assign(res, opts)
    return msg.channel.send({ embed: res })
  },

  split(data, join) {
    let text = '', messages = []
    for (var i = data.length - 1; i >= 0; i--) {
      let len = text.length + data[i].length + join.length
      if (len >= 1995) messages.push(text)
      text = len < 1995 ? `${text}${join}${data[i]}` : `${data[i]}`
    }
    if (text) messages.push(text)
    return messages
  },

}