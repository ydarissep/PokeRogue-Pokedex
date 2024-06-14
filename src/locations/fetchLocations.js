async function getBiomes(locations){
    footerP("Fetching biomes")
    const rawBiomes = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/biomes.ts`)
    const textBiomes = await rawBiomes.text()

    const rawBiomesForms = await fetch(`https://raw.githubusercontent.com/${repo}/src/field/arena.ts`)
    const textBiomesForms = await rawBiomesForms.text()

    const rowBiomeTranslation = await fetch(`https://raw.githubusercontent.com/${repo}/src/locales/${lang}/biome.ts`)
    const textBiomeTranslation = await rowBiomeTranslation.text()

    const conversionTable = await getBiomesFormsConverionTable(textBiomesForms)
    window.biomeTranslation = await getBiomesTranslationTable(textBiomeTranslation)

    localStorage.setItem("biomeTranslation", LZString.compressToUTF16(JSON.stringify(biomeTranslation)))

    return regexBiomes(textBiomes, locations, conversionTable)
}

async function buildLocationsObj(){
    let locations = {}
    window.biomeLinks = {}

    locations = await getBiomes(locations)


    localStorage.setItem("biomeLinks", LZString.compressToUTF16(JSON.stringify(biomeLinks)))
    localStorage.setItem("locations", LZString.compressToUTF16(JSON.stringify(locations)))
    return locations
}


async function fetchLocationsObj(){
    if(!localStorage.getItem("locations")){
        window.locations = await buildLocationsObj()
    }
    else{
        window.locations = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("locations")))
        window.biomeLinks = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("biomeLinks")))
        window.biomeTranslation = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("biomeTranslation")))
    }

    Object.keys(locations).forEach(async biome => {
        if(localStorage.getItem(biome)){
            sprites[biome] = await LZString.decompressFromUTF16(localStorage.getItem(biome))
        }
    })

    let counter = 0
    window.locationsTracker = []
    Object.keys(locations).forEach(zone => {
        Object.keys(locations[zone]).forEach(method => {
            Object.keys(locations[zone][method]).forEach(speciesName => {
                locationsTracker[counter] = {}
                locationsTracker[counter]["key"] = `${zone}\\${method}\\${speciesName}`
                locationsTracker[counter]["filter"] = []
                counter++
            })
        })
    })
}