const { generateKeyPair } = require('crypto')
const fs = require('fs')

const { secret } = require('./config/constants')

generateKeyPair('rsa', {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: secret
  }
}, (err, publicKey, privateKey) => {
  if (err) throw err

  fs.writeFile('public.key', publicKey, (err) => {
    if (err) throw err

    console.log('Public key generated successfully')
  })

  fs.writeFile('private.key', privateKey, (err) => {
    if (err) throw err

    console.log('Private key generated successfully')
  })
})
