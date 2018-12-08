const crypto = require('crypto')
const store = require('./store')

exports.save = (id, data, secret) => {
  const enc = encrypt(JSON.stringify(data), secret)
  store.set(id, enc)
}

exports.load = (id, secret) => {
  let data = store.get(id)
  if (typeof data === 'string') {
    data = JSON.parse(decrypt(data, secret))
  }
  return data
}

exports.generateId = () => {
  return crypto.randomBytes(16).toString('hex')
}

exports.getId = (req, name) => {
  const cookie = req.headers.cookie
    ? req.headers.cookie.match(name + '=([^;]*)')
    : null

  if (!cookie) return

  const sid = cookie[0].split('=')[1]
  return sid
}

function encrypt(value, secret) {
  const cipher = crypto.createCipher('aes-256-cbc', secret)
  let crypted = cipher.update(value, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt(value, secret) {
  const decipher = crypto.createDecipher('aes-256-cbc', secret)
  let decrypted = decipher.update(value, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
