const session = require('./session')
const Cookie = require('./cookie')

module.exports = (options = {}) => (req, res) => {
  const generateId = typeof options.generateId === 'function'
    ? options.generateId
    : session.generateId

  req.sessionId = session.getId(req, options.name) || generateId()
  req.session = session.load(req.sessionId, options.secret) || Object.create(null)

  const cookie = new Cookie(options.cookie)
  cookie.setHeader(res, options.name, req.sessionId)

  res.on('finish', () => {
    if (Object.keys(req.session).length) {
      req.session.cookie = cookie
      session.save(req.sessionId, req.session, options.secret)
    }
  })
}