const MusicService = require('../index.js')

let service = new MusicService('netease')

service.search('七月上').then(res => {
  let song = res.data[0]
  console.log(song)
  service.lyric(song.id).then(res => console.log(res.data))
  service.url(song.id).then(res => console.log(res.data))
})
