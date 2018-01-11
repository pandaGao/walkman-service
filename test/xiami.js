const XiamiService = require('../platforms/xiami.js')

let api = new XiamiService()

api.search('爱的供养').then(res => {
  let song = res.data[0]
  console.log(song)
  api.lyric(song.id).then(res => console.log(res))
  api.url(song.id).then(res => console.log(res.data))
})
