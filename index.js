'use strict'

const 
  fs     =  require('fs'),
  stream =  require('stream'),
  path   =  require('path')
,
  timezoneOffset = (new Date()).getTimezoneOffset() * 60000
;

let logl, root

function toWritable (handle, { rotate = false }) {
  if (handle instanceof stream.Writable) {
    return handle
  } else {
    return fs.createWriteStream(path.resolve(root, handle), { flags: rotate ? 'w' : 'a' }) 
      .on('error', err => {
        throw err
      })
  }
}

class Log extends console.Console {
  constructor (out, err, options = {}) {
    // log instant-specific options
    if (typeof err !== 'string' && !( err instanceof stream.Writable )) {
      options = err 
      err = undefined
    }
    // handle optional second parameter (separate file for stderr)
    super(toWritable(out, options), err ? toWritable(err, options) : undefined)
  }
  common (level, prefix, method, ...args) {
    process.env.DEBUG && console.log(...args)
    if (logl < level) return
    args.unshift(prefix, new Date(Date.now() - timezoneOffset).toISOString())
    super[method](...args)
  }
  debug (...args) {
    process.env.DEBUG && console.log(...args) 
  }
  log (...args) {
    this.common(3, 'L', 'log', ...args)
  }
  info (...args) {
    this.common(4, 'I', 'info', ...args)
  }
  error (...args) {
    this.common(1, 'E', 'error', ...args)
  }
  warn (...args) {
    this.common(2, 'W', 'warn', ...args)
  }
  trace (...args) {
    this.common(1, 't', 'trace', ...args)
  }
}

Log.prototype.log.newline = () => { console.log(this) }

module.exports = ({ logLevel = 0, logsPath = process.cwd() }) => {
  logl = logLevel
  root = logsPath
  // change module.exports for future requires
  module.exports = Log
  // return Log for the first require
  return Log
}
