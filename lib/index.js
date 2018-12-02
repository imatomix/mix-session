const crypto = require('crypto')
const store = require('./store')
const Cookie = require('./cookie')

module.exports = (options = {}) => (req, res) => {
  const generateId = typeof options.generateId === 'function'
    ? options.generateId
    : generateSessionId

  const sid = getSessionId(req, options.name) || generateId()
  let session = loadSession(sid) || createSession(sid, options)
  req.sessionId = sid
  req.session = session

  const cookie = new Cookie(options.cookie)
  req.session.cookie = cookie

  cookie.setHeader(res, options.name, sid)
}

function createSession(id, options) {
  const session = store.set(id)

  return session
}

function loadSession(id) {
  const session = store.get(id)

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
  // TODO
}

function decrypt(value, secret) {
  // TODO
  return false;
}
