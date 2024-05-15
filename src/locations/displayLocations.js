window.locationsMoveFilter = null

function appendLocationsToTable(key){
    const location = key.split("\\")[0]
    const method = key.split("\\")[1]
    const speciesKey = key.split("\\")[2]
    const rarity = locations[location][method][speciesKey]
    const boss = /boss/i.test(rarity)

    if(!(speciesKey in species)){
        return false
    }

    if(!locationsMoveFilter){
        for(let i = 0; i < locationsFilterContainer.children.length; i++){
            if(locationsFilterContainer.children[i].innerText.split(":")[0] == "Move"){
                if(Number.isInteger(locationsMoveFilter)){
                    locationsMoveFilter = null
                    break
                }
                locationsMoveFilter = i
            }
        }
        if(Number.isInteger(locationsMoveFilter)){
            locationsMoveFilter = locationsFilterContainer.children[locationsMoveFilter].innerText.replace(" ", "").split(":")[1]
            Object.keys(moves).forEach(moveName => {
                if(moves[moveName]["ingameName"] === locationsMoveFilter){
                    locationsMoveFilter = moveName
                }
            })
        }
    }

    let locationTable = document.getElementById(`${location}`)
    if(!locationTable){
        locationTable = returnLocationTable(location)
        locationsTableTbody.append(locationTable)
    }

    let methodTable = document.getElementById(`${location}${boss}`)
    if(!methodTable){
        methodTable = returnMethodTable(location, boss)
        locationTable.children[1].append(methodTable)
    }

    let rarityTable = document.getElementById(`${location}${rarity}${boss}`) 
    if(!rarityTable){
        rarityTable = returnRarityTable(location, rarity, boss)
        insertRarityTable(methodTable.children[1], rarity, rarityTable)
    }

    let speciesRow = document.getElementById(`${location}${speciesKey}${rarity}${boss}`)
    if(speciesRow){
        const timeOfDay = document.createElement("div"); timeOfDay.innerText = method; timeOfDay.classList = `timeOfDay ${method}`; timeOfDay.setAttribute("ID", `${location}\\${method}\\${speciesKey}`)
        speciesRow.children[2].append(timeOfDay)
    }
    else{
        speciesRow = returnSpeciesRow(location, method, speciesKey, rarity, boss)
        insertSpeciesRow(rarityTable.children[1], method, speciesRow)
    }

    if(locationTable.children[1].children.length == 1){
        locationTable.classList.remove("locationScale")
        locationTable.classList.add("locationFixed")
    }
    else{
        locationTable.classList.add("locationScale")
        locationTable.classList.remove("locationFixed")
    }

    return true
}






const timeOfdayOder = {"All": 1, "Anytime": 1, "Day": 2, "Dawn": 3, "Night": 4, "Dusk": 5}
function insertSpeciesRow(rarityTableTbody, timeOfDay, speciesRow){
    if(!(timeOfDay in timeOfdayOder)){
        rarityTableTbody.append(speciesRow)
        return false
    }

    for(let i = 0; i < rarityTableTbody.children.length; i++){
        if(timeOfdayOder[timeOfDay] < timeOfdayOder[rarityTableTbody.children[i].children[2].children[0].innerText]){
            rarityTableTbody.insertBefore(speciesRow, rarityTableTbody.children[i])
            return true
        }
    }

    rarityTableTbody.append(speciesRow)
    return false
}








const rarityOrder = {"Common": 1, "Uncommon": 2, "Rare": 3, "Super Rare": 4, "Ultra Rare": 5, "Boss": 6, "Boss Rare": 7, "Boss Super Rare": 8, "Boss Ultra Rare": 9}
function insertRarityTable(methodTableTbody, rarity, rarityTable){
    if(!(rarity in rarityOrder)){
        methodTableTbody.append(rarityTable)
        return false
    }

    for(let i = 0; i < methodTableTbody.children.length; i++){
        if(rarityOrder[rarity] < rarityOrder[methodTableTbody.children[i].children[0].innerText]){
            methodTableTbody.insertBefore(rarityTable, methodTableTbody.children[i])
            return true
        }
    }

    methodTableTbody.append(rarityTable)
    return false
}









function returnSpeciesRow(location, method, speciesKey, rarity, boss){
    const row = document.createElement("tr"); row.setAttribute("ID", `${location}${speciesKey}${rarity}${boss}`); row.classList = "locationSpeciesRow"

    const spriteContainer = document.createElement("td"); spriteContainer.classList = "locationSpriteContainer"
    const sprite = document.createElement("img"); sprite.src = getSpeciesSpriteSrc(speciesKey); sprite.className = `sprite${speciesKey} miniSprite3`
    if(spritesInfo[`spriteInfo${speciesKey}`]){
        sprite.style.transform = `scale(${spritesInfo[`spriteInfo${speciesKey}`]})`
    }
    spriteContainer.append(sprite)
    row.append(spriteContainer)

    const speciesName = document.createElement("td"); speciesName.innerText = sanitizeString(speciesKey); speciesName.classList = "locationSpeciesName"
    row.append(speciesName)

    const timeOfDayContainer = document.createElement("td"); rarity.classList = "timeOfDayContainer"
    if(locationsMoveFilter){
        moveMethod = speciesCanLearnMove(species[speciesKey], locationsMoveFilter)
        const moveFilter = document.createElement("div"); moveFilter.className = "bold"
        if(Number.isInteger(moveMethod)){
            moveFilter.innerText = `Lv ${moveMethod}`; moveFilter.classList.add("levelUpLearnsets")
        }
        else if(moveMethod === "eggMovesLearnsets"){
            moveFilter.innerText = "Egg"; moveFilter.classList.add("eggMovesLearnsets")
        }
        else if(moveMethod === "TMHMLearnsets"){
            moveFilter.innerText = "TM"; moveFilter.classList.add("TMHMLearnsets")
        }            
        else if(moveMethod === "tutorLearnsets"){
            moveFilter.innerText = "Tutor"; moveFilter.classList.add("tutorLearnsets")
        }
        timeOfDayContainer.append(moveFilter)
    }
    else{
        const timeOfDay = document.createElement("div"); timeOfDay.innerText = method; timeOfDay.classList = `timeOfDay ${method}`; timeOfDay.setAttribute("ID", `${location}\\${method}\\${speciesKey}`)
        timeOfDayContainer.append(timeOfDay)
    }
    if(method == "All" || method == "Anytime"){
        speciesName.colSpan = "2"
        timeOfDayContainer.classList.add("hide")
    }
    row.append(timeOfDayContainer)

    row.addEventListener("click", () => {
        createSpeciesPanel(speciesKey)
        document.getElementById("speciesPanelMainContainer").scrollIntoView(true)
    })

    return row
}







const rarityColor = {"Common": 69.5, "Uncommon": 24.2, "Rare": 5, "Super Rare": 0.98, "Ultra Rare": 0.2, "Boss": 68.8, "Boss Rare": 21.9, "Boss Super Rare": 7.8, "Boss Ultra Rare": 1.6}
function returnRarityTable(location, rarity, boss){
    const rarityTable = document.createElement("table"); rarityTable.setAttribute("ID", `${location}${rarity}${boss}`); rarityTable.classList = "rarityTable"
    const rarityTableThead = document.createElement("thead"); rarityTableThead.classList = "rarityTableThead"; rarityTableThead.innerText = rarity
    if(rarityTableThead.innerText in rarityColor){
        rarityTableThead.style.color = `hsl(${rarityColor[rarityTableThead.innerText]*2},85%,45%)`
    }
    const rarityTableTbody = document.createElement("tbody"); rarityTableTbody.classList = "rarityTableTbody"

    rarityTable.append(rarityTableThead)
    rarityTable.append(rarityTableTbody)

    return rarityTable
}








function returnMethodTable(location, boss){
    const methodTable = document.createElement("table"); methodTable.setAttribute("ID", `${location}${boss}`); methodTable.classList = "methodTable"
    const methodTableTbody = document.createElement("tbody"); methodTableTbody.classList = "methodTableTbody"

    methodTable.append(returnMethodTableThead(boss))
    methodTable.append(methodTableTbody)

    return methodTable
}
function returnMethodTableThead(boss){
    const methodTableThead = document.createElement("thead"); methodTableThead.className = "methodTableThead"
    const row = document.createElement("tr"); row.classList = "methodTableTheadRow"

    const spriteContainer = document.createElement("th")
    const sprite = document.createElement("img"); sprite.src = `https://raw.githubusercontent.com/ydarissep/dex-core/main/sprites/${returnMethodSprite(boss).replaceAll(" ", "_")}.png`; sprite.classList = "locationSprite"
    spriteContainer.append(sprite)
    row.append(spriteContainer)

    let methodContainer = document.createElement("th"); methodContainer.innerText = "Wild"; methodContainer.classList = "methodContainer"
    if(boss){
        methodContainer.innerText = "Boss"
    }
    row.append(methodContainer)

    methodTableThead.append(row)

    return methodTableThead
}








function returnLocationTable(location){
    const locationTable = document.createElement("table"); locationTable.setAttribute("ID", `${location}`); locationTable.classList = "locationTable"
    const locationTableTbody = document.createElement("tbody"); locationTableTbody.classList = "locationTableTbody"

    locationTable.append(returnLocationTableThead(location))
    locationTable.append(locationTableTbody)
    
    return locationTable
}
function returnLocationTableThead(location){
    const locationTableThead = document.createElement("thead"); locationTableThead.classList = "locationTableThead"
    const row = document.createElement("tr")

    const locationName = document.createElement("h1"); locationName.innerText = location
    row.append(locationName)
    locationTableThead.append(row)

    return locationTableThead
}









function returnMethodSprite(boss){
    if(boss){
        return "Raid"
    }
    else{
        return "All"
    }
}