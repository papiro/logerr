'use strict'

const 
  fs     =  require('fs'),
  stream =  require('stream'),
  path   =  require('path')
;

class Log extends console.Console {
  constructor (_out, _err) {
    const callingModulePath = path.dirname(module.parent.filename)
    super(
      _out instanceof stream.Writable ? _out : fs.createWriteStream(path.resolve(callingModulePath, _out)), 
      _err instanceof stream.Writable ? _err : fs.createWriteStream(path.resolve(callingModulePath, _err))
    )    
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
