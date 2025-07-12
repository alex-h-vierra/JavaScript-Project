import {google} from 'googleapis'
import secrets from './secrets.json' assert {type: 'json'}
import API from './fetchUserAPI.js'
import getAuth from './auth.js'
// getAllSets()

class TCGSet{
    #cardArray = []
    constructor() {
        this.tcgHashMap = new Map()
    }
    async getCardsSetID(setId) {
        const response = await API.fetchCardsSetID(setId)
        const data = await response.json()
        return this.makeCardObject(data)
    }
    async makeCardObject(data) {
        const authClient = await getAuth.getGoogleAuth()
        const googleSheets = google.sheets({version: "v4", auth: authClient})
        const spreadsheetId = secrets.spreedsheetId
        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A:E",
            valueRenderOption: "FORMATTED_VALUE"
        })
        data.data.forEach(cardData =>{
            let num = Number(cardData.number)
            cardData.number = num
            cardData.frequency = 0
            this.#addCardToArray(cardData)
        })
        this.#cardArray = this.#mergeUnorganizedArray(this.#cardArray)
        this.#addCardToMap()
        if (!response.data.values) {
            await this.#appendToSheet()    
        } else if (response.data.values.some(row => row[4] !== undefined && row[4] !== null)) {
            response.data.values.forEach(row => {
                const key = Number(row[0])
                const addFrequency = Number(row[4])
                const oldFrequency = Number(row[2])
        
                if (this.tcgHashMap.has(key)){
                    let card = this.tcgHashMap.get(key)
                    card.frequency = addFrequency + oldFrequency
                }
            }) 
            await this.#appendToSheet()
            await googleSheets.spreadsheets.values.clear({
                spreadsheetId,
                range: "Sheet1!E:E"
            })
        }
    }
    #addCardToMap() {
        this.#cardArray.forEach(card => {
            this.tcgHashMap.set(card.number, card)
        }) 
        return this.tcgHashMap
    }
    #addCardToArray(card) {
        this.#cardArray.push(card)
        return
    }
    #mergeUnorganizedArray(unorganizedCardArray) {
        if (unorganizedCardArray.length <= 1) {
            return unorganizedCardArray
        }
        const mid = Math.floor(unorganizedCardArray.length / 2)
        const left = this.#mergeUnorganizedArray(unorganizedCardArray.slice(0, mid))
        const right = this.#mergeUnorganizedArray(unorganizedCardArray.slice(mid))
        return this.#mergeCoupledArray(left, right)
    }
    #mergeCoupledArray(leftArray, rightArray) {
        let sortedArray = []
        let indexLeft = 0
        let indexRight = 0
        while(indexLeft < leftArray.length && indexRight < rightArray.length) {
            if (leftArray[indexLeft].number < rightArray[indexRight].number) {
                sortedArray.push(leftArray[indexLeft++])
            } else {
                sortedArray.push(rightArray[indexRight++])
            }
        }
        return sortedArray.concat(leftArray.slice(indexLeft)).concat(rightArray.slice(indexRight))
    } 
    async #appendToSheet() {
        const authClient = await getAuth.getGoogleAuth()
        const googleSheets = google.sheets({version: "v4", auth: authClient})
        const spreadsheetId = secrets.spreedsheetId
        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Sheet1!A:E",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: Array.from(this.tcgHashMap.values()).map(card => [
                    card.number,
                    card.name,
                    card.frequency,
                    card.rarity
                ])
            }
        })
    }
}

const prismatcSet = new TCGSet()
prismatcSet.getCardsSetID('sv8pt5')