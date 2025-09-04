const config = require('../config/index')
const {OAuth2Client} = require('google-auth-library')
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID)
const verifyGoogleIdToken = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: config.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload || !payload.email_verified){
        throw new Error("Invalid GoogleID Token")
    }
    return payload
}

module.exports = { verifyGoogleIdToken }