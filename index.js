'use strict'

const 
  fs     =  require('fs'),
  stream =  require('stream')
,
  timezoneOffset = (new Date()).getTimezoneOffset() * 60000
;

let logl = 0 // no logging by default

function toWritable (handle) {
  if (handle instanceof stream.Writable) {
    return handle
  } else {
    return fs.createWriteStream(handle, { flags: 'a' }) 
  }
}

class Log extends console.Console {
  constructor (out, err) {
    super(toWritable(out), err ? toWritable(err) : undefined)
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

module.exports = logLevel => {
  logl = logLevel || 0
  // change module.exports
  module.exports = Log
  return Log
}
