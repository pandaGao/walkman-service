const Buffer = require('buffer').Buffer
const axios = require('axios')

module.exports = class TencentService {
  constructor () {
    this._config = {
      headers: {
        'Referer': 'https://y.qq.com/portal/player.html',
        'Cookie': 'pgv_pvi=22038528; pgv_si=s3156287488; pgv_pvid=5535248600; yplayer_open=1; ts_last=y.qq.com/portal/player.html; ts_uid=4847550686; yq_index=0; qqmusic_fromtag=66; player_exist=1',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
      }
    }
  }

  _request (config) {
    return axios.request(Object.assign({}, this._config, config))
  }

  _formatSearchResult (result) {
    if (result.code !== 0) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let songs = result.data.song.list.map(song => ({
      id: song.mid,
      name: song.name,
      artist: song.singer.map(a => ({
        id: a.mid,
        name: a.name
      })),
      album: {
        id: song.album.mid,
        name: song.album.name
      },
      platform: 'tencent'
    }))
    return {
      success: true,
      data: songs,
      origin: result
    }
  }

  _formatLyricResult (result) {
    let origin = result
    try {
      result = JSON.parse(result.slice(18, -1))
    } catch (e) {
      return {
        success: false,
        data: {},
        origin
      }
    }
    if (result.code !== 0) {
      return {
        success: false,
        data: {},
        origin
      }
    }
    return {
      success: true,
      data: {
        lyric: result.lyric ? Buffer.from(result.lyric, 'base64').toString() : '',
        translation: result.trans ? Buffer.from(result.trans, 'base64').toString() : '',
        platform: 'tencent'
      },
      origin
    }
  }

  async _formatUrlResult (result, bitRate) {
    if (result.code !== 0) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let guid = Math.floor(Math.random() * 2147483648) % 10000000000
    let key = await this._request({
      url: 'https://c.y.qq.com/base/fcgi-bin/fcg_musicexpress.fcg',
      method: 'get',
      params: {
        json: 3,
        guid,
        format: 'json'
      }
    })
    key = key.data.key

    const typeList = [
      ['size_320mp3', 320, 'M800', 'mp3'],
      ['size_192aac', 192, 'C600', 'm4a'],
      ['size_128mp3', 128, 'M500', 'mp3'],
      ['size_96aac', 96, 'C400', 'm4a'],
      ['size_48aac', 48, 'C200', 'm4a']
    ]
    let urls = typeList.filter(t => result.data[0].file[t[0]] && t[1] <= bitRate)
      .map(t => ({
        id: result.data[0].mid,
        url: `https://dl.stream.qqmusic.qq.com/${t[2]}${result.data[0].file.media_mid}.${t[3]}?vkey=${key}&guid=${guid}&uid=0&fromtag=30`,
        bitRate: t[1],
        type: t[3],
        platform: 'tencent'
      }))

    return {
      success: true,
      data: urls,
      origin: result
    }
  }

  async search (keyword, page = 1, limit = 30) {
    let result = await this._request({
      url: 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp',
      method: 'get',
      params: {
        format: 'json',
        p: page,
        n: limit,
        w: keyword,
        aggr: 1,
        lossless: 1,
        cr: 1,
        new_json: 1
      }
    })
    return this._formatSearchResult(result.data)
  }

  async lyric (id) {
    let result = await this._request({
      url: 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg',
      method: 'get',
      params: {
        songmid: id,
        g_tk: '5381'
      }
    })
    return this._formatLyricResult(result.data)
  }

  async url (id, bitRate = 320) {
    let result = await this._request({
      url: 'https://c.y.qq.com/v8/fcg-bin/fcg_play_single_song.fcg',
      method: 'get',
      params: {
        songmid: id,
        platform: 'yqq',
        format: 'json'
      }
    })
    return this._formatUrlResult(result.data, bitRate)
  }
}
