async function getAbilities(abilities){
    footerP("Fetching abilities")
    const rawAbilities = await fetch(`https://raw.githubusercontent.com/${repo}/src/locales/${lang}/ability.ts`)
    const textAbilities = await rawAbilities.text()

    return regexAbilities(textAbilities, abilities)
}

async function getAbilitiesFlags(abilities){
    const rawAbilitiesFlags = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/ability.ts`)
    const textAbilitiesFlags = await rawAbilitiesFlags.text()

    return regexAbilitiesFlags(textAbilitiesFlags, abilities)
}

async function buildAbilitiesObj(){
    let abilities = {}
    abilities = await getAbilities(abilities)
    abilities = await getAbilitiesFlags(abilities)

    abilities["ABILITY_NONE"] = {}
    abilities["ABILITY_NONE"]["name"] = "ABILITY_NONE"
    abilities["ABILITY_NONE"]["ingameName"] = "None"
    abilities["ABILITY_NONE"]["description"] = ""
    abilities["ABILITY_NONE"]["flags"] = []

    Object.keys(abilities).forEach(ability => {
        if(abilities[ability]["flags"].includes("FLAG_PARTIAL")){
            if(abilities[ability]["ingameName"]){
                abilities[ability]["ingameName"] += " (P)"
            }
        }
        else if(abilities[ability]["flags"].includes("FLAG_UNIMPLEMENTED")){
            if(abilities[ability]["ingameName"]){
                abilities[ability]["ingameName"] += " (N)"
            }
        }
    })

    await localStorage.setItem("abilities", LZString.compressToUTF16(JSON.stringify(abilities)))
    return abilities
}


async function fetchAbilitiesObj(){
    if(!localStorage.getItem("abilities")){
        window.abilities = await buildAbilitiesObj()
    }
    else{
        window.abilities = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("abilities")))
    }

    window.abilitiesTracker = []
    for(let i = 0, j = Object.keys(abilities).length; i < j; i++){
        abilitiesTracker[i] = {}
        abilitiesTracker[i]["key"] = Object.keys(abilities)[i]
        abilitiesTracker[i]["filter"] = []
    }
}
