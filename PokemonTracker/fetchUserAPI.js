import fetch from 'node-fetch'
import {google} from 'googleapis'
import secrets from './secrets.json' assert {type: 'json'}

export async function fetchAllSets() {
    const response = await fetch('https://api.pokemontcg.io/v2/sets')
    const data = await response.json()
    data.data.forEach(set => {
        console.log(`${set.id}: ${set.name} (${set.series}) - Released ${set.releaseDate}8 ${set.totalCards} cards`)
    })
}
export async function fetchCardsSetID(setId) {
    return await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`, {
        headers: {
            'Accept': 'application/json',
            'X-Api-Key': secrets.pokemonApiKey 
        }
    })    
}
export async function fetchpokemonSetIDResponse(setId) {
    return await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`, {
        headers: {
            'Accept': 'application/json',
            'X-Api-Key': secrets.pokemonApiKey 
        }
    })
}
export default {
    fetchAllSets,
    fetchCardsSetID,
    fetchpokemonSetIDResponse,
}