'use strict'

const parallelLimit = require('async/parallelLimit')
const pull = require('pull-stream')
const defer = require('pull-defer')
const IpfsBlock = require('ipfs-block')
require('isomorphic-fetch')
// const fetch = require('node-fetch')
// const fetch = global.fetch || require('whatwg-fetch').fetch

module.exports = class HttpBlockService {
  constructor ({ ipfsHttpApiUrl }) {
    this._ipfsHttpApiUrl = ipfsHttpApiUrl
  }

  goOnline () {}
  goOffline () {}
  isOnline () {}

  put (blockAndCID, callback) {
    callback = callback || (() => {})
    callback(new Error('HttpBlockService - "put" not supported'))
  }

  putStream () {
    return pull.error(new Error('HttpBlockService - "putStream" not supported'))
  }

  get (cid, callback) {
    pull(
      this.getStream(cid),
      pull.collect((err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, result[0])
      })
    )
  }

  getStream (cid) {
    const deferred = defer.source()
    const cidString = cid.toBaseEncodedString()
    fetch(`${this._ipfsHttpApiUrl}/api/v0/block/get?arg=${cidString}`).then((response) => {
      if (response.status !== 200) {
        deferred.abort(new Error(`Bad response from server: ${response.status}`))
      }
      // console.log(Object.keys(response))
      // console.log(response.json)

      // console.log('response obj supports:')
      // if (response.arrayBuffer) console.log('- arrayBuffer')
      // if (response.arraybuffer) console.log('- arraybuffer')
      // if (response.buffer) console.log('- buffer')
      // if (response.blob) console.log('- blob')
      // if (response.formData) console.log('- formData')
      // if (response.json) console.log('- json')
      // if (response.text) console.log('- text')


      // return response.arraybuffer()
      return response.buffer()
    }).then((buffer) => {
      // coerce to node buffer
      // let buffer = new Buffer(new Uint8Array(arrBuffer))
      // Parity bug work around - remove eth-block body
      if (cid.codec === 'eth-block') {
        console.warn('Parity bug work around - remove eth-block body')
        // console.log('wrapped:',buffer.toString('hex'))
        const EthBlock = require('ethereumjs-block')
        const ethBlock = new EthBlock(buffer)
        // console.log('block number', ethBlock.header.number)
        buffer = ethBlock.header.serialize()
        // console.log('unwrapped:',buffer.toString('hex'))
        const EthBlockHeader = require('ethereumjs-block/header')
        const header = new EthBlockHeader(buffer)
        // console.log('block number', header.number)
      }
      const block = new IpfsBlock(buffer)
      deferred.resolve(pull.values([block]))
    }).catch((err) => {
      console.error(err)
      deferred.abort(err)
    })
    return deferred
  }

  delete (cids, callback) {
    callback(new Error('HttpBlockService - "delete" not supported'))
  }
}
