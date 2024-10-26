async function regexPokemonInfo(jsonPokemonInfo){
    Object.keys(jsonPokemonInfo["Type"]).forEach(type => {
        translationTable[sanitizeString(type)] = jsonPokemonInfo["Type"][type]
    })

    if(lang !== "en"){
        const statsObj = {"HP": "HPshortened", "Atk": "ATKshortened", "Def": "DEFshortened", "SpA": "SPATKshortened", "SpD": "SPDEFshortened", "Spe": "SPDshortened"}
        Object.keys(statsObj).forEach(stat => {
            translationTable[stat] = jsonPokemonInfo["Stat"][statsObj[stat]]
        })

        if(["en", "fr", "es", "it", "de", "ko", "zh_CN", "zh_TW", "pt_BR"].includes(lang)){
            translationTable["BST"] = {"en": "Sum", "fr": "Total", "es": "Total", "it": "BST", "de": "Summe", "ko": "합계", "zh_CN": "种族值", "zh_TW": "總計", "pt_BR": "Total"}[lang]
        }
    }
}







async function regexMenu(jsonMenu){
    translationTable["wave"] = jsonMenu["wave"]
}









async function regexItemDescriptions(jsonItemDescriptions){
    let modifierType = {}
    Object.keys(jsonItemDescriptions).forEach(itemType => {
        Object.keys(jsonItemDescriptions[itemType]).forEach(item => {
            const itemName = `ITEM_${item.toUpperCase()}`
            if(!/ModifierType/i.test(item)){
                initItem(itemName)
            }

            if(itemName in items && typeof jsonItemDescriptions[itemType][item] == "object" && "name" in jsonItemDescriptions[itemType][item]){
                items[itemName]["ingameName"] = jsonItemDescriptions[itemType][item]["name"]
            }
            else if(itemName in items && typeof jsonItemDescriptions[itemType][item] == "string"){
                items[itemName]["ingameName"] = jsonItemDescriptions[itemType][item]
            }

            if(itemName in items && typeof jsonItemDescriptions[itemType][item] == "object" && "description" in jsonItemDescriptions[itemType][item]){
                items[itemName]["description"] = jsonItemDescriptions[itemType][item]["description"]
            }
            else if(`${itemType}ModifierType` in modifierType || `${itemType.replace("Item", "")}ModifierType` in modifierType){
                let modifierTypeKey = `${itemType}ModifierType`
                if(!(modifierTypeKey in modifierType)){
                    modifierTypeKey = `${itemType.replace("Item", "")}ModifierType`
                }
                if(itemName in items && "description" in modifierType[modifierTypeKey]){
                    items[itemName]["description"] = modifierType[modifierTypeKey]["description"]
                }
            }
            else{
                modifierType[item] = jsonItemDescriptions[itemType][item]
            }
        })
    })

    return modifierType
}








async function regexItemsTier(textItems, modifierType, jsonItemDescriptions){
    const itemDescMatch = textItems.match(/\w+:\s*\(.*?(?=\w+:\s*\(|}\s*;)/gs)
    if(itemDescMatch){
        itemDescMatch.forEach(itemDesc => {
            const itemName = `ITEM_${itemDesc.match(/(\w+):/)[1]}`
            if(!(itemName in items) || !items[itemName]["description"]){
                const modifierTypeMatch = itemDesc.match(/\w+ModifierType/g)
                if(modifierTypeMatch){
                    modifierTypeMatch.forEach(modifierTypeCheck => {
                        if(modifierTypeCheck in modifierType){
                            if("description" in modifierType[modifierTypeCheck]){
                                if(!(itemName in items)){
                                    initItem(itemName)
                                }
                                if("name" in modifierType[modifierTypeCheck]){
                                    items[itemName]["ingameName"] = modifierType[modifierTypeCheck]["name"]
                                }
                                items[itemName]["description"] = modifierType[modifierTypeCheck]["description"]
                            }
                        }
                    })
                }
            }

            if(itemName in items){
                let modifierTypeGeneratorMatch = itemDesc.match(/\w*(ModifierTypeGenerator)\w*/i)
                if(modifierTypeGeneratorMatch){
                    if(modifierTypeGeneratorMatch[0] != "ModifierTypeGenerator"){
                        modifierTypeGeneratorMatch[0] = modifierTypeGeneratorMatch[0].replace(modifierTypeGeneratorMatch[1], "")
                    }
                    if(!(modifierTypeGeneratorMatch[0] in jsonItemDescriptions)){
                        modifierTypeGeneratorMatch[0] += "Item"
                    }
                    if(modifierTypeGeneratorMatch[0] in jsonItemDescriptions){
                        Object.keys(jsonItemDescriptions[modifierTypeGeneratorMatch[0]]).forEach(item => {
                            const itemNameEffect = `ITEM_${item.toUpperCase()}`
                            if(itemNameEffect in items){
                                items[itemNameEffect]["effect"] = itemName
                                items[itemName]["effect"] += `${itemNameEffect} `
                            }
                        })
                    }
                }
            }

            /*
            if(itemName in items){
                const descInfoMatch = itemDesc.match(/ModifierType(?:Generator)?\((.*?)\)\s*,/i)
                if(descInfoMatch){
                    descInfoMatch[1].split(",").forEach(arg => {
                    })
                }
            }
            */
        })
    }

    const iconMatch = textItems.match(/modifierType:ModifierType.\w+\s*"\s*,\s*"\s*\w+/gs)
    if(iconMatch){
        iconMatch.forEach(iconCheck => {
            const itemName = `ITEM_${iconCheck.match(/modifierType:ModifierType.(\w+)/i)[1]}`
            if(itemName in items){
                items[itemName]["url"] = `https://raw.githubusercontent.com/${repo}/public/images/items/${iconCheck.match(/modifierType:ModifierType.\w+\s*"\s*,\s*"\s*(\w+)/i)[1]}.png`
            }
        })
    }
    const iconBallMatch = textItems.match(/AddPokeballModifierType\("\w+"\s*,\s*PokeballType\.\w+/gs)
    if(iconBallMatch){
        iconBallMatch.forEach(iconBallCheck => {
            const itemName = `ITEM_${iconBallCheck.match(/PokeballType\.(\w+)/)[1]}`
            if(itemName in items){
                items[itemName]["url"] = `https://raw.githubusercontent.com/${repo}/public/images/items/${iconBallCheck.match(/AddPokeballModifierType\("(\w+)/)[1]}.png`
            }
        })
    }


    await getEvoItemTier(`https://raw.githubusercontent.com/${repo}/src/data/balance/pokemon-evolutions.ts`)
    await getEvoItemTier(`https://raw.githubusercontent.com/${repo}/src/data/pokemon-forms.ts`)


    const poolToMethod = {"modifierPool": "Shop", "wildModifierPool": "Wild", "trainerModifierPool": "Trainer"}
    const modifierPoolMatch = textItems.match(/const\s+\w+\s*\:\s*ModifierPool\s+=.*?}\s*;/igs)
    if(modifierPoolMatch){
        modifierPoolMatch.forEach(modifierPool => {
            const modifierPoolName = poolToMethod[modifierPool.match(/const\s+(\w+)/)[1]]
            if(modifierPoolName){
                const tierArrayMatch = modifierPool.match(/\[\s*ModifierTier\.\w+\s*]\s*:.*?]\.map/igs)
                if(tierArrayMatch){
                    tierArrayMatch.forEach(tierArray => {
                        const tier = sanitizeString(tierArray.match(/ModifierTier\.(\w+)/i)[1])
            
                        const itemsMatch = tierArray.match(/WeightedModifierType\s*\(\s*modifierTypes\.\w+/igs)
                        if(itemsMatch){
                            itemsMatch.forEach(item => {
                                const itemName = `ITEM_${item.match(/modifierTypes\.(\w+)/i)[1]}`
                                if(itemName in items){
                                    if(!items[itemName]["pocket"]){
                                        items[itemName]["pocket"] = tier
                                    }
                                    if(!(modifierPoolName in items[itemName]["locations"])){
                                        if(modifierPoolName == "Shop" && items[itemName]["pocket"]){
                                            items[itemName]["locations"][modifierPoolName] = [items[itemName]["pocket"]]
                                        }
                                        else{
                                            items[itemName]["locations"][modifierPoolName] = [tier]
                                        }
                                    }
            
                                    if(items[itemName]["url"] == ""){
                                        items[itemName]["effect"].split(" ").forEach(itemEffect => {
                                            if(itemEffect){
                                                if(!items[itemEffect]["pocket"]){
                                                    items[itemEffect]["pocket"] = tier
                                                }
                                                if(!(modifierPoolName in items[itemEffect]["locations"])){
                                                    if(modifierPoolName == "Shop" && items[itemEffect]["pocket"]){
                                                        items[itemEffect]["locations"][modifierPoolName] = [items[itemEffect]["pocket"]]
                                                    }
                                                    else{
                                                        items[itemEffect]["locations"][modifierPoolName] = [tier]
                                                    }
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    }
}









async function getEvoItemTier(url){
    const rawEnumEvoItem = await fetch(url)
    const textEnumEvoItem = await rawEnumEvoItem.text()
    let rare = 0
    const enumEvolutionItemMatch = textEnumEvoItem.match(/enum\s*(?:EvolutionItem|FormChangeItem)\s*\{.*?\}/is)
    if(enumEvolutionItemMatch){
        enumEvolutionItemMatch[0].split("\n").forEach(line => {
            if(/=\s*\d+/.test(line)){
                rare++
            }
            const itemMatch = line.match(/\w+/)
            if(itemMatch){
                const itemName = `ITEM_${itemMatch[0]}`
                if(itemName in items){
                    if(url == `https://raw.githubusercontent.com/${repo}/src/data/balance/pokemon-evolutions.ts`){
                        items[itemName]["pocket"] = rare > 0 ? "Ultra" : "Great"
                    }
                    else{
                        items[itemName]["pocket"] = rare > 1 ? "Ultra" : "Rogue"
                    }
                }
            }
        })
    }
}









async function regexItemIcon(jsonItemsIcon){
    if("textures" in jsonItemsIcon){
        if("frames" in jsonItemsIcon["textures"][0]){
            jsonItemsIcon["textures"][0]["frames"].forEach(frame => {
                const itemName = `ITEM_${frame["filename"].toUpperCase()}`
                if(itemName in items && !items[itemName]["url"]){
                    items[itemName]["url"] = `https://raw.githubusercontent.com/${repo}/public/images/items/${frame["filename"]}.png`
                }
            })
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