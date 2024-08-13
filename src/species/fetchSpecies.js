async function getBaseStats(species){
    footerP("Fetching species")
    const rawBaseStats = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/pokemon-species.ts`)
    const textBaseStats = await rawBaseStats.text()

    const rawMasterlist = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/variant/_masterlist.json`)
    const jsonMasterlist = await rawMasterlist.json()

    species = regexBaseStats(textBaseStats, species, jsonMasterlist)

    return regexStarterAbility(textBaseStats, species)
}

async function getLevelUpLearnsets(species){
    const rawLevelUpLearnsets = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/pokemon-level-moves.ts`)
    const textLevelUpLearnsets = await rawLevelUpLearnsets.text()

    return regexLevelUpLearnsets(textLevelUpLearnsets, species)
}

async function getTMHMLearnsets(species){
    const rawTMHMLearnsets = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/tms.ts`)
    const textTMHMLearnsets = await rawTMHMLearnsets.text()

    return regexTMHMLearnsets(textTMHMLearnsets, species)
}

async function getEvolution(species){
    const rawEvolution = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/pokemon-evolutions.ts`)
    const textEvolution = await rawEvolution.text()

    const rawEvolutionForms = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/pokemon-forms.ts`)
    const textEvolutionForms = await rawEvolutionForms.text()

    species = regexEvolution(textEvolution, species)
    species = regexEvolutionForms(textEvolutionForms, species)

    return getEvolutionLine(species)
}

async function getEggMovesLearnsets(species){
    const rawEggMoves = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/egg-moves.ts`)
    const textEggMoves = await rawEggMoves.text()

    return regexEggMovesLearnsets(textEggMoves, species)
}

async function getIngameNamme(species){
    if(lang === "en"){
        return species
    }

    const rawIngameName = await fetch(`https://raw.githubusercontent.com/${repo}/src/locales/${lang}/pokemon.ts`)
    const textIngameName = await rawIngameName.text()

    return regexIngameName(textIngameName, species)
}

async function getChanges(species){
    const rawChanges = await fetch("https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/pokedex.ts")
    const textChanges = await rawChanges.text()

    return regexChanges(textChanges, species)
}

async function getExp(species){
    const rawExp = await fetch("https://raw.githubusercontent.com/pagefaultgames/pokerogue/main/public/exp-sprites.json")
    const jsonExp = await rawExp.json()

    return regexExp(jsonExp, species)
}







async function buildSpeciesObj(){
    let species = {}
    species = await getBaseStats(species)
    species = await getEvolution(species)
    species = await getLevelUpLearnsets(species)
    species = await getTMHMLearnsets(species)
    species = await getEggMovesLearnsets(species)
    species = await getIngameNamme(species)
    species = await getExp(species)
    //species = await getChanges(species)

    await localStorage.setItem("species", LZString.compressToUTF16(JSON.stringify(species)))
    return species
}


function initializeSpeciesObj(speciesObj){
    speciesObj["baseHP"] = 0
    speciesObj["baseAttack"] = 0
    speciesObj["baseDefense"] = 0
    speciesObj["baseSpAttack"] = 0
    speciesObj["baseSpDefense"] = 0
    speciesObj["baseSpeed"] = 0
    speciesObj["BST"] = 0
    speciesObj["abilities"] = []
    speciesObj["starterAbility"] = "ABILITY_NONE"
    speciesObj["type1"] = ""
    speciesObj["type2"] = ""
    speciesObj["item1"] = ""
    speciesObj["item2"] = ""
    speciesObj["eggGroup1"] = ""
    speciesObj["eggGroup2"] = ""
    speciesObj["changes"] = []
    speciesObj["starterCost"] = 0
    speciesObj["levelUpLearnsets"] = []
    speciesObj["TMHMLearnsets"] = []
    speciesObj["eggMovesLearnsets"] = []
    speciesObj["tutorLearnsets"] = []
    speciesObj["evolution"] = []
    speciesObj["evolutionLine"] = [speciesObj["name"]]
    speciesObj["forms"] = []
    speciesObj["variant"] = [0]
    speciesObj["variantF"] = []
    speciesObj["exp"] = []
    speciesObj["back"] = [0]
    speciesObj["backF"] = []
    speciesObj["backExp"] = []
    speciesObj["weight"] = "?"
}


async function fetchSpeciesObj(){
    if(!localStorage.getItem("species"))
        window.species = await buildSpeciesObj()
    else
        window.species = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("species")))


    window.sprites = {}
    window.speciesTracker = []
    window.spritesInfo = {}

    Object.keys(species).forEach(async name => {
        if(localStorage.getItem(`spriteInfo${name}`)){
            spritesInfo[name] = localStorage.getItem(`spriteInfo${name}`)
        }
        ["BACK", "F", "BACK_F"].forEach(async extra => {
            if(localStorage.getItem(`spriteInfo${extra}${name}`)){
                spritesInfo[`${extra}_${name}`] = localStorage.getItem(`spriteInfo${extra}${name}`)
            }
            if(localStorage.getItem(`${extra}_${name}`)){
                sprites[`${extra}_${name}`] = await LZString.decompressFromUTF16(localStorage.getItem(`${extra}_${name}`))
            }  
        })
    })

    for(let i = 0, j = Object.keys(species).length; i < j; i++){
        speciesTracker[i] = {}
        speciesTracker[i]["key"] = Object.keys(species)[i]
        speciesTracker[i]["filter"] = []
    }

    tracker = speciesTracker
}

