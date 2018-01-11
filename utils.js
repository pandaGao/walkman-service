const crypto = require('crypto')

exports.randomHex = function (length) {
  return crypto.randomBytes(length).toString('hex').slice(length)
}
