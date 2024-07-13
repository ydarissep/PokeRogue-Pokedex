window.locationsMoveFilter = null

function appendLocationsToTable(key){
    const location = key.split("\\")[0]
    const method = key.split("\\")[1]
    const speciesKey = key.split("\\")[2]
    const boss = /boss/i.test(method)

    if(!(speciesKey in species)){
        return false
    }

    if(!locationsMoveFilter){
        for(let i = 0; i < locationsFilterContainer.children.length; i++){
            if(locationsFilterContainer.children[i].innerText.split(":")[0] == (staticTranslationTable["Move"] ??= "Move")){
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
        if(boss){
            locationTable.children[1].append(methodTable)
        }
        else{
            locationTable.children[1].prepend(methodTable)
        }
    }

    let rarityTable = document.getElementById(`${location}${method}${boss}`) 
    if(!rarityTable){
        rarityTable = returnRarityTable(location, method, boss)
        insertRarityTable(methodTable.children[0], method, rarityTable)
    }

    speciesRow = returnSpeciesRow(location, method, speciesKey)
    insertSpeciesRow(rarityTable.children[1], locations[location][method][speciesKey][0], speciesRow)

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
        if(rarityOrder[rarity] < rarityOrder[methodTableTbody.children[i].children[0].children[0].innerText]){
            methodTableTbody.insertBefore(rarityTable, methodTableTbody.children[i])
            return true
        }
    }

    methodTableTbody.append(rarityTable)
    return false
}









function returnSpeciesRow(location, method, speciesKey){
    const row = document.createElement("tr"); row.classList = "locationSpeciesRow"; row.setAttribute("ID", `${location}\\${method}\\${speciesKey}`)

    const spriteContainer = document.createElement("td"); spriteContainer.classList = "locationSpriteContainer"
    const sprite = document.createElement("img"); sprite.src = getSpeciesSpriteSrc(speciesKey); sprite.className = `sprite${speciesKey} miniSprite3`
    if(spritesInfo[`${speciesKey}`]){
        sprite.style.transform = `scale(${spritesInfo[returnTargetSpeciesSprite(speciesKey)]})`
    }
    spriteContainer.append(sprite)
    row.append(spriteContainer)

    const speciesName = document.createElement("td"); speciesName.innerText = species[speciesKey]["ingameName"]; speciesName.classList = "locationSpeciesName"
    row.append(speciesName)

    const timeOfDayContainer = document.createElement("td"); timeOfDayContainer.classList = "timeOfDayContainer"
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
        locations[location][method][speciesKey].forEach(timeOfDay => {
            const timeOfDayEl = document.createElement("div"); timeOfDayEl.innerText = staticTranslationTable[timeOfDay] ??= timeOfDay; timeOfDayEl.classList = `timeOfDay ${timeOfDay}`
            const timeOfDayElHidden = document.createElement("div"); timeOfDayElHidden.innerText = timeOfDay; timeOfDayElHidden.classList = "hide"
            timeOfDayContainer.append(timeOfDayElHidden)
            timeOfDayContainer.append(timeOfDayEl)
            if(timeOfDay == "All" || timeOfDay == "Anytime"){
                speciesName.colSpan = "2"
                timeOfDayContainer.classList.add("hide")
            }
        })
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
    const rarityTableThead = document.createElement("thead"); rarityTableThead.classList = "rarityTableThead"; rarityTableThead.innerText = staticTranslationTable[rarity] ??= rarity
    const rariryHidden = document.createElement("div"); rariryHidden.classList = "hide"; rariryHidden.innerText = rarity
    if(rarity in rarityColor){
        rarityTableThead.style.color = `hsl(${rarityColor[rarity]*2},85%,45%)`
    }
    const rarityTableTbody = document.createElement("tbody"); rarityTableTbody.classList = "rarityTableTbody"

    rarityTableThead.append(rariryHidden)
    rarityTable.append(rarityTableThead)
    rarityTable.append(rarityTableTbody)

    return rarityTable
}








function returnMethodTable(location, boss){
    const methodTable = document.createElement("table"); methodTable.setAttribute("ID", `${location}${boss}`); methodTable.classList = "methodTable"
    const methodTableTbody = document.createElement("tbody"); methodTableTbody.classList = "methodTableTbody"

    //methodTable.append(returnMethodTableThead(boss)) // do not uncomment kekw, it's broken
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

    const mainBiomeContainer = document.createElement("th"); mainBiomeContainer.classList = "mainBiomeContainer"
    const locationName = document.createElement("div"); locationName.innerText = location; locationName.classList = "locationName"
    if(location in biomeTranslation){
        locationName.innerText = biomeTranslation[location]
    }
    const locationSprite = document.createElement("img"); locationSprite.src = getBiomeSpriteSrc(location); locationSprite.classList = `sprite${location} mainBiomeSprite`
    mainBiomeContainer.append(locationName)
    mainBiomeContainer.append(locationSprite)

    const previousBiomeContainer = document.createElement("th"); previousBiomeContainer.classList = "previousBiomeContainer"
    Object.keys(biomeLinks).forEach(biome => {
        biomeLinks[biome].forEach(link => {
            if(link[0] === location){
                const linkContainer = document.createElement("div"); linkContainer.classList = "previousLink"
                const linkInfo = document.createElement("span"); linkInfo.innerText = `${biome}\n${link[1]}%`; linkInfo.classList = "previousLinkInfo"
                if(biome in biomeTranslation){
                    linkInfo.innerText = `${biomeTranslation[biome]}\n${link[1]}%`
                }
                const linkSprite = document.createElement("img"); linkSprite.src = getBiomeSpriteSrc(biome); linkSprite.classList = `linkSprite sprite${biome}`
                linkContainer.append(linkSprite)
                linkContainer.append(linkInfo)
                previousBiomeContainer.append(linkContainer)
                linkContainer.addEventListener("click", async () => {
                    if(!locationsButton.classList.contains("activeButton")){
                        tracker = locationsTracker
                        await tableButtonClick("locations")
                    }
                    deleteFiltersFromTable()

                    if(biome in biomeTranslation){
                        createFilter(biomeTranslation[biome], "Biome")
                    }
                    else{
                        createFilter(biome, "Biome")
                    }
                    speciesPanel("hide")
                    window.scrollTo({ top: 0})
                })
            }
        })
    })

    const nextBiomeContainer = document.createElement("th"); nextBiomeContainer.classList = "nextBiomeContainer"
    if(location in biomeLinks){
        biomeLinks[location].forEach(link => {
            const linkContainer = document.createElement("div"); linkContainer.classList = "nextLink"
            const linkInfo = document.createElement("span"); linkInfo.innerText = `${link[0]}\n${link[1]}%`; linkInfo.classList = "nextLinkInfo"
            if(link[0] in biomeTranslation){
                linkInfo.innerText = `${biomeTranslation[link[0]]}\n${link[1]}%`
            }
            const linkSprite = document.createElement("img"); linkSprite.src = getBiomeSpriteSrc(link[0]); linkSprite.classList = `linkSprite sprite${link[0]}`
            linkContainer.append(linkInfo)
            linkContainer.append(linkSprite)
            nextBiomeContainer.append(linkContainer)
            linkContainer.addEventListener("click", async () => {
                if(!locationsButton.classList.contains("activeButton")){
                    tracker = locationsTracker
                    await tableButtonClick("locations")
                }
                deleteFiltersFromTable()

                if(link[0] in biomeTranslation){
                    createFilter(biomeTranslation[link[0]], "Biome")
                }
                else{
                    createFilter(link[0], "Biome")
                }
                speciesPanel("hide")
                window.scrollTo({ top: 0})
            })
        })
    }
    /*
    if(hideLinksFilter.classList.contains("activeSetting")){
        previousBiomeContainer.classList.add("hide")
        nextBiomeContainer.classList.add("hide")
    }
    */

    row.append(previousBiomeContainer)
    row.append(mainBiomeContainer)
    row.append(nextBiomeContainer)
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




function getBiomeSpriteSrc(biome){
    if(sprites[biome]){
        if(sprites[biome].length < 500){
            localStorage.removeItem(biome)
            spriteBiomeLocalStorageBase64(biome)
            return `https://raw.githubusercontent.com/${repo}/public/images/arenas/${biome.toLowerCase().replaceAll(/-| /g, "_")}_bg.png`
        }
        else{
            return sprites[biome]
        }
    }
    else{
        spriteBiomeLocalStorageBase64(biome)
        return `https://raw.githubusercontent.com/${repo}/public/images/arenas/${biome.toLowerCase().replaceAll(/-| /g, "_")}_bg.png`
    }
}







function spriteBiomeLocalStorageBase64(biome){
    let append = ["bg", "a", "b"]
    if(biome === "End"){
        append = ["bg"]
    }
    let sprite = []
    let completed = []
    let mainCanvas = document.createElement("canvas")
    const mainContext = mainCanvas.getContext('2d')
    mainCanvas.width = 320
    mainCanvas.height = 132
    for(let i = 0; i < append.length; i++){
        sprite.push(new Image())

        sprite[i].crossOrigin = 'anonymous'
        sprite[i].src = `https://raw.githubusercontent.com/${repo}/public/images/arenas/${biome.toLowerCase().replaceAll(/-| /g, "_")}_${append[i]}.png`


        sprite[i].onload = async () => {
            completed.push(i)
            if(completed.length == append.length){
                for(let j = 0; j < sprite.length; j++){
                    let canvas = document.createElement("canvas")
                    canvas.width = 320
                    canvas.height = 132
                    if(append[j] == "a" || append[j] == "b"){
                        canvas.width = 320
                        canvas.height = 132
                    }
                    const context = canvas.getContext('2d')
                    context.clearRect(0, 0, canvas.width, canvas.height)
                    context.drawImage(sprite[j], 0, 0)
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
                    const mainImageData = mainContext.getImageData(0, 0, mainCanvas.width, mainCanvas.height)
                    for(let k = 0; k < imageData.data.length; k += 4) {
                        if(imageData.data[k + 3] > 0){
                            mainImageData.data[k] = imageData.data[k]
                            mainImageData.data[k + 1] = imageData.data[k + 1]
                            mainImageData.data[k + 2] = imageData.data[k + 2]
                            mainImageData.data[k + 3] = imageData.data[k + 3]
                        }
                    }
                    mainContext.putImageData(mainImageData, 0, 0)
                }
                if(!localStorage.getItem(biome)){
                    localStorage.setItem(biome, LZString.compressToUTF16(mainCanvas.toDataURL()))
                    sprites[biome] = mainCanvas.toDataURL()
                }
                const els = document.getElementsByClassName(`sprite${biome}`)
                for(let l = 0; l < els.length; l++){
                    els[l].src = mainCanvas.toDataURL()
                }
            }
        }
    }
}