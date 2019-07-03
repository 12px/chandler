// Time Zoning Plugin
// Record Timezones from users,
// then display time relative to everyone.

const DB     = require('../utils/db.js')
const Util   = require('../utils/util.js')
const Zoning = require('../utils/zoning.js')
const lang   = require('../data/lang.json').zoning

module.exports = {

  time: function(msg, opts) {
    let user = DB.find('zoning', { id: msg.author.id })
    if (!user) return Util.say(msg, lang.unset)
    let table = DB.get('zoning')
    let result = '', title = ''

    // if no opts, get time for right now
    if (!opts || !opts.length) {
      title = 'Current Time'
      table = Zoning.sortTable(table, 'now')
    } else if (opts.length == 1) {
      // otherwise try and guess a time
      let when = Zoning.findWhen(opts[0], user.zone)
      if (!when) {
        let response = Util.parse(lang.lost, opts[0])
        return msg.channel.send(response)
      }
      title = `Time at ${opts[0]}`
      table = Zoning.sortTable(table, when)
    }

    for (var i = 0; i < table.length; i++) {
      let t = table[i]
      result += `**${t.time}** - `
      result += `${t.name.split('/')[1].split('_').join(' ')} `
      result += `(${t.users.length})\n`
    }
    msg.channel.send(Util.box(result, title))
    msg.delete()
  },

  zones: function(msg, opts) {
    let result = { fields: [] }
    let table = Zoning.sortTable(DB.get('zoning'), 'now')

    for (var i = 0; i < table.length; i++) {
      let t = table[i]
      let name = t.name.split('/')[1].split('_').join(' ')
      let temp = { name: `${t.time} - ${name}`, value: '', inline: true }
      for (var x in t.users) temp.value += `<@${t.users[x]}>\n`
      result.fields.push(temp)
    }
    msg.channel.send(Util.box('---', "Active Time Zones", result))
    msg.delete()
  },

  zone: function(msg, opts) {
    if (!opts || !opts.length) {
      let response = Util.parse(lang.findZone)
      return msg.channel.send(response)
    }

    let zone = Zoning.findZone(opts)
    if (!zone) {
      let response = Util.parse(lang.lost, opts)
      return msg.channel.send(response)
    }
    DB.add('zoning', { id: msg.author.id, zone: zone.name })
    let response = Util.parse(lang.setZone, zone.name)
    return msg.channel.send(response)
  }

}