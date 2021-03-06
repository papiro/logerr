'use strict'

const 
  fs = require('fs'), 
  stream = require('stream'), 
  path = require('path'), 
  util = require('util')
,
  timezoneOffset = new Date().getTimezoneOffset() * 60000
,
  debug = util.debuglog('logerr')
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
    debug(`logerr instance being constructed with out:::${out} and err:::${err}`)
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

    this.debug = require('util').debuglog(options.namespace)
  }
  common (level, prefix, method, ...args) {
    debug(`is the global logLevel (${logl}) >= the level of this log type? (${method}:::${level})`)
    args.unshift(prefix, new Date(Date.now() - timezoneOffset).toISOString())
    this.debug(...args)
    if (logl >= level) return
    super[method](...args)
  }
  log (...args) {
    this.common(2, 'L', 'log', ...args)
  }
  info (...args) {
    this.common(3, 'I', 'info', ...args)
  }
  error (...args) {
    this.common(0, 'E', 'error', ...args)
  }
  warn (...args) {
    this.common(1, 'W', 'warn', ...args)
  }
  trace (...args) {
    this.common(0, 't', 'trace', ...args)
  }
}

Log.prototype.log.newline = () => { console.log(this) }

module.exports = ({ logLevel = 0, logsPath = process.cwd() }) => {
  logl = logLevel
  root = logsPath
  debug(`logerr run with logLevel ${logl} and with logsPath ${root}`)
  // change module.exports for future requires
  module.exports = Log
  // return Log for the first require
  return Log
}
