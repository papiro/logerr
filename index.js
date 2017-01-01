'use strict'

const 
  fs     =  require('fs'),
  stream =  require('stream'),
  path   =  require('path')
,
  callingModulePath = path.dirname(module.parent.filename)
;

function toWritable (handle) {
  if (handle instanceof stream.Writable) {
    return handle
  } else {
    return fs.createWriteStream(path.resolve(callingModulePath, handle), { flags: 'a' }) 
  }
}

class Log extends console.Console {
  constructor (_out, _err) {
    const out = toWritable(_out)
    const err = toWritable(_err)
    super(out, err)
  }
  log (...args) {
    args.unshift('LOG: ')
    super.log(...args)
    process.env.DEBUG && console.log(...args)
  }
  info (...args) {
    args.unshift('INFO: ')
    super.info(...args)
    process.env.DEBUG && console.info(...args)
  }
  error (...args) {
    args.unshift('ERROR: ')
    super.error(...args)
    process.env.DEBUG && console.error(...args)
  }
  warn (...args) {
    args.unshift('WARNING: ')
    super.warn(...args)
    process.env.DEBUG && console.warn(...args)
  }
}

module.exports = Log
