'use strict'

const 
  fs = require('fs'), stream = require('stream'), path = require('path')
,
  util = require('util'),
  debug = util.debuglog('logerr')
,
  timezoneOffset = (new Date()).getTimezoneOffset() * 60000
,
  separator = ':'
;

class Log {
  constructor ({ path = '', namespace = '' }) {
    const filePath = opts.path.resolve(module.parent, path)

    debug(`Creating log at ${filePath} with namespace ${namespace}.`)

    Object.assign(this, {
      debug: namespace ? require('util').debuglog(namespace) : null
    })

    this.init(filePath)
  }
  init (filePath) {
    fs.open(filePath, 'a', (err, fd) => {
      if (err) throw err

      debug(`Log successfully created with file-descriptor ${fd}.`)

      Object.assign(this, {
        fd
      })
    })
  }
  log (...args) {
    this.common(2, 'L', 'log', ...args)
    fs.write
  }
  info (...args) {
    this.common(3, 'I', 'info', ...args)
  }
  warn (...args) {
    this.common(1, 'W', 'warn', ...args)
  }
  error (...args) {
    this.common(0, 'E', 'error', ...args)
  }
  trace (...args) {
    this.common(0, 't', 'trace', ...args)
  }
  common (level, prefix, method, ...args) {
    args.unshift(prefix, new Date(Date.now() - timezoneOffset).toISOString())

    this.write(args)
  }
  write (args) {
    fs.write(this.fd, 'utf8', args.join(separator), (err) => {
      if (err) throw err
    })    
  }
}

class DebugLog extends Log {
  constructor (...args) {
    super(...args)
  }
  write (args) {
    console.log(...args)
  }
}

class SparseLog extends Log {
  constructor (...args) {
    super(...args)
  }
  write () {}
}

// let logl, root

// class Log {
//   constructor (out, err, options = {}) {
//     debug(`logerr instance being constructed with out:::${out} and err:::${err}`)
//     // options specific to this log
//     if (typeof err !== 'string' && !( err instanceof stream.Writable )) {
//       options = err 
//       err = undefined
//     }
//     if (!options.namespace || typeof options.namespace !== 'string') {
//       throw new Error(`log for ${out} missing a valid <String> namespace for util.debuglog`)
//     }
//     Object.assign(this, {
//       outLog: fs.createWriteStream(out, { flags: 'a', autoClose: false }),
//       errLog: err && fs.createWriteStream(err, { flags: 'a', autoClose: false }),
//       debuglog: require('util').debuglog(options.namespace)
//     })
//   }
//   common (level, prefix, method, ...args) {
//     this.debuglog(...args)

//     debug(`is the global logLevel (${logl}) >= the level of this log type? (${method}:::${level})`)
//     if (logl >= level) return
//     args.unshift(prefix, new Date(Date.now() - timezoneOffset).toISOString())

//     super[method](...args)
//   }
//   log (...args) {
//     this.common(2, 'L', 'log', ...args)
//     fs.write
//   }
//   info (...args) {
//     this.common(3, 'I', 'info', ...args)
//   }
//   error (...args) {
//     this.common(0, 'E', 'error', ...args)
//   }
//   warn (...args) {
//     this.common(1, 'W', 'warn', ...args)
//   }
//   trace (...args) {
//     this.common(0, 't', 'trace', ...args)
//   }
// }

// Log.prototype.log.newline = () => { console.log(this) }

// module.exports = ({ logLevel = 0, logsPath = process.cwd() }) => {
//   logl = logLevel
//   root = logsPath
//   debug(`logerr run with logLevel ${logl} and with logsPath ${root}`)
//   // change module.exports for future requires
//   module.exports = Log
//   // return Log for the first require
//   return Log
// }
