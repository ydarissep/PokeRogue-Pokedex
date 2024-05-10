function regexBaseStats(textBaseStats, species){
    const statsOrder = ["BST", "baseHP", "baseAttack", "baseDefense", "baseSpAttack", "baseSpDefense", "baseSpeed"]
    const shareSprite = [493, 656, 657, 664, 665, 710, 711, 744, 774, 854, 855, 1007, 1008, 1012, 1013]
    const spriteReset = ["SPECIES_DEOXYS", "SPECIES_GRENINJA_BATTLE_BOND", "SPECIES_SCATTERBUG", "SPECIES_SPEWPA", "SPECIES_MEOWSTIC", "SPECIES_AEGISLASH", "SPECIES_ZYGARDE", "SPECIES_ZYGARDE_50_PC", "SPECIES_ORICORIO", "SPECIES_LYCANROC", "SPECIES_SILVALLY", "SPECIES_MINIOR", "SPECIES_MIMIKYU", "SPECIES_TOXTRICITY", "SPECIES_SINISTEA", "SPECIES_POLTEAGEIST", "SPECIES_ALCREMIE", "SPECIES_INDEEDEE", "SPECIES_MORPEKO", "SPECIES_ZAMAZENTA", "SPECIES_ZACIAN", "SPECIES_URSHIFU", "SPECIES_BASCULEGION", "SPECIES_OINKOLOGNE", "SPECIES_DUDUNSPARCE", "SPECIES_GIMMIGHOUL"]
    const spriteReplace = {"718-10-pc": "718-10", "1044": "2670", "1082": "8901"}
    let counter = 0

    const textBaseStastMatch = textBaseStats.match(/new\s*PokemonSpecies\(Species\..*?(?=new\s*PokemonSpecies|;)/igs)
    if(textBaseStastMatch){
        textBaseStastMatch.forEach(initSpeciesMatch => {
            counter++
            let originalSpecies = null
            let replaceOriginalSpecies = false
            let speciesInitArray = initSpeciesMatch.match(/new\s*PokemonForm\(.*?\)/igs)
            if(speciesInitArray){
                speciesInitArray.forEach(formString => {
                    initSpeciesMatch = initSpeciesMatch.replace(formString, "")
                })
                speciesInitArray.unshift(initSpeciesMatch)
            }
            else{
                speciesInitArray = [initSpeciesMatch]
            }


            speciesInitArray.forEach(speciesInit => {
                let speciesName = null
                let spritePath = counter.toString()
                const speciesNameMatch = speciesInit.match(/Species\.\w+/i)
                if(speciesNameMatch){
                    originalSpecies = speciesNameMatch[0].replace(".", "_").toUpperCase()
                    speciesName = originalSpecies
                    if(/PokemonForm/i.test(speciesInitArray.toString())){
                        speciesName = null
                        replaceOriginalSpecies = true
                    }
                }
                else{
                    let extraNameMatch = speciesInit.match(/".*?"\s*,\s*"(.*?)"/)
                    if(extraNameMatch && typeof extraNameMatch[1] === "string"){
                        if(extraNameMatch[1] === ""){
                            speciesName = originalSpecies
                        }
                        else{
                            speciesName = `${originalSpecies}_${extraNameMatch[1].replaceAll(/-|\.| /g, "_").toUpperCase()}`
                            spritePath = `${counter}-${extraNameMatch[1].replaceAll(/_|\.| /g, "-").toLowerCase()}`
                        }
                    }
                    else{
                        extraNameMatch = speciesInit.match(/SpeciesFormKey.\w+/i)
                        if(extraNameMatch){
                            speciesName = `${originalSpecies}${extraNameMatch[0].replace("SpeciesFormKey.", "_").toUpperCase()}`
                            spritePath = `${counter}${extraNameMatch[0].replace("SpeciesFormKey.", "-").replaceAll(/_|\.| /g, "-").toLowerCase()}`
                        }
                    }

                    if(replaceOriginalSpecies){
                        speciesName = originalSpecies
                        replaceOriginalSpecies = false
                    }
                }

                if(speciesName){
                    species[speciesName] = {}
                    species[speciesName]["name"] = speciesName
                    species[speciesName]["ID"] = counter

                    if(spriteReset.includes(speciesName)){
                        spritePath = counter
                    }
                    else if(spritePath in spriteReplace){
                        spritePath = spriteReplace[spritePath]
                    }
                    const regionMatch = speciesName.match(/_(ALOLA|GALAR|HISUI|PALDEA)_/i)
                    if(regionMatch){
                        const trySpecies = speciesName.replace(`_${regionMatch[1]}`, "")
                        if(trySpecies in species){
                            const bonus = {"ALOLA": 2000, "GALAR": 4000, "HISUI": 6000, "PALDEA": 8000}
                            spritePath = species[trySpecies]["ID"] + bonus[regionMatch[1]]
                        }
                        else{
                            spritePath = spritePath.replace(/\d+/, species[originalSpecies]["sprite"].match(/\d+/)[0])
                        }
                    }
                    species[speciesName]["sprite"] = `https://raw.githubusercontent.com/${repo}/public/images/pokemon/${spritePath}.png`
                    if(shareSprite.includes(counter)){
                        species[speciesName]["sprite"] = species[originalSpecies]["sprite"]
                    }

                    
                    initializeSpeciesObj(species[speciesName])

                    if(!species[originalSpecies]["forms"].includes(originalSpecies)){
                        species[originalSpecies]["forms"].push(originalSpecies)
                    }
                    else if(originalSpecies !== speciesName){
                        species[originalSpecies]["forms"].push(speciesName)
                    }

                    const types = speciesInit.match(/Type.\w+/ig)
                    if(types){
                        for(let i = 0; i < types.length && i < 2; i++){
                            species[speciesName][`type${i + 1}`] = types[i].replace(".", "_").toUpperCase()
                        }
                        if(species[speciesName]["type2"] === "" && species[speciesName]["type"] !== ""){
                            species[speciesName]["type2"] = species[speciesName]["type1"]
                        }
                    }

                    const abilitiesMatch = speciesInit.match(/Abilities.\w+/ig)
                    if(abilitiesMatch){
                        for(let i = 0; i < abilitiesMatch.length && i < 3; i++){
                            const abilityName = abilitiesMatch[i].replace(".", "_").toUpperCase().replace("ABILITIES", "ABILITY")
                            if(abilityName in abilities){
                                species[speciesName]["abilities"].push(abilityName)
                            }
                        }
                    }

                    const statsMatch = speciesInit.match(/\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+/)
                    if(statsMatch){
                        const stats = statsMatch[0].match(/\d+/g)
                        for(let i = 0; i < stats.length && i < 7; i++){
                            species[speciesName][statsOrder[i]] = stats[i]
                        }
                    }
                }
            })

            species[originalSpecies]["forms"].forEach(speciesName => {
                species[speciesName]["forms"] = species[originalSpecies]["forms"]
            })

        })
    }
    
    return species
}










function regexLevelUpLearnsets(textLevelUpLearnsets, species){
    const levelUpLearnsetsMatch = textLevelUpLearnsets.match(/Species\.\w+.*?(?=Species\.\w+|;)/igs)
    if(levelUpLearnsetsMatch){
        levelUpLearnsetsMatch.forEach(levelUpLearnset => {
            let speciesName = levelUpLearnset.match(/Species\.\w+/)
            if(speciesName){
                const originalSpecies = speciesName[0].toUpperCase().replace(".", "_")

                let speciesLearnsets = levelUpLearnset.match(/\d+\s*:.*?(?=\d+\s*:|})/igs)
                if(!speciesLearnsets){
                    speciesLearnsets = [levelUpLearnset]
                }

                speciesLearnsets.forEach(learnsets => {
                    speciesName = originalSpecies

                    const formMatch = learnsets.match(/(\d+)\s*:/)
                    if(formMatch){
                        if(species[speciesName]["forms"][formMatch[1]] in species){
                            speciesName = species[originalSpecies]["forms"][formMatch[1]]
                        }
                    }

                    if(speciesName in species){
                        const learnsetMatch = learnsets.match(/\d+\s*,\s*Moves\.\w+/igs)
                        if(learnsetMatch){
                            learnsetMatch.forEach(learnset => {
                                const level = parseInt(learnset.match(/\d+/)[0])
                                const moveName = learnset.match(/Moves\.\w+/i)[0].toUpperCase().replace("MOVES.", "MOVE_")

                                if(moveName in moves){
                                    species[speciesName]["levelUpLearnsets"].push([moveName, level])
                                }
                            })
                        }
                    }
                })
            }
        })
    }

    return altFormsLearnsets(species, "forms", "levelUpLearnsets")
}










function regexTMHMLearnsets(textTMHMLearnsets, species){
    const textTMHMLearnsetsMatch = textTMHMLearnsets.match(/\[\s*Moves\.\w+\]\s*:\s*\[.*?(?=\[\s*Moves\.|}\s*;)/igs)
    if(textTMHMLearnsetsMatch){
        textTMHMLearnsetsMatch.forEach(learnsets => {
            let moveName = learnsets.match(/Moves\.\w+/i)
            if(moveName){
                moveName = moveName[0].toUpperCase().replace("MOVES.", "MOVE_")
                if(moveName in moves){
                    const speciesMatch = learnsets.match(/,\s*\[\s*Species\.\w+.*?\]|Species\.\w+/igs)
                    if(speciesMatch){
                        speciesMatch.forEach(speciesNameMatch => {
                            speciesNameMatch = speciesNameMatch.replaceAll("\'", "\"")
                            const originalSpecies = speciesNameMatch.match(/Species\.\w+/i)[0].toUpperCase().replace(".", "_")
                            let speciesArray = [], share = true

                            const formsMatch = speciesNameMatch.match(/".*?"/g)
                            if(formsMatch){
                                share = false
                                formsMatch.forEach(form => {
                                    const formName = form.match(/"(.*?)"/)[1].toUpperCase().replaceAll(/ |-|\./g, "_")
                                    if(`${originalSpecies}_${formName}` in species){
                                        speciesArray.push(`${originalSpecies}_${formName}`)
                                    }
                                    else{
                                        speciesArray.push(originalSpecies)
                                    }
                                })
                            }
                            else{
                                speciesArray = [originalSpecies]
                            }

                            speciesArray = Array.from(new Set(speciesArray))

                            speciesArray.forEach(speciesName => {
                                if(speciesName in species){
                                    species[speciesName]["TMHMLearnsets"].push(moveName)

                                    if(share && species[speciesName]["forms"][0] == speciesName){
                                        for(let i = 1; i < species[speciesName]["forms"].length; i++){
                                            species[species[speciesName]["forms"][i]]["TMHMLearnsets"].push(moveName)
                                        }
                                    }
                                }
                            })
                        })
                    }
                }
            }
        })
    }

    return species
}









function regexEvolution(textEvolution, species){
    const keywords = /SpeciesFriendshipEvolutionCondition|TimeOfDay\.|getMove\(|moveId|Gender\.|Stat\.|WeatherType\.|dexData|biomeType/ig
    const textEvolutionMatch = textEvolution.match(/\[\s*Species\..*?\].*?(?=\[\s*Species\.\w+\s*\]\s*:|}\s*;)/igs)
    if(textEvolutionMatch){
        textEvolutionMatch.forEach(matchEvolution => {
            const originalSpecies = matchEvolution.match(/\[\s*(Species\.\w+)/i)[1].replace(".", "_").toUpperCase()
            if(originalSpecies in species){
                const splitEvo = matchEvolution.split(/new\s*Species(?:Form)?Evolution\s*\(/i)
                if(splitEvo){
                    for(let i = 1; i < splitEvo.length; i++){
                        let speciesName = originalSpecies
                        let targetSpecies = splitEvo[i].match(/Species\.\w+/i)[0].toUpperCase().replace(".", "_")

                        const formsMatch = splitEvo[i].replaceAll("\'", "\"").match(/"(.*?)"\s*,\s*"(.*?)"/)
                        if(formsMatch){
                            if(`${speciesName}_${formsMatch[1].toUpperCase().replaceAll(/ |-|\./g, "_")}` in species){
                                speciesName = `${speciesName}_${formsMatch[1].toUpperCase().replaceAll(/ |-|\./g, "_")}`
                            }
                            if(`${targetSpecies}_${formsMatch[2].toUpperCase().replaceAll(/ |-|\./g, "_")}` in species){
                                targetSpecies = `${targetSpecies}_${formsMatch[2].toUpperCase().replaceAll(/ |-|\./g, "_")}`
                            }
                        }

                        let item = splitEvo[i].match(/EvolutionItem.(\w+)/i)
                        if(item){
                            item = `ITEM_${item[1]}`
                        }
                        let level = splitEvo[i].match(/\d+/)
                        if(level){
                            level = level[0]
                        }

                        let method = "EVO_LEVEL"
                        let condition = level

                        if(item){
                            method = `EVO_ITEM`
                            condition = item
                        }

                        try{
                            const keywordsMatch = Array.from(new Set(splitEvo[i].match(keywords)))
                            if(keywordsMatch){
                                for(let j = 0; j < keywordsMatch.length; j++){
                                    if(keywordsMatch[j] == "SpeciesFriendshipEvolutionCondition"){
                                        method = "EVO_FRIENDSHIP"
                                        condition = splitEvo[i].match(/SpeciesFriendshipEvolutionCondition\(.*?(\d+)/i)[1]
                                    }
                                    else if(keywordsMatch[j] == "Gender."){
                                        method = `${method}_${splitEvo[i].match(/Gender\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "WeatherType."){
                                        method = `${method}_IN_${splitEvo[i].match(/WeatherType\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "TimeOfDay."){
                                        method = `${method}_AT_${splitEvo[i].match(/TimeOfDay\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "getMove("){
                                        method = `${method}_MOVE_TYPE_${splitEvo[i].match(/Type\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "moveId"){
                                        method = `${method}_MOVE_${splitEvo[i].match(/Moves\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "dexData"){
                                        method = `${method}_${splitEvo[i].match(/dexData.*?Species\.(\w+)/i)[1]}_CAUGHT`
                                    }
                                    else if(keywordsMatch[j] == "biomeType"){
                                        method = `${method}_IN_BIOME(${splitEvo[i].match(/Biome\.\w+/ig).toString().toUpperCase().replaceAll("BIOME.", "")})`
                                    }
                                    else if(keywordsMatch[j] == "Stat."){
                                        const operator = splitEvo[i].match(/\s+>|\s+<|\s+===/)[0].trim().replace(">", "GT").replace("<", "IT").replace("===", "EQ")
                                        const stats = splitEvo[i].match(/(?:HP|ATK|DEF|SPATK|SPDEF|SPD)\s*\]/ig)
                                        method = `${method}_${stats[0].replace("]", "").trim()}_${operator}_${stats[1].replace("]", "").trim()}`
                                    }
                                }
                            }
                        }
                        catch{
                            method = "EVO_LEVEL"
                            condition = level
                            if(item){
                                method = `EVO_ITEM`
                                condition = item
                            }
                        }

                        if(speciesName === "SPECIES_SLOWPOKE" && targetSpecies === "SPECIES_SLOWKING" || speciesName === "SPECIES_POLIWHIRL" && targetSpecies === "SPECIES_POLITOED"){
                            method = "EVO_ITEM_HOLD_KINGS_ROCK"
                        }

                        if(originalSpecies !== targetSpecies){
                            species[speciesName]["evolution"].push([method, condition, targetSpecies])
                        }
                    }
                }
            }
        })
    }

    return species
}












function regexEvolutionForms(textEvolutionForms, species){
    const keywords = /SpeciesFriendshipEvolutionCondition|TimeOfDay\.|getMove\(|moveId|Gender\.|Stat\.|WeatherType\.|dexData|biomeType/ig
    const textEvolutionFormsMatch = textEvolutionForms.match(/\[\s*Species\..*?\].*?(?=\[\s*Species\.\w+\s*\]\s*:|}\s*;)/igs)
    if(textEvolutionFormsMatch){
        textEvolutionFormsMatch.forEach(matchEvolution => {
            const originalSpecies = matchEvolution.match(/\[\s*(Species\.\w+)/i)[1].replace(".", "_").toUpperCase()
            if(originalSpecies in species){
                const splitEvo = matchEvolution.split(/new\s*SpeciesFormChange\s*\(/i)
                if(splitEvo){
                    for(let i = 1; i < splitEvo.length; i++){
                        let speciesName = originalSpecies
                        let targetSpecies = splitEvo[i].match(/Species\.\w+/i)[0].toUpperCase().replace(".", "_")

                        let method = "EVO"
                        let condition = ""

                        const formsMatch = splitEvo[i].replaceAll("\'", "\"").match(/(?:"(.*?)"|SpeciesFormKey\.(\w+))\s*,\s*(?:"(.*?)"|SpeciesFormKey\.(\w+))/i)
                        if(formsMatch){
                            if(formsMatch[1] && `${speciesName}_${formsMatch[1].toUpperCase().replaceAll(/ |-|\./g, "_")}` in species){
                                speciesName = `${speciesName}_${formsMatch[1].toUpperCase().replaceAll(/ |-|\./g, "_")}`
                            }
                            if(formsMatch[2] && `${speciesName}_${formsMatch[2].toUpperCase().replaceAll(/ |-|\./g, "_")}` in species){
                                speciesName = `${speciesName}_${formsMatch[2].toUpperCase().replaceAll(/ |-|\./g, "_")}`
                            }
                            if(formsMatch[3] && `${targetSpecies}_${formsMatch[3].toUpperCase().replaceAll(/ |-|\./g, "_")}` in species){
                                targetSpecies = `${targetSpecies}_${formsMatch[3].toUpperCase().replaceAll(/ |-|\./g, "_")}`
                                if(/MEGA|GIGA/i.test(formsMatch[3])){
                                    method = `${method}_${formsMatch[3]}`
                                }
                            }
                            if(formsMatch[4] && `${targetSpecies}_${formsMatch[4].toUpperCase().replaceAll(/ |-|\./g, "_")}` in species){
                                targetSpecies = `${targetSpecies}_${formsMatch[4].toUpperCase().replaceAll(/ |-|\./g, "_")}`
                                if(/MEGA|GIGA/i.test(formsMatch[4])){
                                    method = `${method}_${formsMatch[4]}`
                                }
                            }
                        }

                        let item = splitEvo[i].match(/FormChangeItem\.(\w+)/i)
                        if(item){
                            method = `${method}_ITEM`
                            condition = item[1]
                        }

                        let move = splitEvo[i].match(/Moves\.(\w+)/i)
                        if(move){
                            method = `${method}_MOVE`
                            condition = move[1]
                        }

                        if(move && item){
                            method = `EVO_ITEM_${item[1]}_MOVE`
                            condition = `MOVE_${move[1]}`
                        }

                        try{
                            const keywordsMatch = Array.from(new Set(splitEvo[i].match(keywords)))
                            if(keywordsMatch){
                                for(let j = 0; j < keywordsMatch.length; j++){
                                    if(keywordsMatch[j] == "SpeciesFriendshipEvolutionCondition"){
                                        method = "EVO_FRIENDSHIP"
                                        condition = splitEvo[i].match(/SpeciesFriendshipEvolutionCondition\(.*?(\d+)/i)[1]
                                    }
                                    else if(keywordsMatch[j] == "Gender."){
                                        method = `${method}_${splitEvo[i].match(/Gender\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "WeatherType."){
                                        method = `${method}_IN_${splitEvo[i].match(/WeatherType\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "TimeOfDay."){
                                        method = `${method}_AT_${splitEvo[i].match(/TimeOfDay\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "getMove("){
                                        method = `${method}_MOVE_TYPE_${splitEvo[i].match(/Type\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "moveId"){
                                        method = `${method}_MOVE_${splitEvo[i].match(/Moves\.(\w+)/i)[1]}`
                                    }
                                    else if(keywordsMatch[j] == "dexData"){
                                        method = `${method}_${splitEvo[i].match(/dexData.*?Species\.(\w+)/i)[1]}_CAUGHT`
                                    }
                                    else if(keywordsMatch[j] == "biomeType"){
                                        method = `${method}_IN_BIOME(${splitEvo[i].match(/Biome\.\w+/ig).toString().toUpperCase().replaceAll("BIOME.", "")})`
                                    }
                                    else if(keywordsMatch[j] == "Stat."){
                                        const operator = splitEvo[i].match(/\s+>|\s+<|\s+===/)[0].trim().replace(">", "GT").replace("<", "IT").replace("===", "EQ")
                                        const stats = splitEvo[i].match(/(?:HP|ATK|DEF|SPATK|SPDEF|SPD)\s*\]/ig)
                                        method = `${method}_${stats[0].replace("]", "").trim()}_${operator}_${stats[1].replace("]", "").trim()}`
                                    }
                                }
                            }
                        }
                        catch{
                        }

                        if(originalSpecies !== targetSpecies){
                            if(method !== "EVO"){
                                species[speciesName]["evolution"].push([method, condition, targetSpecies])
                            }
                        }
                    }
                }
            }
        })
    }

    return species
}




async function getEvolutionLine(species){
    for(const name of Object.keys(species)){
        let evolutionLine = [name]

        for(let i = 0; i < evolutionLine.length; i++){
            const targetSpecies = evolutionLine[i]
            for(let j = 0; j < species[evolutionLine[i]]["evolution"].length; j++){
                const targetSpeciesEvo = species[targetSpecies]["evolution"][j][2]
                if(!evolutionLine.includes(targetSpeciesEvo)){
                    evolutionLine.push(targetSpeciesEvo)
                }
            }
        }

        for(let i = 0; i < evolutionLine.length; i++){
            const targetSpecies = evolutionLine[i]
            if(evolutionLine.length > species[targetSpecies]["evolutionLine"].length){
                species[targetSpecies]["evolutionLine"] = evolutionLine
            }
        }
    }

    for(const name of Object.keys(species)){
        species[name]["evolutionLine"] = Array.from(new Set(species[name]["evolutionLine"])) // remove duplicates
    }

    return species
}








function regexEggMovesLearnsets(textEggMoves, species){
    const textEggMovesMatch = textEggMoves.match(/Species\.\w+.*?\[.*?\]/igs)
    if(textEggMovesMatch){
        textEggMovesMatch.forEach(learnset => {
            const originalSpecies = learnset.match(/Species\.\w+/i)[0].toUpperCase().replace(".", "_")
            if(originalSpecies in species){
                const movesMatch = learnset.match(/Moves\.\w+/ig)
                if(movesMatch){
                    movesMatch.forEach(moveMatch => {
                        const moveName = moveMatch.match(/Moves\.\w+/i)[0].toUpperCase().replace("MOVES.","MOVE_")
                        if(moveName in moves){
                            species[originalSpecies]["eggMovesLearnsets"].push(moveName)
                        }
                    })
                }
            }
        })
    }

    return altFormsLearnsets(species, "evolutionLine", "eggMovesLearnsets")
}














function altFormsLearnsets(species, input, output){
    for (const name of Object.keys(species)){

        if(species[name][input].length >= 2){

                for (let j = 0; j < species[name][input].length; j++){
                    const targetSpecies = species[name][input][j]
                    

                    if(species[targetSpecies][output].length <= 0){
                        species[targetSpecies][output] = species[name][output]
                    }
                }
        }
    }
    return species
}


function getBST(species){
    for (const name of Object.keys(species)){
        const baseHP = species[name]["baseHP"]
        const baseAttack = species[name]["baseAttack"]
        const baseDefense = species[name]["baseDefense"]
        const baseSpAttack = species[name]["baseSpAttack"]
        const baseSpDefense = species[name]["baseSpDefense"]
        const baseSpeed = species[name]["baseSpeed"]
        const BST = baseHP + baseAttack + baseDefense + baseSpAttack + baseSpDefense + baseSpeed

        species[name]["BST"] = BST

    }
    return species
}