'use strict'

const 
  fs     =  require('fs'),
  stream =  require('stream')
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
  log (...args) {
    process.env.DEBUG && console.log(...args)
    if (logl < 1) return
    args.unshift('L ')
    super.log(...args)
  }
  info (...args) {
    process.env.DEBUG && console.info(...args)
    if (logl < 2) return
    args.unshift('I ')
    super.info(...args)
  }
  error (...args) {
    process.env.DEBUG && console.error(...args)
    if (logl < 3) return
    args.unshift('E ')
    super.error(...args)
  }
  warn (...args) {
    process.env.DEBUG && console.warn(...args)
    if (logl < 4) return
    args.unshift('W ')
    super.warn(...args)
  }
}

Log.prototype.log.newline = () => { console.log(this) }

module.exports = logLevel => {
  logl = logLevel || 0
  // change module.exports
  module.exports = Log
  return Log
}
