const express = require('express')
const router = express.Router()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})

// Authenticate
const authen = require('../controller/authenController')
router.post('/login', jsonParser , authen.login)

// Customer
const customer = require('../controller/customerController')
router.get('/', jsonParser ,customer.list)

module.exports = router