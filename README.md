# Walkman Service

[![npm version](https://badge.fury.io/js/walkman-service.svg)](https://badge.fury.io/js/walkman-service)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Multiple Platform music api for Node.js

## Inspired
Inspired by [metowolf/Meting](https://github.com/metowolf/Meting).This project is just a Node.js implementation for a part of APIs in [metowolf/Meting](https://github.com/metowolf/Meting)

## Install 
```bash
npm i walkman-service
```

## Usage
```javascript
const MusicService = require('walkman-service')

// Available Platforms ['kugou', 'netease', 'tencent', 'xiami']
let service = new MusicService('netease')

service.search('旧词').then(res => {
  let song = res.data[0]
  console.log(song)
  service.lyric(song.id).then(res => console.log(res.data))
  service.url(song.id).then(res => console.log(res.data))
})

```

## License

MIT