const IPFS = require('../src/core/')
const HttpBlockService = require('../src/block-service-http')
const createTempRepo = require('./utils/create-repo-node.js')
const CID = require('cids')

const blockService = new HttpBlockService({ ipfsHttpApiUrl: 'http://localhost:5001' })
const ipfs = new IPFS({
  repo: createTempRepo(),
  blockService,
})

ipfs.init({ emptyRepo: true, bits: 1024 }, (err) => {
  if (err) {
    throw err
  }

  const cid = new CID('z43AaGEymG8TWXUuZgFVPB1XkvUadjbwv9RtZignh6kWPmkKNFY')

  ipfs.dag.get(cid, '/number').then((result) => {
    console.log('result:', result)
    console.log('value:', result.value.toString('hex'))
    console.log('number:', parseInt(result.value.toString('hex'), 16))
  }).catch((err) => {
    console.error(err)
  })
})
