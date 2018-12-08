const crypto = require('crypto')
const store = require('./store')
const Cookie = require('./cookie')

module.exports = (options = {}) => (req, res) => {
  const generateId = typeof options.generateId === 'function'
    ? options.generateId
    : generateSessionId

  const sid = getSessionId(req, options.name) || generateId()
  let session = loadSession(sid, options.secret) || Object.create(null)

  req.sessionId = sid
  req.session = session

  const cookie = new Cookie(options.cookie)
  cookie.setHeader(res, options.name, sid)

  res.on('finish', () => {
    if (Object.keys(req.session).length) {
      req.session.cookie = cookie
      saveSession(sid, req.session, options.secret)
    }
  })
}

function saveSession(id, session, secret) {
  const enc = encrypt(JSON.stringify(session), secret)
  store.set(id, enc)
}

function loadSession(id, secret) {
  let session = store.get(id)
  if (typeof session === 'string') {
    session = JSON.parse(decrypt(session, secret))
  }
  return session
}

function generateSessionId() {
  return crypto.randomBytes(16).toString('hex')
}

function getSessionId(req, name) {
  const cookie = req.headers.cookie
    ? req.headers.cookie.match(name + '=([^;]*)')
    : null

  if (!cookie) return

  const sid = cookie[0].split('=')[1]

  if (!sid) return

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
