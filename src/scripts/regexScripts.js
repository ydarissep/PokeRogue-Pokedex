async function regexPokemonInfo(textPokemonInfo){
    const typesMatch = textPokemonInfo.match(/Type\s*:\s*{.*?}\s*,/is)
    if(typesMatch){
        const typesInfo = typesMatch[0].match(/".*?"\s*:\s*".*?"/g)
        if(typesInfo){
            typesInfo.forEach(typeInfo => {
                typeInfo = typeInfo.match(/"(.*?)"\s*:\s*"(.*?)"/)
                translationTable[sanitizeString(typeInfo[1])] = typeInfo[2]
            })
        }
    }


    if(lang !== "en"){
        const statsObj = {"HP": "HPshortened", "Atk": "ATKshortened", "Def": "DEFshortened", "SpA": "SPATKshortened", "SpD": "SPDEFshortened", "Spe": "SPDshortened"}
        Object.keys(statsObj).forEach(stat => {
            const statInfo = textPokemonInfo.match(new RegExp(`"${statsObj[stat]}"\\s*:\\s*".*?"`, "i"))
            if(statInfo){
                translationTable[stat] = statInfo[0].match(/".*?"\s*:\s*"(.*?)"/)[1]
            }
        })

        if(["en", "fr", "es", "it", "de", "ko", "zh_CN", "zh_TW", "pt_BR"].includes(lang)){
            translationTable["BST"] = {"en": "Sum", "fr": "Total", "es": "Total", "it": "BST", "de": "Summe", "ko": "합계", "zh_CN": "种族值", "zh_TW": "總計", "pt_BR": "Total"}[lang]
        }
    }
}




function initTrainer(trainers, trainer, zone){
    if(!trainers[zone]){
        trainers[zone] = {}
    }
    if(!trainers[zone][trainer]){
        trainers[zone][trainer] = {}
    }
    trainers[zone][trainer]["sprite"] = ""
    trainers[zone][trainer]["ingameName"] = sanitizeString(trainer)
    trainers[zone][trainer]["items"] = []
    trainers[zone][trainer]["double"] = false
    trainers[zone][trainer]["party"] = {}
}


function initItem(name){
    items[name] = {}
    items[name]["name"] = name
    items[name]["url"] = ""
    items[name]["description"] = ""
    items[name]["locations"] = {}
    items[name]["pocket"] = ""
    items[name]["price"] = 0
    items[name]["ingameName"] = sanitizeString(name)
    items[name]["effect"] = ""
}