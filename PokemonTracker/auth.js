import {google} from 'googleapis'
import secrets from './secrets.json' assert {type: 'json'}

export async function getGoogleAuth() {
    let cachedClient = null
    if (cachedClient) {
        return cachedClient
    }
    const auth = new google.auth.GoogleAuth ({
        keyFile: './secrets.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    cachedClient = await auth.getClient()
    return cachedClient
}

export default {
    getGoogleAuth
}