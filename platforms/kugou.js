const crypto = require('crypto')
const axios = require('axios')

module.exports = class KugouService {
  constructor () {
    this._config = {
      headers: {
        'Referer': 'http://www.kugou.com/webkugouplayer/flash/webKugou.swf',
        'Cookie': '_WCMID=123456789',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
      }
    }
  }

  _request (config) {
    return axios.request(Object.assign({}, this._config, config))
  }

  _formatSearchResult (result) {
    if (result.status !== 1) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let songs = result.data.info.map(song => ({
      id: song.hash,
      name: song.songname,
      artist: song.singername.split('、').map(a => ({
        name: a
      })),
      album: {
        id: song.album_id,
        name: song.album_name
      },
      platform: 'kugou'
    }))
    return {
      success: true,
      data: songs,
      origin: result
    }
  }

  _formatLyricResult (result) {
    return {
      success: true,
      data: {
        lyric: result,
        translation: '',
        platform: 'kugou'
      },
      origin: result
    }
  }

  async _formatUrlResult (result, bitRate) {
    if (result.status !== 1) {
      return {
        success: false,
        data: {},
        origin: result
      }
    }
    let song = result.data[0].relate_goods
    let urls = await Promise.all(song
      .filter(r => r.info.bitrate <= bitRate)
      .map(async r => {
        let res = await this._request({
          url: 'http://trackercdn.kugou.com/i/v2/',
          method: 'get',
          params: {
            hash: r.hash,
            key: crypto.createHash('md5').update(`${r.hash}kgcloudv2`).digest('hex'),
            pid: 1,
            behavior: 'play',
            cmd: '23',
            version: 8400
          }
        })

        return {
          id: r.hash,
          url: res.data.url || '',
          bitRate: r.info.bitrate,
          type: r.info.extname,
          platform: 'kugou'
        }
      }))
    return {
      success: true,
      data: urls.filter(s => s.url),
      origin: result
    }
  }

  async search (keyword, page = 1, limit = 30) {
    let result = await this._request({
      url: 'http://ioscdn.kugou.com/api/v3/search/song',
      method: 'get',
      params: {
        iscorrect: 1,
        pagesize: limit,
        plat: 2,
        tag: 1,
        sver: 5,
        showtype: 10,
        page,
        keyword,
        version: 8550
      }
    })
    return this._formatSearchResult(result.data)
  }

  async lyric (id) {
    let result = await this._request({
      url: 'http://m.kugou.com/app/i/krc.php',
      method: 'get',
      params: {
        keyword: '%20-%20',
        timelength: 1000000,
        cmd: 100,
        hash: id
      }
    })
    return this._formatLyricResult(result.data)
  }

  async url (id, bitRate = 320) {
    let result = await this._request({
      url: 'http://media.store.kugou.com/v1/get_res_privilege',
      method: 'post',
      data: {
        relate: 1,
        userid: 0,
        vip: 0,
        appid: 1005,
        token: '',
        behavior: 'download',
        clientver: 8493,
        resource: [{
          id: 0,
          type: 'audio',
          hash: id
        }]
      }
    })
    return this._formatUrlResult(result.data, bitRate)
  }
}
