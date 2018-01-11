const KugouService = require('./platforms/kugou.js')
const NeteaseService = require('./platforms/netease.js')
const TencentService = require('./platforms/tencent.js')
const XiamiService = require('./platforms/xiami.js')
const VALID_PLATFORM = ['kugou', 'netease', 'tencent', 'xiami']

module.exports = class MusicService {
  constructor (platform = 'kugou') {
    this._platform = platform
    this.kugou = new KugouService()
    this.netease = new NeteaseService()
    this.tencent = new TencentService()
    this.xiami = new XiamiService()
  }

  setPlatform (platform = 'kugou') {
    if (VALID_PLATFORM.includes(platform)) {
      this._platform = platform
    }
  }

  search (keyword, page = 1, limit = 30) {
    return this[this._platform].search(keyword, page, limit)
  }

  lyric (id) {
    return this[this._platform].lyric(id)
  }

  url (id, bitRate = 320) {
    return this[this._platform].url(id, bitRate)
  }
}
