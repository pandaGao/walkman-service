const axios = require('axios')
const utils = require('../utils.js')

module.exports = class XiamiService {
  constructor () {
    this._config = {
      headers: {
        'Referer': 'http://h.xiami.com/',
        'Cookie': `user_from=2;XMPLAYER_addSongsToggler=0;XMPLAYER_isOpen=0;_xiamitoken=123456789${utils.randomHex(32)};`,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
      }
    }
  }

  _request (config) {
    return axios.request(Object.assign({}, this._config, config))
  }

  _formatSearchResult (result) {
    if (result.state !== 0) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let songs = result.data.songs.map(song => ({
      id: song.song_id,
      name: song.song_name,
      artist: [{
        id: song.artist_id,
        name: song.artist_name,
        avatar: song.artist_logo
      }],
      album: {
        id: song.album_id,
        name: song.album_name,
        cover: song.album_logo
      },
      platform: 'xiami'
    }))
    return {
      success: true,
      data: songs,
      origin: result
    }
  }

  async _formatLyricResult (result) {
    if (result.state !== 0 || !result.data.song.lyric) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let lyric = await this._request({
      url: result.data.song.lyric,
      method: 'get'
    })
    lyric = lyric.data.replace(/<[^>]+>/g, '')
    return {
      success: true,
      data: {
        lyric,
        translation: '',
        platform: 'xiami'
      },
      origin: result
    }
  }

  _formatUrlResult (result, bitRate) {
    if (!result.location) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let location = result.location
    let num = location[0] * 1
    let str = location.slice(1)
    let len = Math.floor(str.length / num)
    let sub = str.length % num
    let qrc = []
    let tmp = 0
    let url = ''

    for (;tmp < sub; tmp++) {
      qrc[tmp] = str.substr(tmp * (len + 1), len + 1)
    }
    for (;tmp < num; tmp++) {
      qrc[tmp] = str.substr(len * tmp + sub, len)
    }
    for (let i = 0; i < len + 1; i++) {
      for (let j = 0; j < num; j++) {
        if (qrc[j][i]) {
          url += qrc[j][i]
        }
      }
    }
    url = decodeURIComponent(url).replace(/\^/g, '0').replace('http://', 'https://')

    return {
      success: true,
      data: [{
        url,
        platform: 'xiami'
      }],
      origin: result
    }
  }

  async search (options) {
    let keyword = options.keyword || ''
    let page = options.page || 1
    let limit = options.limit || 30
    let result = await this._request({
      url: 'http://api.xiami.com/web',
      method: 'get',
      params: {
        v: '2.0',
        app_key: '1',
        key: keyword,
        page,
        limit,
        r: 'search/songs'
      }
    })
    return this._formatSearchResult(result.data)
  }

  async lyric (id) {
    let result = await this._request({
      url: 'http://api.xiami.com/web',
      method: 'get',
      params: {
        v: '2.0',
        app_key: '1',
        id,
        r: 'song/detail'
      }
    })
    return this._formatLyricResult(result.data)
  }

  async url (id, bitRate = 320) {
    let result = await this._request({
      url: `http://www.xiami.com/song/gethqsong/sid/${id}`,
      method: 'get',
      params: {
        v: '2.0',
        app_key: '1',
        id,
        r: 'song/detail'
      }
    })
    return this._formatUrlResult(result.data, bitRate)
  }
}
