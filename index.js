'use strict'

const 
  fs = require('fs'), stream = require('stream'), path = require('path'), util = require('util')
,
  timezoneOffset = (new Date()).getTimezoneOffset() * 60000
;

let logl, root

function toWritable (handle) {
  if (handle instanceof stream.Writable) {
    return handle
  } else {
    return fs.createWriteStream(path.resolve(root, handle), { flags: 'a' }) 
      .on('error', err => {
        throw err
      })
  }
}

class Log extends console.Console {
  constructor (out, err, options = {}) {
    // options specific to this log
    if (typeof err !== 'string' && !( err instanceof stream.Writable )) {
      options = err 
      err = undefined
    }
    if (!options.namespace || typeof options.namespace !== 'string') {
      throw new Error(`log for ${out} missing a valid <String> namespace for util.debuglog`)
    }
    // handle optional second parameter (separate file for stderr)
    super(toWritable(out, options), err ? toWritable(err, options) : undefined)

    this.debuglog = require('util').debuglog(options.namespace)
  }
  common (level, prefix, method, ...args) {
    if (process.env.NODE_DEBUG && process.env.NODE_DEBUG.toLowerCase() === 'true') {
      console.log(...args)
    } else {
      this.debuglog(...args)
    }
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
