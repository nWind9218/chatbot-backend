const {Redis} = require('ioredis')
const config = require('./index')
const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASS,
})
module.exports = redis