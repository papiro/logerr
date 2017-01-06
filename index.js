'use strict'

const 
  fs     =  require('fs'),
  stream =  require('stream'),
  path   =  require('path')
,
  timezoneOffset = (new Date()).getTimezoneOffset() * 60000
;

let logl, root

function toWritable (handle, rotate) {
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
  constructor (out, err, { rotate = false } = {}) {
    // handle optional second parameter (separate file for stderr)
    super(toWritable(out, rotate), err ? toWritable(err, rotate) : undefined)
  }
  common (level, prefix, method, ...args) {
    // log-write-instant-specific options
    // date is prepended to every log write by default
    let options = { date: true }
    if (typeof args[args.length-1] === 'object') {
      Object.assign(options, args.pop())
    }
    process.env.DEBUG && console.log(...args)
    if (logl < level) return
    args.unshift(prefix, options.date ? new Date(Date.now() - timezoneOffset).toISOString() : '')
    super[method](...args)
  }
  log (...args) {
    this.common(1, 'L', 'log', ...args)
  }
  info (...args) {
    this.common(2, 'I', 'info', ...args)
  }
  error (...args) {
    this.common(3, 'E', 'error', ...args)
  }
  warn (...args) {
    this.common(4, 'W', 'warn', ...args)
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
