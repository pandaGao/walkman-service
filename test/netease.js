const NeteaseService = require('../platforms/netease.js')

let api = new NeteaseService()

api.search({
  keyword: '爱的供养'
}).then(res => {
  let song = res.data[0]
  console.log(song)
  api.lyric(song.id).then(res => console.log(res.data))
  api.url(song.id).then(res => console.log(res.data))
})
