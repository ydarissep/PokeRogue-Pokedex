fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/tableFilters.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace("if(!species[name][\"abilities\"].includes(abilityName)){", "if(!species[name][\"abilities\"].includes(abilityName)){\nif(species[name][\"starterAbility\"] == abilityName){continue}\n")
    text = text.replace("createFilterGroup(createFilterArray([\"flags\"], moves), \"Flag\", [movesFilterList])", "createFilterGroup(createFilterArray([\"flags\"], moves), \"Flag\", [movesFilterList])\ncreateFilterGroup(createFilterArray([\"flags\"], abilities), \"Flag\", [abilitiesFilterList])\ncreateFilterGroup(Object.keys(locations), \"Biome\", [locationsFilterList])\n")
    text = text.replace(/else\s*if\(label\s*===\s*"Flag"\s*\)\s*\{\s*filterMovesFlags\s*\(\s*value,\s*label\s*\)\s*\}/is, "else if(label === \"Flag\"){if(tracker === abilitiesTracker){filterAbilitiesFlags(value, label)}else{filterMovesFlags(value, label)}}\nelse if(label === \"Biome\"){filterBiome(value, label)}")
    text = text.replace("function filterType(", "function filterTypeOld(")
    text = text.replace("function filterBaseStats(", "function filterBaseStatsOld(")
    text = text.replace("function createFilterGroup(", "function createFilterGroupOld(")
    text = text.replace("newFilter.innerText = `${label}: ${value}`", "newFilter.innerText = `${staticTranslationTable[label] ??= label}: ${value}`")
    text = text.replace('createFilterGroup(["HP", "Atk", "Def", "SpA", "SpD", "Spe", "BST"], "Base Stats", [speciesFilterList, locationsFilterList], true)', 'createFilterGroup(["HP", "Atk", "Def", "SpA", "SpD", "Spe", "BST"], "Base Stats", [speciesFilterList, locationsFilterList], true)\ncreateFilterGroup(["Cost"], "Starter", [speciesFilterList, locationsFilterList], true)')
    text = text.replace("function filterBaseStatsOld(", "function filterStarter(value, label){value = 'starterCost'\nlabel = 'Cost'\nfilterOperators(value, label, species)}\nfunction filterBaseStatsOld(")
    text = text.replace('else if(label === "Base Stats")', 'else if(label === "Starter"){filterStarter(value, label)}\nelse if(label === "Base Stats")')

    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})


function filterAbilitiesFlags(value, label){
    mainLoop: for(let i = 0, j = tracker.length; i < j; i++){
        let name = tracker[i]["key"]

        for(let k = 0; k < abilities[name]["flags"].length; k++){
            if((sanitizeString(abilities[name]["flags"][k]) === value)){
                continue mainLoop
            }   
        }
        tracker[i]["filter"].push(`filter${label}${value}`.replaceAll(" ", ""))
    }
}


function filterBiome(value, label){
    for(let i = 0, j = tracker.length; i < j; i++){
        if(tracker[i]["key"].split("\\")[0] in biomeTranslation){
            if(biomeTranslation[tracker[i]["key"].split("\\")[0]] !== value){
                tracker[i]["filter"].push(`filter${label}${value}`.replaceAll(" ", ""))
            }
        }
        else if(tracker[i]["key"].split("\\")[0] !== value){
            tracker[i]["filter"].push(`filter${label}${value}`.replaceAll(" ", ""))
        }
    }
}



function filterType(value, label){
    const table = document.getElementsByClassName("activeTable")[0]
    for(let i = 0, j = tracker.length; i < j; i++){
        let name = tracker[i]["key"]
        if(tracker === locationsTracker){
            name = tracker[i]["key"].split("\\")[2]
        }
        if(table === speciesTable || table === locationsTable){
            if(!(translationTable[sanitizeString(species[name]["type1"])] === value || sanitizeString(species[name]["type1"]) === value) && !(translationTable[sanitizeString(species[name]["type2"])] === value || sanitizeString(species[name]["type2"]) === value)){
                tracker[i]["filter"].push(`filter${label}${value}`.replaceAll(" ", ""))
            }
        }
        else if(table === movesTable){
            if(!(translationTable[sanitizeString(moves[name]["type"])] === value || sanitizeString(moves[name]["type"]) === value)){
                tracker[i]["filter"].push(`filter${label}${value}`.replaceAll(" ", ""))
            }   
        }
    }
}



function filterBaseStats(value, label){
    if(value === translationTable["HP"] || value === "HP"){
        value = "baseHP"
        label = translationTable["HP"] ??= "HP"
    }
    else if(value === translationTable["Atk"] || value === "Atk"){
        value = "baseAttack"
        label = translationTable["Atk"] ??= "Atk"
    }
    else if(value === translationTable["Def"] || value === "Def"){
        value = "baseDefense"
        label = translationTable["Def"] ??= "Def"
    }
    else if(value === translationTable["SpA"] || value === "SpA"){
        value = "baseSpAttack"
        label = translationTable["SpA"] ??= "SpA"
    }
    else if(value === translationTable["SpD"] || value === "SpD"){
        value = "baseSpDefense"
        label = translationTable["SpD"] ??= "SpD"
    }
    else if(value === translationTable["Spe"] || value === "Spe"){
        value = "baseSpeed"
        label = translationTable["Spe"] ??= "Speed"
    }
    else if(value === translationTable["BST"] || value === "BST"){
        value = "BST"
        label = translationTable["BST"] ??= "BST"
    }

    filterOperators(value, label, species)
}



function createFilterGroup(values, labelValue, tableFilterListArray, operator = false){
    for(let i = 0; i < tableFilterListArray.length; i++){
        const mainContainer = document.createElement("div")
        values.forEach(value => {
            const container = document.createElement("span")
            const label = document.createElement("span")
            const valueContainer = document.createElement("span")

            label.innerText = `${labelValue}: `
            if(labelValue in staticTranslationTable){
                label.innerText = `${staticTranslationTable[labelValue]}: `
            }
            label.className = `${labelValue.replaceAll(" ", "")}`

            container.className = `tableFilter hide`

            const translatedValue = returnFilterValue(labelValue, value)
            valueContainer.innerText = translatedValue
            valueContainer.className = "filterValue"
            if(labelValue.includes("Type")){
                valueContainer.className = `TYPE_${value.toUpperCase()} background filterValue`
            }

            container.append(label)
            container.append(valueContainer)

            mainContainer.append(container)
            mainContainer.className = "filterListContainer"

            if(operator){
                container.classList.add("operator")
                container.addEventListener("click", () => {
                    selectFilter(translatedValue, labelValue)
                })
            }
            else{
                container.addEventListener("click", () => {
                    createFilter(translatedValue, labelValue)
                })
            }
        })
        tableFilterListArray[i].append(mainContainer)
    }
}



function returnFilterValue(label, value){
    if(label === "Biome"){
        if(value in biomeTranslation){
            return biomeTranslation[value]
        }
    }
    else if(label === "Type" || label === "Base Stats"){
        if(value in translationTable){
            return translationTable[value]
        }
    }

    return value
}