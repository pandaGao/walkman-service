const querystring = require('querystring')
const crypto = require('crypto')
const axios = require('axios')
const Buffer = require('buffer').Buffer
const utils = require('../utils.js')

module.exports = class NeteaseService {
  constructor () {
    this._config = {
      headers: {
        'Referer': 'https://music.163.com/',
        'Cookie': `os=linux; deviceId=${utils.randomHex(52)}; osver=Ubuntu%2016.04.3%20LTS; appver=1.1.0.1232; channel=netease; MUSIC_A=${utils.randomHex(208)}; __csrf=${utils.randomHex(32)}`,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
      }
    }
  }

  _request (config) {
    return axios.request(Object.assign({}, this._config, config))
  }

  _requestData (data) {
    const key = '7246674226682325323F5E6544673A51'
    let body = JSON.stringify(data)
    const password = Buffer.from(key, 'hex')
    const cipher = crypto.createCipheriv('aes-128-ecb', password, '')
    body = cipher.update(body, 'utf8', 'base64') + cipher.final('base64')
    const hex = Buffer.from(body, 'base64').toString('hex')
    return querystring.stringify({
      eparams: hex.toUpperCase()
    })
  }

  _formatSearchResult (result) {
    if (result.code !== 200) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let songs = result.result.songs.map(song => ({
      id: song.id,
      name: song.name,
      artist: song.ar.map(a => ({
        id: a.id,
        name: a.name
      })),
      album: {
        id: song.al.id,
        name: song.al.name,
        cover: song.al.picUrl
      },
      platform: 'netease'
    }))
    return {
      success: true,
      data: songs,
      origin: result
    }
  }

  _formatLyricResult (result) {
    if (result.code !== 200) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    return {
      success: true,
      data: {
        lyric: result.lrc.lyric || '',
        translation: result.tlyric.lyric || '',
        platform: 'netease'
      },
      origin: result
    }
  }

  _formatUrlResult (result) {
    if (result.code !== 200) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let urls = result.data.map(song => ({
      id: song.id,
      url: song.url,
      bitRate: song.br / 1000,
      type: song.type,
      platform: 'netease'
    }))
    return {
      success: true,
      data: urls,
      origin: result
    }
  }

  async search (keyword, page = 1, limit = 30) {
    let result = await this._request({
      url: 'http://music.163.com/api/linux/forward',
      method: 'post',
      data: this._requestData({
        method: 'POST',
        params: {
          s: keyword,
          type: 1,
          limit,
          total: 'true',
          offset: (page - 1) * limit
        },
        url: 'http://music.163.com/api/cloudsearch/pc'
      })
    })
    return this._formatSearchResult(result.data)
  }

  async lyric (id) {
    let result = await this._request({
      url: 'http://music.163.com/api/linux/forward',
      method: 'post',
      data: this._requestData({
        method: 'POST',
        params: {
          id: id,
          os: 'linux',
          lv: -1,
          kv: -1,
          tv: -1
        },
        url: 'http://music.163.com/api/song/lyric'
      })
    })
    return this._formatLyricResult(result.data)
  }

  async url (id, bitRate = 320) {
    let result = await this._request({
      url: 'http://music.163.com/api/linux/forward',
      method: 'post',
      data: this._requestData({
        method: 'POST',
        params: {
          ids: [id],
          br: bitRate * 1000
        },
        url: 'http://music.163.com/api/song/enhance/player/url'
      })
    })
    return this._formatUrlResult(result.data)
  }
}
