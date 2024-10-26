async function regexEventsRequirements(textEventsRequirements){
    const arrayMatch = textEventsRequirements.match(/const\s*\w+.*?]\s*;/gs)
    if(arrayMatch){
        arrayMatch.forEach(array => {
            const arrayValue = array.match(/Moves\.\w+|Abilities\.\w+/ig)
            if(arrayValue){
                const arrayName = array.match(/const\s*(\w+)/)[1]
                eventsRequirements[arrayName] = []
                arrayValue.forEach(value => {
                    value = value.toUpperCase().replace("MOVES.", "MOVE_").replace("ABILITIES.", "ABILITY_")
                    if(value in abilities || value in moves){
                        eventsRequirements[arrayName].push(value)
                    }
                })
            }
        })
    }
}

async function regexEvents(textEvents){
    const eventsNameMatch = textEvents.match(/\/encounters\/.*?\W+\s*;/igs)
    if(eventsNameMatch){
        eventsNameMatch.forEach(eventNameMatch => {
            const eventName = eventNameMatch.match(/\/encounters\/(.*?)\W+\s*;/i)[1].replaceAll("-", "_").toUpperCase()
            events[eventName] = {}
            events[eventName]["name"] = eventName
            initializeEventsObj(events[eventName])
        })
    }

    const eventsEncouterBiomesMatch = textEvents.match(/const\s*\w+\s*=\s*\[.*?\]\s*;/igs)
    if(eventsEncouterBiomesMatch){
        eventsEncouterBiomesMatch.forEach(encounterBiomes => {
            const biomeGroupName = encounterBiomes.match(/const\s*(\w+)/)[1]
            const biomeArray = encounterBiomes.match(/Biome\.\w+/ig).map(biome => biomeTranslation[sanitizeString(biome.replace("Biome.", ""))])

            const biomeEncountersMatch = textEvents.match(new RegExp(`const\\s*${sanitizeString(biomeGroupName).replace(/(?:Encounter )?Biomes$/, "BiomeEncounters").replaceAll(" ",  "")}.*?]\\s*;`, "igs"))
            if(biomeEncountersMatch){
                const eventMatch = biomeEncountersMatch[0].match(/MysteryEncounterType\.\w+/ig)
                if(eventMatch){
                    eventMatch.forEach(event => {
                        const eventName = event.match(/MysteryEncounterType\.(\w+)/i)[1] + "_ENCOUNTER"
                        if(eventName in events){
                            events[eventName]["biomes"] = biomeArray
                        }
                    })
                }
            }
        })
    }

    const eventByBiomeMatch = textEvents.match(/\[\s*Biome\.\w+\s*,\s*\[.*?]\s*]/igs)
    if(eventByBiomeMatch){
        eventByBiomeMatch.forEach(eventByBiome => {
            const biomeName = sanitizeString(eventByBiome.match(/Biome\.(\w+)/i)[1])
            if(biomeName in biomeLinks){
                const eventMatch = eventByBiome.match(/MysteryEncounterType\.\w+/ig)
                if(eventMatch)[
                    eventMatch.forEach(event => {
                        const eventName = event.match(/MysteryEncounterType\.(\w+)/i)[1] + "_ENCOUNTER"
                        if(eventName in events){
                            events[eventName]["biomes"].push(biomeTranslation[biomeName])
                        }
                    })
                ]
            }
        })
    }

    Object.keys(events).forEach(eventName => {
        if(events[eventName]["biomes"].length == 0){
            events[eventName]["biomes"] = Object.keys(biomeLinks)
            for(let i = 0; i < events[eventName]["biomes"].length; i++){
                if(events[eventName]["biomes"][i] in biomeTranslation){
                    events[eventName]["biomes"][i] = biomeTranslation[events[eventName]["biomes"][i]]
                }
            }
        }
    })
}

async function regexEventInfo(jsonEventLocales, textEvent, event){
    const replaceRegex = /(?:^| )(?:Get|Player|Enemy|Num|Required)(?: |$)/ig
    const requirementsRegex = new RegExp(Object.keys(eventsRequirements).toString().replaceAll(",", "|"))
    let replaceHistory = {}
    if(jsonEventLocales["title"] && jsonEventLocales["description"] && jsonEventLocales["option"]){
        events[event]["title"] = eventLocalesMarkdown(jsonEventLocales["title"])
        events[event]["description"] = eventLocalesMarkdown(jsonEventLocales["description"])

        if(jsonEventLocales["intro"]){
            events[event]["intro"] = eventLocalesMarkdown(jsonEventLocales["intro"])
        }
        else if(jsonEventLocales["intro_dialogue"]){
            events[event]["intro"] = eventLocalesMarkdown(jsonEventLocales["intro_dialogue"])
        }

        const eventTierMatch = textEvent.match(/MysteryEncounterTier\.(\w+)/)
        if(eventTierMatch){
            events[event]["tier"] = eventTierMatch[1]
        }

        if(jsonEventLocales["query"]){
            events[event]["query"] = eventLocalesMarkdown(jsonEventLocales["query"])
        }

        const eventWaveRange = textEvent.match(/withSceneWaveRangeRequirement\((.*)/)
        if(eventWaveRange){
            let rangeArray = eventWaveRange[1].split(",")
            if(rangeArray.length == 2){
                for(let i = 0; i < rangeArray.length; i++){
                    if(rangeArray[i].includes("CLASSIC_MODE_MYSTERY_ENCOUNTER_WAVES")){
                        if(i == 0){
                            rangeArray[i] = 10
                        }
                        else{
                            rangeArray[i] = 180
                        }
                    }
                    else if(/\d+/.test(rangeArray[i])){
                        rangeArray[i] = rangeArray[i].match(/\d+/)[0]
                    }
                }
                if(!isNaN(rangeArray[0]) && !isNaN(rangeArray[1])){
                    events[event]["wave"] = [rangeArray[0], rangeArray[1]]
                }
            }
        }

        const introSpriteConfigMatch = textEvent.match(/\.withIntroSpriteConfigs\(\s*\[(.*?)\]\s*\)/is)
        if(introSpriteConfigMatch){
            const spriteConfigMatch = introSpriteConfigMatch[1].match(/{.*?}/gs)
            if(spriteConfigMatch){
                setEventSpriteSrc(spriteConfigMatch, events[event])
            }
        }
        const initSpriteConfigMatch = textEvent.match(/\.spriteConfigs\s*=\s*\[(.*?)\]\s*;/is)
        if(initSpriteConfigMatch){
            const spriteConfigMatch = initSpriteConfigMatch[1].match(/{.*?}/gs)
            if(spriteConfigMatch){
                setEventSpriteSrc(spriteConfigMatch, events[event])
            }
        }
        const caseSpriteConfigMatch = textEvent.match(/case\s*\d+.*?(?:trainerNameKey|spriteKeys).*?break/is)
        if(caseSpriteConfigMatch){
            setEventSpriteSrc([caseSpriteConfigMatch[0]], events[event])
        }

        Object.keys(jsonEventLocales["option"]).forEach(key => {
            if(jsonEventLocales["option"][key]["label"] && jsonEventLocales["option"][key]["tooltip"]){
                events[event]["option"][key] = {}
                if(jsonEventLocales["option"][key]["disabled_tooltip"]){
                    events[event]["option"][key]["requirements"] = []
                    events[event]["option"][key]["disabled"] = "placeholder"
                    events[event]["option"][key]["disabled"] = eventLocalesMarkdown(jsonEventLocales["option"][key]["disabled_tooltip"], key, null)
                }
                else if(jsonEventLocales["option"][key]["tooltip_disabled"]){
                    events[event]["option"][key]["requirements"] = []
                    events[event]["option"][key]["disabled"] = "placeholder"
                    events[event]["option"][key]["disabled"] = eventLocalesMarkdown(jsonEventLocales["option"][key]["tooltip_disabled"], key, null)
                }
                events[event]["option"][key]["label"] = eventLocalesMarkdown(jsonEventLocales["option"][key]["label"], key, null)
                events[event]["option"][key]["tooltip"] = eventLocalesMarkdown(jsonEventLocales["option"][key]["tooltip"], key, null)
                Object.keys(jsonEventLocales["option"][key]).forEach(optionKey => {
                    if(optionKey.includes("selected")){
                        if(!events[event]["option"][key]["selected"]){
                            events[event]["option"][key]["selected"] = eventLocalesMarkdown(jsonEventLocales["option"][key][optionKey].replaceAll("\n", " "), key, optionKey)
                        }
                        else{
                            events[event]["option"][key]["selected"] += `\n\n${eventLocalesMarkdown(jsonEventLocales["option"][key][optionKey].replaceAll("\n", " "), key, optionKey)}`
                        }
                    }
                })
            }
        })
    }














    function eventLocalesMarkdown(text, key = null, optionKey = null){
        text = text.replaceAll(/{{\w+,\s*money\s*}}|@\[MONEY\]{Money}/ig, "@[TOOLTIP_TITLE]{₽}")
        text = text.replaceAll(/@(?:d|f){\d+}|@s{.*?}/ig, "")
        text = text.replaceAll(/\$/g, "\n")

        if(key && events[event]["option"][key]["disabled"]){
            const tooltipOptions = textEvent.match(/\.with\w*Option\(.*?(?=\.with\w*Option\(|$)/gs)
            if(tooltipOptions){
                if(tooltipOptions[key - 1]){
                    const requirements = tooltipOptions[key - 1].match(/\.with\w+Requirement\(.*/g)
                    if(requirements){
                        for(const requirement of requirements){
                            const requirementMatch = requirement.match(requirementsRegex)
                            if(requirementMatch){
                                if(!events[event]["option"][key]["requirements"].includes(requirementMatch)){
                                    events[event]["option"][key]["requirements"] = requirementMatch
                                }
                            }

                            const moveRequirementMatch = requirement.match(/withPokemonCanLearnMoveRequirement\(\s*(\w+)/)
                            if(moveRequirementMatch){
                                const moveMatch = textEvent.match(new RegExp(`${moveRequirementMatch[1]}\\s*=\\s*(Moves\\.\\w+)`))
                                if(moveMatch){
                                    const moveName = moveMatch[1].toUpperCase().replace("MOVES.", "MOVE_")
                                    if(moveName in moves){
                                        if(!events[event]["option"][key]["requirements"].includes(moveName)){
                                            events[event]["option"][key]["requirements"].push(moveName)
                                        }
                                    }
                                }
                            }
                        }

                        const moveArrayRequirementMatch = tooltipOptions[key - 1].match(/MoveRequirement\(\s*(\w+)/)
                        if(moveArrayRequirementMatch){
                            if(!events[event]["option"][key]["requirements"].includes(moveArrayRequirementMatch[1]) && Object.keys(eventsRequirements).includes(moveArrayRequirementMatch[1])){
                                events[event]["option"][key]["requirements"].push(moveArrayRequirementMatch[1])
                            }
                        }

                        const abilityArrayRequirementMatch = tooltipOptions[key - 1].match(/AbilityRequirement\(\s*(\w+)/)
                        if(abilityArrayRequirementMatch){
                            if(!events[event]["option"][key]["requirements"].includes(abilityArrayRequirementMatch[1]) && Object.keys(eventsRequirements).includes(abilityArrayRequirementMatch[1])){
                                events[event]["option"][key]["requirements"].push(abilityArrayRequirementMatch[1])
                            }
                        }
                    }
                }
            }
        }


















        

        const replaceMatch = Array.from(new Set(text.match(/{{.+?}}/g)))
        if(replaceMatch.length > 0){
            for(let replace of replaceMatch){
                if(replace in replaceHistory){
                    text = text.replaceAll(replace, replaceHistory[replace])
                    continue
                }
                const textEventReplaceMatch = textEvent.match(new RegExp(`setDialogueToken\\("${replace.match(/{{(\w+)}}/)[1].split(",")[0]}",\\s*(.*?)\\)\\s*;`))
                if(textEventReplaceMatch){
                    if(/getPokemonSpecies\(Species\.\w+\)\.getName\(\)/.test(textEventReplaceMatch[1])){
                        replaceHistory[replace] = species[textEventReplaceMatch[1].match(/getPokemonSpecies\((Species\.\w+)\)\.getName\(\)/)[1].replace(".", "_").toUpperCase()]["ingameName"]
                        text = text.replaceAll(replace, replaceHistory[replace])
                    }
                    else if(/getNameToRender/.test(textEventReplaceMatch[1])){
                        const varName = textEventReplaceMatch[0].match(/,\s*(.*?)\.getNameToRender/)[1]
                        const varMatch = textEvent.match(new RegExp(`${varName}\\s*=\\s*(?:new\\s*)?(\\w+)`))
                        if(varMatch){
                            replaceHistory[replace] = translateToken(sanitizeString(varMatch[1].replace(/-|_/g, "").replace(/([A-Z])/g, " $1").replace(/(\d+)/g, " $1").replace(/{|}/g, "").replaceAll(replaceRegex, " ").trim()))
                            text = text.replaceAll(replace, replaceHistory[replace])
                        }
                        else{
                            replaceHistory[replace] = translateToken(sanitizeString(varName))
                            text = text.replaceAll(replace, replaceHistory[replace])
                        }
                    }
                    else if(/\w+\.toString/.test(textEventReplaceMatch[1]) || new RegExp(`${textEventReplaceMatch[1]}\\s*=.*?count\\s*:\\s*\\w+`).test(textEvent)){
                        let varName = textEventReplaceMatch[1].match(/(\w+)\.toString/)
                        if(varName){
                            varName = varName[1]
                        }
                        else{
                            varName = textEvent.match(new RegExp(`${textEventReplaceMatch[1]}\\s*=.*?count\\s*:\\s*(\\w+)`))[1]
                        }
                        const varMatch = textEvent.match(new RegExp(`${varName}\\s*=\\s*(.*?);`))
                        if(varMatch){
                            if(!isNaN(varMatch[1])){
                                replaceHistory[replace] = varMatch[1]
                                text = text.replaceAll(replace, replaceHistory[replace])
                            }
                            else if(/getParty\(\)\.filter\(.*?\)\.length/.test(varMatch[1]) && replaceMatch.length == 1 && /\d+/.test(optionKey)){
                                text = text.replaceAll(replace, translateToken(sanitizeString(optionKey.match(/\d+.*?$/i)).replace(/ *to */i, "~")))
                            }
                        }
                    }
                    else if(key && events[event]["option"][key]["disabled"] && events[event]["option"][key]["requirements"].length > 0){
                        text = tokenRequirementReplace(text, replace, events[event]["option"][key]["requirements"])
                    }
                    else if(/String\(\w+\)/.test(textEventReplaceMatch[1])){
                        const varName = textEventReplaceMatch[1].match(/String\((\w+)\)/)[1]
                        const varMatch = textEvent.match(new RegExp(`${varName}\\s*(?:=|:)\\s*(?:number\\s*=\\s*)?(\\d+)`))
                        if(varMatch){
                            replaceHistory[replace] = translateToken(varMatch[1])
                            text = text.replaceAll(replace, replaceHistory[replace])
                        }
                    }
                    else if(/\w+\.name/.test(textEventReplaceMatch[1])){
                        replaceHistory[replace] = sanitizeString(textEventReplaceMatch[1].match(/(\w+)\.name/)[1])
                        text = text.replaceAll(replace, replaceHistory[replace])
                    }
                }
                else if(key && events[event]["option"][key]["disabled"] && events[event]["option"][key]["requirements"].length > 0){
                    text = tokenRequirementReplace(text, replace, events[event]["option"][key]["requirements"])
                }
                else{
                    if(/Name}}/i.test(replace)){
                        if(/SecondaryName}}/i.test(replace)){
                            replaceHistory[replace] = translateToken("Pokemon 2")
                            text = text.replaceAll(replace, replaceHistory[replace])
                        }
                        else{
                            replaceHistory[replace] = translateToken("Pokemon")
                            text = text.replaceAll(replace, replaceHistory[replace])
                        }
                    }
                }
            }

            const unparsedTokens = text.match(/{{.+?}}/g)
            if(unparsedTokens){
                unparsedTokens.forEach(token => {
                    text = text.replaceAll(token, translateToken(sanitizeString(token.replace(/-|_/g, "").replace(/([A-Z])/g, " $1").replace(/(\d+)/g, " $1").replace(/{|}/g, "").replaceAll(replaceRegex, " ").trim())))
                })
            }
        }

        return text
    }

    function tokenRequirementReplace(text, replace, requirements){
        for(const requirement of requirements){
            if(/move/i.test(replace) && /ability/i.test(replace)){
                replaceHistory[replace] = translateToken(sanitizeString(replace.replace(/-|_/g, "").replace(/([A-Z])/g, " $1").replace(/(\d+)/g, " $1").replace(/{|}/g, "").replaceAll(replaceRegex, "").trim()))
                text = text.replaceAll(replace, replaceHistory[replace])
            }
            else if(/_ABILITIES|_MOVES/i.test(requirement)){
                if(/Ability|Move/i.test(replace)){
                    replaceHistory[replace] = translateToken(sanitizeString(requirement))
                    text = text.replaceAll(replace, replaceHistory[replace])
                }
                else if(/Name}}/i.test(replace)){
                    replaceHistory[replace] = translateToken("Pokemon")
                    text = text.replaceAll(replace, replaceHistory[replace])
                }
            }
            else if(/Name}}/i.test(replace)){
                replaceHistory[replace] = translateToken("Pokemon")
                    text = text.replaceAll(replace, replaceHistory[replace])
            }
            else if(requirement in moves){
                replaceHistory[replace] = moves[requirement]["ingameName"]
                text = text.replaceAll(replace, moves[requirement]["ingameName"])
            }
        }

        return text
    }

    localStorage.setItem("events", await LZString.compressToUTF16(JSON.stringify(events)))
}







function translateToken(sanitizedToken){
    const translateRegex = /Random|Pokemon|Moves?|Abilities|Ability/g

    const translateMatch = sanitizedToken.match(translateRegex)
    if(translateMatch){
        translateMatch.forEach(toTranslate => {
            if(toTranslate in staticTranslationTable){
                sanitizedToken = sanitizedToken.replaceAll(toTranslate, staticTranslationTable[toTranslate])
            }
        })
    }

    return sanitizedToken
}







function setEventSpriteSrc(spriteConfigMatch, eventObj){
    const xOffset = 210, yOffset = 0
    spriteConfigMatch.forEach(spriteConfig => {
        let x = xOffset, y = yOffset
        const xMatch = spriteConfig.match(/x\s*:\s*(-?\d+)/)
        if(xMatch){
            x += parseInt(xMatch[1])
        }
        const yMatch = spriteConfig.match(/y\s*:\s*(-?\d+)/)
        if(yMatch){
            y += parseInt(yMatch[1])
        }


        const spriteFileRootMatch = spriteConfig.match(/fileRoot\s*:\s*"(.+?)"/)
        const spriteKeyMatch = spriteConfig.match(/spriteKey\s*:\s*"(.+?)"/)
        if(spriteFileRootMatch && spriteKeyMatch){
            eventObj["sprite"].push([`https://raw.githubusercontent.com/${repo}/public/images/${spriteFileRootMatch[1]}/${spriteKeyMatch[1]}.png`, x, y])
        }
        else{
            const trainerNameKeyMatch = spriteConfig.match(/trainerNameKey\s*=\s*"(.*?)"/i)
            if(trainerNameKeyMatch){
                eventObj["sprite"].push([`https://raw.githubusercontent.com/${repo}/public/images/trainer/${trainerNameKeyMatch[1]}.png`, x, y])
            }
            const speciesMatch = spriteConfig.match(/Species\.\w+/i)
            if(speciesMatch){
                if(speciesMatch[0].toUpperCase().replace(".", "_") in species){
                    eventObj["sprite"].push([speciesMatch[0].toUpperCase().replace(".", "_"), x, y])
                }
            }
        }
    })
    
    // (arrow point down) this is copied from the game's code, don't ask me
    const minX = -40
    const maxX = 40
    const spacingValue = Math.round((maxX - minX) / Math.max(eventObj["sprite"].filter(s => s[1] == xOffset && s[2] == yOffset).length, 1))
    let n = 0
    for(let i = 0; i < eventObj["sprite"].length; i++){
        if(!(eventObj["sprite"][i][1] != xOffset || eventObj["sprite"][i][2] != yOffset)){
            eventObj["sprite"][i][1] += minX + (n + 0.5) * spacingValue
            n++
        }
    }
}