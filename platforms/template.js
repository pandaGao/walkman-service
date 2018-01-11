const crypto = require('crypto')
const axios = require('axios')

module.exports = class XXXService {
  constructor () {
    this._config = {
      headers: {
        'Referer': '',
        'Cookie': '',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
      }
    }
  }

  _request (config) {
    return axios.request(Object.assign({}, this._config, config))
  }

  _formatSearchResult (result) {
    if (result) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let songs = result.xxx.map(song => ({
      id: song,
      name: song,
      artist: song.xxx.map(a => ({
        id: a,
        name: a
      })),
      album: {
        id: song,
        name: song,
        cover: song
      },
      platform: ''
    }))
    return {
      success: true,
      data: songs,
      origin: result
    }
  }

  _formatLyricResult (result) {
    if (result) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    return {
      success: true,
      data: {
        lyric: result,
        translation: '',
        platform: ''
      },
      origin: result
    }
  }

  _formatUrlResult (result, bitRate) {
    if (result) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let urls = result.xxx.map(song => {
      return {
        id: '',
        url: '',
        bitRate: '',
        type: '',
        platform: ''
      }
    })
    return {
      success: true,
      data: urls,
      origin: result
    }
  }

  async search (keyword, page = 1, limit = 30) {
    let result = await this._request({
      url: '',
      method: ''
    })
    return this._formatSearchResult(result.data)
  }

  async lyric (id) {
    let result = await this._request({
      url: '',
      method: ''
    })
    return this._formatLyricResult(result.data)
  }

  async url (id, bitRate = 320) {
    let result = await this._request({
      url: '',
      method: ''
    })
    return this._formatUrlResult(result.data, bitRate)
  }
}
