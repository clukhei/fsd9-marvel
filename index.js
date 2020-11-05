const fetch = require('node-fetch')
const withQuery = require('with-query').default
require('dotenv').config()

const marvelApiUrl = 'https://gateway.marvel.com/v1/public/characters'
const url = withQuery(marvelApiUrl, {
    apikey:`${process.env.apikey}`,
    hash: `${process.env.hash}`,
    ts:  `${process.env.ts}`
})

fetch(url).then(results => results.json())
            .then(json => console.log(json.data.results))
        