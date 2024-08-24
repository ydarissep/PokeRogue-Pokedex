fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/speciesPanelUtility.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replaceAll("row.append(movedescription)", "row.append(returnMoveDescription(move))")
    const textMatch = Array.from(new Set(text.match(/\w+\.src\s*=\s*getSpeciesSpriteSrc\(.*?\)/ig)))
    if(textMatch){
        textMatch.forEach(srcMatch => {
            const el = srcMatch.match(/(\w+)\./)[1]
            const speciesNameTemp = srcMatch.match(/getSpeciesSpriteSrc\((.*?)\)/)[1].trim()

            text = text.replaceAll(srcMatch, `if(spritesInfo[returnTargetSpeciesSprite(${speciesNameTemp})]){${el}.style.transform = \`scale(\${spritesInfo[returnTargetSpeciesSprite(${speciesNameTemp})]})\`}\n${srcMatch}`)
        })
    }

    text = text.replace("speciesAbilitiesMainContainer.classList.remove(\"hide\")", "prependAbilityStarterEl(name)\nspeciesAbilitiesMainContainer.classList.remove(\"hide\")")
    text = text.replace("speciesEggGroups.append(eggGroup1)", "speciesEggGroups.append(eggGroup1)\nspeciesEggGroups.prepend(returnStarterCostEl(name))\nspeciesPanelWeight.innerText = `${species[name][\"weight\"]} kg`")
    text = text.replace("speciesSprite.src = getSpeciesSpriteSrc(name)", "handleVariants()\nappendBiomes(name)\nsetPanelSpeciesMainSpriteSrc(backIconContainer.classList.contains('backActive'), femaleIconContainer.classList.contains('femaleActive'))")
    text = text.replace('speciesName.innerText = sanitizeString(name)', 'speciesName.innerText = species[name]["ingameName"]')
    text = text.replace('name.innerText = sanitizeString(species[speciesName]["name"])', 'name.innerText = species[speciesName]["ingameName"]')
    text = text.replaceAll("checkType.innerText = sanitizeString(type)", 'checkType.innerText = translationTable[sanitizeString(type)] ??= sanitizeString(type)')
    text = text.replace('speciesType1.innerText = sanitizeString(species[name]["type1"])', 'speciesType1.innerText = translationTable[sanitizeString(species[name]["type1"])] ??= sanitizeString(species[name]["type1"])')
    text = text.replace('speciesType2.innerText = sanitizeString(species[name]["type2"])', 'speciesType2.innerText = translationTable[sanitizeString(species[name]["type2"])] ??= sanitizeString(species[name]["type2"])')
    text = text.replace('sanitizeString(moves[move]["type"]).slice(0,3)', '(translationTable[sanitizeString(moves[move]["type"])] ??= sanitizeString(moves[move]["type"])).slice(0,3)')
    text = text.replaceAll('sanitizeString(moves[move[0]]["type"]).slice(0,3)', '(translationTable[sanitizeString(moves[move[0]]["type"])] ??= sanitizeString(moves[move[0]]["type"])).slice(0,3)')
    text = text.replace("function sortLearnsetsArray(", "function sortLearnsetsArrayOld(")
    text = text.replace("function buildSpeciesPanelSingleLearnsetsTable", "function buildSpeciesPanelSingleLearnsetsTableOld")
    
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})








function buildSpeciesPanelSingleLearnsetsTable(table, name, input, label = "", asc = 0){
    const eggMovesTable = table.id == "speciesPanelEggMovesTable"
    const rareEggMove = species[name][input].slice(-1)[0] 

    const Tbody = table.querySelector("tbody")
    const THead = table.querySelector("thead")

    if(!Tbody || !THead){
        return
    }

    while(Tbody.firstChild){
        Tbody.removeChild(Tbody.firstChild)
    }

    sortLearnsetsArray(THead, species[name][input].slice(0), label, asc).forEach(move => {
        const row = document.createElement("tr")

        const moveName = document.createElement("td")
        moveName.innerText = moves[move]["ingameName"]
        moveName.className = "bold"
        if(eggMovesTable && rareEggMove == move){
            moveName.classList.add("underline")
        }
        row.append(moveName)

        const typeContainer = document.createElement("td")
        const type = document.createElement("div")
        type.innerText = sanitizeString(moves[move]["type"]).slice(0,3)
        type.className = `${moves[move]["type"]} backgroundSmall`
        typeContainer.append(type)
        row.append(typeContainer)

        const splitContainer = document.createElement("td")
        const splitIcon = document.createElement("img")
        splitIcon.src = `src/moves/${moves[move]["split"]}.png`
        splitIcon.className = `${sanitizeString(moves[move]["split"])} splitIcon`
        splitContainer.append(splitIcon)
        row.append(splitContainer)

        const power = document.createElement("td")
        power.className = "speciesPanelLearnsetsPower"
        if(moves[move]["power"] > 0){
            power.innerText = moves[move]["power"]
        }
        else{
            power.innerText = "-"   
        }
        row.append(power)

        const accuracy = document.createElement("td")
        accuracy.className = "speciesPanelLearnsetsAccuracy"
        if(moves[move]["accuracy"] > 0){
            accuracy.innerText = moves[move]["accuracy"]
        }
        else{
            accuracy.innerText = "-"   
        }
        row.append(accuracy)

        const PP = document.createElement("td")
        PP.className = "speciesPanelLearnsetsPP"
        PP.innerText = moves[move]["PP"]
        row.append(PP)

        const movedescription = document.createElement("td")
        movedescription.className = "speciesPanelLearnsetsEffect"
        movedescription.innerText += moves[move]["description"].join("")

        row.addEventListener('click', function () {
            createPopupForMove(moves[move])
            overlay.style.display = 'block'
        }) 

        row.append(movedescription)

        Tbody.append(row)
    })
}










function sortLearnsetsArray(thead, learnsetsArray, label, asc){
    let index = ""

    if(asc == 0){
        thead.querySelectorAll("th").forEach(th => {
            if(th.classList.contains("th-sort-asc")){
                asc = 1
                label = th.innerText
            }
            else if(th.classList.contains("th-sort-desc")){
                asc = -1
                label = th.innerText
            }
        })
    }


    if(asc == 0){
        return learnsetsArray
    }

    if(label === (staticTranslationTable["Name"] ??= "Name")){
        index = "name"
    }
    else if(label === (staticTranslationTable["Type"] ??= "Type")){
        index = "type"
    }
    else if(label === (staticTranslationTable["Split"] ??= "Split")){
        index = "split"
    }
    else if(label === (staticTranslationTable["Power"] ??= "Power")){
        index = "power"
    }
    else if(label === (staticTranslationTable["Level"] ??= "Level")){
        index = "level"
    }
    else if(label === (staticTranslationTable["Acc"] ??= "Acc")){
        index = "accuracy"
    }
    else if(label === (staticTranslationTable["Effect"] ??= "Effect") || label === "Effect"){
        index = "description"
    }
    else if(label === (staticTranslationTable["PP"] ??= "PP")){
        index = "PP"
    }
    else{
        return learnsetsArray
    }

    learnsetsArray.sort((a, b) => {
        let stringA = ""
        let stringB = ""

        if(index === "level"){
            stringA = parseInt(a[1])
            stringB = parseInt(b[1])
        }
        else if(Array.isArray(a)){
            stringA += moves[a[0]][index]
            stringB += moves[b[0]][index]
    
            if(!isNaN(stringA)){
                stringA = parseInt(moves[a[0]][index])
            }
            if(!isNaN(stringB)){
                stringB = parseInt(moves[b[0]][index])
            }
        }
        else{
            stringA += moves[a][index]
            stringB += moves[b][index]
    
            if(!isNaN(stringA)){
                stringA = parseInt(moves[a][index])
            }
            if(!isNaN(stringB)){
                stringB = parseInt(moves[b][index])
            }
        }

        return stringA > stringB ? (1 * asc) : (-1 * asc)
    })

    thead.querySelectorAll("th").forEach(th => {
        th.classList.remove("th-sort-asc", "th-sort-desc")
        if(th.innerText === label){
            th.classList.toggle("th-sort-asc", asc > 0)
            th.classList.toggle("th-sort-desc", asc < 0)
        }
    })

    return learnsetsArray
}








async function setPanelSpeciesMainSpriteSrc(back = false, female = false, animate = animateIconContainer.classList.contains("animateActive")){
    let extra = ""
    if(back && female && sprites[`BACK_F_${panelSpecies}`]){
        extra = "BACK_F"
    }
    else if(female && sprites[`F_${panelSpecies}`]){
        extra = "F"
    }
    else if(back && sprites[`BACK_${panelSpecies}`]){
        extra = "BACK"
    }

    if(sprites[`${extra}_${panelSpecies}`]){
        speciesSprite.src = sprites[`${extra}_${panelSpecies}`]
    }
    else{
        speciesSprite.src = getSpeciesSpriteSrc(panelSpecies)
    }
    setPanelSpeciesMainSpriteScaling(back, female)

    let index = variantsContainer.querySelector(".activeVariant")
    if(animate && (!index || (index && index.classList.contains("hide")))){
        await downloadAndAnimateSheet(back, female)
    }
}
function setPanelSpeciesMainSpriteScaling(back = false, female = false){
    let extra = ""
    if(back && female && sprites[`BACK_F_${panelSpecies}`]){
        extra = "BACK_F"
    }
    else if(female && sprites[`F_${panelSpecies}`]){
        extra = "F"
    }
    else if(back && sprites[`BACK_${panelSpecies}`]){
        extra = "BACK"
    }
    if(sprites[`${extra}_${panelSpecies}`] && spritesInfo[`${extra}_${panelSpecies}`]){
        speciesSprite.style.transform = `scale(${spritesInfo[`${extra}_${panelSpecies}`]})`
    }
    else{
        speciesSprite.style.transform = `scale(${spritesInfo[panelSpecies]})`
    }
}






function appendBiomes(speciesName){
    while(speciesPanelBiomesContainer.lastChild){
        speciesPanelBiomesContainer.removeChild(speciesPanelBiomesContainer.lastChild)
    }



    const locationsKey = Object.keys(locations)
    biomeLoop:for(let i = 0; i < locationsKey.length; i++){
        const rarityKey = Object.keys(locations[locationsKey[i]])
        for(let j = 0; j < rarityKey.length; j++){
            const speciesKey = Object.keys(locations[locationsKey[i]][rarityKey[j]])
            for(let k = 0; k < speciesKey.length; k++){
                if(checkBiome(speciesName, speciesKey[k])){
                    const speciesPanelBiome = document.createElement("div"); speciesPanelBiome.innerText = locationsKey[i]; speciesPanelBiome.classList = "hyperlink speciesPanelTextPadding"
                    if(locationsKey[i] in biomeTranslation){
                        speciesPanelBiome.innerText = biomeTranslation[locationsKey[i]]
                    }
                    speciesPanelBiomesContainer.append(speciesPanelBiome)

                    speciesPanelBiome.addEventListener("click", async() => {
                        if(!locationsButton.classList.contains("activeButton")){
                            tracker = locationsTracker
                            await tableButtonClick("locations")
                        }
                        deleteFiltersFromTable()
        
                        if(locationsKey[i] in biomeTranslation){
                            createFilter(biomeTranslation[locationsKey[i]], "Biome")
                        }
                        else{
                            createFilter(locationsKey[i], "Biome")
                        }
                        speciesPanel("hide")

                        document.getElementById(`${locationsKey[i]}\\${rarityKey[j]}\\${speciesKey[k]}`).scrollIntoView({ behavior: "smooth", block: "center" })
                        document.getElementById(`${locationsKey[i]}\\${rarityKey[j]}\\${speciesKey[k]}`).classList.add("scrollIntoViewLocationFocus")
                    })

                    continue biomeLoop
                }
            }
        }
    }

    if(speciesPanelBiomesContainer.children.length > 0){
        const speciesPanelBiomeText = document.createElement("div"); speciesPanelBiomeText.innerText = "Biomes:"; speciesPanelBiomeText.classList = "speciesPanelText"
        if("Biomes" in staticTranslationTable){
            speciesPanelBiomeText.innerText = `${staticTranslationTable["Biomes"]}:`
        }
        speciesPanelBiomesContainer.prepend(speciesPanelBiomeText)

        if(speciesPanelBiomesContainer.children.length > 5){
            speciesPanelBiomesContainer.classList.add("minimizeBiomes")
        }
        else{
            speciesPanelBiomesContainer.classList.remove("minimizeBiomes")
        }
    }
}





function checkBiome(speciesName, targetSpecies){
    if(speciesName == targetSpecies){
        return true
    }
    for(let i = 0; i < species[targetSpecies]["evolution"].length; i++){
        const targetEvo = species[targetSpecies]["evolution"][i][2]
        if(targetEvo == speciesName){
            return true
        }
        for(let j = 0; j < species[targetEvo]["evolution"].length; j++){
            if(species[targetEvo]["evolution"][j][2] == speciesName){
                return true
            }
        }
    }
}





function returnStarterCostEl(speciesName){
    const starterCost = document.createElement("div")
    starterCost.innerText = species[speciesName]["starterCost"]
    starterCost.classList = "starterCost"
    return starterCost
}



function returnMoveDescription(move){
    let moveName = move
    if(!(typeof move === "string")){
        moveName = move[0]
    }

    const movedescriptionContainer = document.createElement("td")
    movedescriptionContainer.className = "speciesPanelLearnsetsEffect"
    moves[moveName]["description"].forEach(desc => {
        const moveDesc = document.createElement("div"); moveDesc.innerText = desc
        movedescriptionContainer.append(moveDesc)
    })

    return movedescriptionContainer
}




function prependAbilityStarterEl(name){
    const abilityContainer = document.createElement("div"); abilityContainer.className = "flex wrap"
    const abilityName = document.createElement("span"); abilityName.innerText = abilities[species[name]["starterAbility"]]["ingameName"]; abilityName.classList = "hyperlink starterAbility"
    const abilityDescription = document.createElement("span"); abilityDescription.innerText = abilities[species[name]["starterAbility"]]["description"]; abilityDescription.className = "speciesPanelAbilitiesDescriptionPadding"

    abilityName.addEventListener("click", async() => {
        if(!speciesButton.classList.contains("activeButton")){
            tracker = speciesTracker
            await tableButtonClick("species")
        }
        deleteFiltersFromTable()

        createFilter(abilities[species[name]["starterAbility"]]["ingameName"], "Ability")
        speciesPanel("hide")
        window.scrollTo({ top: 0})
    })

    abilityContainer.append(abilityName)
    abilityContainer.append(abilityDescription)
    speciesAbilities.prepend(abilityContainer)
}






function insertVariantsContainer(){
    window.variantsContainer = document.createElement("div"); variantsContainer.setAttribute("ID", "variantsContainer")
    document.getElementById("speciesPanelContainer").insertBefore(variantsContainer, document.getElementById("speciesPanelSubcontainer2"))
    
    for(let i = 0; i < 3; i++){
        const variantContainer = document.createElement("div"); variantContainer.setAttribute("ID", `variantContainer${i}`); variantContainer.className = "variantContainer"
        const variantSprite = document.createElement("img"); variantSprite.src = `https://raw.githubusercontent.com/ydarissep/PokeRogue-Pokedex/main/sprites/shiny${i}.png`

        variantContainer.append(variantSprite)
        variantsContainer.append(variantContainer)

        variantContainer.addEventListener("click", async () => {
            fetchVarSprite(variantContainer, i, true)
        })
    }





    window.femaleIconContainer = document.createElement("div"); femaleIconContainer.setAttribute("ID", "femaleIconContainer"); femaleIconContainer.className = "femaleIconContainer"
    const femaleIconSprite = document.createElement("img"); femaleIconSprite.src = `https://raw.githubusercontent.com/ydarissep/PokeRogue-Pokedex/main/sprites/female.png`

    femaleIconContainer.append(femaleIconSprite)
    variantsContainer.append(femaleIconContainer)





    window.backIconContainer = document.createElement("div"); backIconContainer.setAttribute("ID", "backIconContainer"); backIconContainer.className = "backIconContainer"
    const backIconSprite = document.createElement("img"); backIconSprite.src = `https://raw.githubusercontent.com/ydarissep/PokeRogue-Pokedex/main/sprites/back.png`

    backIconContainer.append(backIconSprite)
    variantsContainer.append(backIconContainer)





    window.animateIconContainer = document.createElement("div"); animateIconContainer.setAttribute("ID", "animateIconContainer"); animateIconContainer.className = "animateIconContainer"
    const animateIconSprite = document.createElement("img"); animateIconSprite.src = `https://raw.githubusercontent.com/ydarissep/PokeRogue-Pokedex/main/sprites/animate.png`

    animateIconContainer.append(animateIconSprite)
    variantsContainer.append(animateIconContainer)





    const toggleActive = ["femaleActive", "backActive", "animateActive"]
    const iconContainers = [femaleIconContainer, backIconContainer, animateIconContainer]
    for(let i = 0; i < iconContainers.length; i++){
        iconContainers[i].addEventListener("click", async () => {
            iconContainers[i].classList.toggle(toggleActive[i])
            for(let j = 0; j < 3; j++){
                if(variantsContainer.children[j].classList.contains("activeVariant") && !variantsContainer.children[j].classList.contains("hide")){
                    fetchVarSprite(variantsContainer.children[j], j, false)
                    break
                }
                if(j === 2){
                    setPanelSpeciesMainSpriteSrc(backIconContainer.classList.contains("backActive"), femaleIconContainer.classList.contains("femaleActive"))
                }
            }
        })
    }
}





function fetchVarSprite(variantContainer, i, clicked = false, back = false, female = false){
    if(backIconContainer.classList.contains("backActive")){
        back = true
        if(species[panelSpecies]["backF"].length > 0){
            if(femaleIconContainer.classList.contains("femaleActive")){
                female = true
            }
        }
    }
    else{
        if(species[panelSpecies]["variantF"].length > 0){
            if(femaleIconContainer.classList.contains("femaleActive")){
                female = true
            }
        }
    }

    const targetSpecies = returnTargetSpeciesSprite(panelSpecies)
    if(variantContainer.classList.contains("activeVariant") && clicked){
        variantContainer.classList.remove("activeVariant")
        setPanelSpeciesMainSpriteSrc(back, female)
    }
    else{
        for(let j = 0; j < 3; j++){
            variantsContainer.children[j].classList.remove("activeVariant")
        }

        if(back && female && species[targetSpecies]["backF"][i] == undefined){
            i = 0
        }
        else if(female && species[targetSpecies]["variantF"][i] == undefined){
            i = 0
        }

        let method = species[targetSpecies]["variant"][i]
        if(female){
            method = species[targetSpecies]["variantF"][i]
        }

        if(back){
            method = species[targetSpecies]["back"][i]
            if(female){
                method = species[targetSpecies]["backF"][i]
            }
        }

        if(method == 0 || method == 2){
            downloadVarSprite(targetSpecies, i, method, back, female)
        }
        else if(method == 1){
            applyPalVar(targetSpecies, i, back, female)
        }
        else{
            speciesSprite.src = sprites[panelSpecies]
        }
        variantContainer.classList.add("activeVariant")
    }
}






function handleVariants(){
    if(species[panelSpecies]["variantF"].length > 0){
        femaleIconContainer.classList.remove("hide")
    }
    else{
        femaleIconContainer.classList.add("hide")
    }

    for(let i = 0; i < 3; i++){
        //variantsContainer.children[i].classList.remove("activeVariant") // Uncomment to disable automatic shiny when changing species
        if(typeof species[panelSpecies]["variant"][i] !== "undefined"){
            variantsContainer.children[i].classList.remove("hide")
            if(variantsContainer.children[i].classList.contains("activeVariant")){
                fetchVarSprite(variantsContainer.children[i], i, false)
            }
        }
        else{
            variantsContainer.children[i].classList.add("hide")
        }
    }
}






async function downloadVarSprite(speciesName, index, method, back, female){
    let sprite = new Image()
    let canvas = document.createElement("canvas")

    let canvasWidth = 64
    let canvasHeight = 64
    let frameX = 0
    let frameY = 0

    let spritePath = species[speciesName]["sprite"]
    if(method == 2){
        spritePath += `_${index + 1}`
    }
    
    const rawJson = await fetch(returnSpriteURL(back, female, spritePath, "json", method))
    const json = await rawJson.json()

    let i = 0
    if("textures" in json){
        for(i = 0; i < json["textures"][0]["frames"].length; i++){
            if(json["textures"][0]["frames"][i]["filename"] === "0001.png"){
                canvasWidth = json["textures"][0]["frames"][i]["frame"]["w"]
                canvasHeight = json["textures"][0]["frames"][i]["frame"]["h"]
                frameX = json["textures"][0]["frames"][i]["frame"]["x"]
                frameY = json["textures"][0]["frames"][i]["frame"]["y"]
                break
            }
        }
        if(i == json["textures"][0]["frames"].length){
            canvasWidth = json["textures"][0]["frames"][0]["frame"]["w"]
            canvasHeight = json["textures"][0]["frames"][0]["frame"]["h"]
            frameX = json["textures"][0]["frames"][0]["frame"]["x"]
            frameY = json["textures"][0]["frames"][0]["frame"]["y"]
        }
    }
    else{
        for(i = 0; i < json["frames"].length; i++){
            if(json["frames"][i]["filename"] === "0001.png"){
                canvasWidth = json["frames"][i]["frame"]["w"]
                canvasHeight = json["frames"][i]["frame"]["h"]
                frameX = json["frames"][i]["frame"]["x"]
                frameY = json["frames"][i]["frame"]["y"]
                break
            }
        }
        if(i == json["frames"].length){
            canvasWidth = json["frames"][0]["frame"]["w"]
            canvasHeight = json["frames"][0]["frame"]["h"]
            frameX = json["frames"][0]["frame"]["x"]
            frameY = json["frames"][0]["frame"]["y"]
        }
    }

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    sprite.crossOrigin = 'anonymous'
    sprite.src = returnSpriteURL(back, female, spritePath, "png", method)

    const context = canvas.getContext('2d')

    sprite.onload = async () => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(sprite, -frameX, -frameY)

        speciesSprite.src = canvas.toDataURL()
        setPanelSpeciesMainSpriteScaling(back, female)

        if(animateIconContainer.classList.contains("animateActive")){
            if((back && species[speciesName]["backExp"].length > 0) || species[speciesName]["exp"].length > 0){
                await downloadAndAnimateSheet(back, female)
            }
            else{
                await handleSheetAnimation(speciesName, back, female, sprite, json)
            }
        }
    }
}










async function applyPalVar(speciesName, index, back, female){
    let sprite = new Image()
    let canvas = document.createElement("canvas")

    let extra = ""
    if(back && female && sprites[`BACK_F_${panelSpecies}`]){
        extra = "BACK_F"
    }
    else if(female && sprites[`F_${panelSpecies}`]){
        extra = "F"
    }
    else if(back && sprites[`BACK_${panelSpecies}`]){
        extra = "BACK"
    }
    if(sprites[`${extra}_${panelSpecies}`]){
        sprite.src = sprites[`${extra}_${panelSpecies}`]
    }
    else{
        sprite.src = getSpeciesSpriteSrc(panelSpecies)
    }

    const rawJson = await fetch(returnSpriteURL(back, female, species[speciesName]["sprite"], "json", 1))
    const json = await rawJson.json()

    let pal = {}
    for(let i = 0; i < Object.keys(json[index]).length; i++){
        const jsonKey = Object.keys(json[index])[i]
        pal[`${parseInt(jsonKey.slice(0, 2), 16)},${parseInt(jsonKey.slice(2, 4), 16)},${parseInt(jsonKey.slice(4, 6), 16)}`] = [parseInt(json[index][jsonKey].slice(0, 2), 16),parseInt(json[index][jsonKey].slice(2, 4), 16),parseInt(json[index][jsonKey].slice(4, 6), 16)]
    }

    canvas.width = sprite.width
    canvas.height = sprite.height

    const context = canvas.getContext('2d')

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(sprite, 0, 0)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    for(let i = 0; i < imageData.data.length; i += 4){
        if(`${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]}` in pal){
            const palKey = `${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]}`
            imageData.data[i] = pal[palKey][0]
            imageData.data[i + 1] = pal[palKey][1]
            imageData.data[i + 2] = pal[palKey][2]
        }
    }
    
    context.putImageData(imageData, 0, 0)
    speciesSprite.src = canvas.toDataURL()
    setPanelSpeciesMainSpriteScaling(back, female)

    if(animateIconContainer.classList.contains("animateActive")){
        await downloadAndAnimateSheet(back, female)
    }
}













async function getSpriteInfo(speciesName, species, back = false, female = false){
    let extra = ""
    if(back && female){
        extra += "BACK_F"
    }
    else if(female){
        extra += "F"
    }
    else{
        extra = "BACK"
    }

    let sprite = new Image()
    let canvas = document.createElement("canvas")

    let canvasWidth = 64
    let canvasHeight = 64
    let frameX = 0
    let frameY = 0

    const rawJson = await fetch(returnSpriteURL(back, female, species[speciesName]["sprite"], "json"))
    const json = await rawJson.json()

    let i = 0
    if("textures" in json){
        for(i = 0; i < json["textures"][0]["frames"].length; i++){
            if(json["textures"][0]["frames"][i]["filename"] === "0001.png"){
                canvasWidth = json["textures"][0]["frames"][i]["frame"]["w"]
                canvasHeight = json["textures"][0]["frames"][i]["frame"]["h"]
                frameX = json["textures"][0]["frames"][i]["frame"]["x"]
                frameY = json["textures"][0]["frames"][i]["frame"]["y"]
                break
            }
        }
        if(i == json["textures"][0]["frames"].length){
            canvasWidth = json["textures"][0]["frames"][0]["frame"]["w"]
            canvasHeight = json["textures"][0]["frames"][0]["frame"]["h"]
            frameX = json["textures"][0]["frames"][0]["frame"]["x"]
            frameY = json["textures"][0]["frames"][0]["frame"]["y"]
        }
    }
    else{
        for(i = 0; i < json["frames"].length; i++){
            if(json["frames"][i]["filename"] === "0001.png"){
                canvasWidth = json["frames"][i]["frame"]["w"]
                canvasHeight = json["frames"][i]["frame"]["h"]
                frameX = json["frames"][i]["frame"]["x"]
                frameY = json["frames"][i]["frame"]["y"]
                break
            }
        }
        if(i == json["frames"].length){
            canvasWidth = json["frames"][0]["frame"]["w"]
            canvasHeight = json["frames"][0]["frame"]["h"]
            frameX = json["frames"][0]["frame"]["x"]
            frameY = json["frames"][0]["frame"]["y"]
        }
    }

    if(canvasWidth > canvasHeight){
        spritesInfo[`${extra}_${speciesName}`] = `1, ${1 / (canvasWidth / canvasHeight)}`
    }
    else{
        spritesInfo[`${extra}_${speciesName}`] = `${1 / (canvasHeight / canvasWidth)}, 1`
    }

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    sprite.crossOrigin = 'anonymous'
    sprite.src = returnSpriteURL(back, female, species[speciesName]["sprite"], "png")

    const context = canvas.getContext('2d')

    sprite.onload = async () => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(sprite, -frameX, -frameY)

        if(!localStorage.getItem(`${extra}_${speciesName}`)){
            localStorage.setItem(`${extra}_${speciesName}`, await LZString.compressToUTF16(canvas.toDataURL()))
            localStorage.setItem(`spriteInfo${extra}${speciesName}`, spritesInfo[`${extra}_${speciesName}`])
        }
        sprites[`${extra}_${speciesName}`] = canvas.toDataURL()
    }
}












function returnSpriteURL(back = false, female = false, id = "1", extension = "png", method = -1, exp = false){
    let url = `https://raw.githubusercontent.com/${repo}/public/images/pokemon/`
    if(exp){
        if(method == 1 || method == 2){
            url += "variant/"
        }
        url += "exp/"
    }
    else if(method == 1 || method == 2){
        url += "variant/"
    }
    if(back){
        url += "back/"
    }
    if(method == 0){
        url += "shiny/"
    }
    if(female){
        url += "female/"
    }
    url += `${id}.${extension}`

    return url
}









window.animateCounter = 0
async function handleSheetAnimation(speciesName, back, female, sheet, json){
    let sheetSpecies = null
    let index = variantsContainer.querySelector(".activeVariant")
    let frameCounter = 1
    let canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128

    window.spriteAnimation = {"sheet": sheet, "frames": {}}
    if("textures" in json){
        if(json["textures"][0]["frames"].length == 1){
            animateIconContainer.classList.add("hide")
            return
        }
        else{
            animateIconContainer.classList.remove("hide")
        }
        canvas.width = json["textures"][0]["frames"][i]["sourceSize"]["w"]
        canvas.height = json["textures"][0]["frames"][i]["sourceSize"]["h"]

        sheetSpecies = json["textures"][0]["image"].replace(/(?:_\d)?\.png$/, "")
        
        for(let i = 0; i < json["textures"][0]["frames"].length; i++){
            spriteAnimation["frames"][parseInt(json["textures"][0]["frames"][i]["filename"].replace(".png", ""))] = [json["textures"][0]["frames"][i]["frame"]["w"], json["textures"][0]["frames"][i]["frame"]["h"], json["textures"][0]["frames"][i]["frame"]["x"], json["textures"][0]["frames"][i]["frame"]["y"], json["textures"][0]["frames"][i]["spriteSourceSize"]["x"], json["textures"][0]["frames"][i]["spriteSourceSize"]["y"]]
        }
    }
    else{
        if(json["frames"].length == 1){
            animateIconContainer.classList.add("hide")
            return
        }
        else{
            animateIconContainer.classList.remove("hide")
        }
        canvas.width = json["frames"][i]["sourceSize"]["w"]
        canvas.height = json["frames"][i]["sourceSize"]["h"]

        sheetSpecies = json["meta"]["image"].replace(/(?:_\d)?\.png$/, "")

        for(let i = 0; i < json["frames"].length; i++){
            spriteAnimation["frames"][parseInt(json["frames"][i]["filename"].replace(".png", ""))] = [json["frames"][i]["frame"]["w"], json["frames"][i]["frame"]["h"], json["frames"][i]["frame"]["x"], json["frames"][i]["frame"]["y"], json["frames"][i]["spriteSourceSize"]["x"], json["frames"][i]["spriteSourceSize"]["y"]]
        }
    }
    spriteAnimation["width"] = canvas.width
    spriteAnimation["height"] = canvas.height
    if(index && !index.classList.contains("hide")){
        spriteAnimation["index"] = parseInt(index.id.match(/\d/)[0])
    }
    else{
        spriteAnimation["index"] = "base"
    }

    if(canvas.width > canvas.height){
        speciesSprite.style.transform = `scale(1, ${1 / (canvas.width / canvas.height)})`
    }
    else{
        speciesSprite.style.transform = `scale(${1 / (canvas.height / canvas.width)}, 1)`
    }

    const context = canvas.getContext('2d')

    animateCounter++
    
    const frameInterval = setInterval(changeImg, 83) // 83ms = 12fps

    function changeImg(){
        if(!speciesPanelMainContainer.classList.contains("hide")){
            if(!animateIconContainer.classList.contains("animateActive")){
                animateCounter = 0
                clearInterval(frameInterval)
                return
            }
            if(sheetSpecies != species[panelSpecies]["sprite"]){
                animateCounter--
                clearInterval(frameInterval)
                return
            }
            if(speciesName != panelSpecies 
            || variantsContainer.querySelector(".activeVariant") != index
            || (female != femaleIconContainer.classList.contains("femaleActive") && !femaleIconContainer.classList.contains("hide"))
            || back != backIconContainer.classList.contains("backActive")
            || animateCounter > 1){
                animateCounter--
                clearInterval(frameInterval)
                return
            }
            if(!spriteAnimation["frames"][frameCounter]){
                frameCounter = 1
            }
            //console.log(frameCounter)

            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(sheet, spriteAnimation["frames"][frameCounter][2], spriteAnimation["frames"][frameCounter][3], spriteAnimation["frames"][frameCounter][0], spriteAnimation["frames"][frameCounter][1], spriteAnimation["frames"][frameCounter][4], spriteAnimation["frames"][frameCounter][5], spriteAnimation["frames"][frameCounter][0], spriteAnimation["frames"][frameCounter][1])

            speciesSprite.src = canvas.toDataURL()

            frameCounter++
        }
    }
}










async function downloadAndAnimateSheet(back = false, female = false, exp = false){
    if((back && species[panelSpecies]["backExp"].length > 0) || species[panelSpecies]["exp"].length > 0){
        female = false
    }

    let sprite = new Image()

    if(femaleIconContainer.classList.contains("hide")){
        female = false
    }

    let method = -1
    let index = variantsContainer.querySelector(".activeVariant")
    if(index && index.classList.contains("hide")){
        index = null
    }
    if(index){
        index = parseInt(index.id.match(/\d/)[0])
        if((back && species[panelSpecies]["backExp"][index] != null)){
            method = species[panelSpecies]["backExp"][index]
            exp = true
            female = false
        }
        else if(species[panelSpecies]["exp"][index] != null){
            method = species[panelSpecies]["exp"][index]
            exp = true
            female = false
        }
        else if(female && back && species[panelSpecies]["backF"][index] != null){
            method = species[panelSpecies]["backF"][index]
        }
        else if(back && species[panelSpecies]["back"][index] != null){
            method = species[panelSpecies]["back"][index]
        }
        else if(female && species[panelSpecies]["variantF"][index] != null){
            method = species[panelSpecies]["variantF"][index]
        }
        else if(species[panelSpecies]["variant"][index] != null){
            method = species[panelSpecies]["variant"][index]
        }
    }
    else if(species[panelSpecies]["exp"].length > 0){
        exp = true
    }

    let spritePath = species[panelSpecies]["sprite"]
    if(method == 2){
        spritePath += `_${index + 1}`
    }

    let rawJson = null
    let json = null

    if(method == 1){
        let tempSprite = new Image()
        tempSprite.crossOrigin = 'anonymous'
        tempSprite.src = returnSpriteURL(back, female, spritePath, "png", -1, exp)

        tempSprite.onload = async () => {
            let canvas = document.createElement("canvas")

            const rawPalJson = await fetch(returnSpriteURL(back, female, spritePath, "json", method, exp))
            const palJson = await rawPalJson.json()

            rawJson = await fetch(returnSpriteURL(back, female, spritePath, "json", -1, exp))
            json = await rawJson.json()

            let pal = {}
            for(let i = 0; i < Object.keys(palJson[index]).length; i++){
                const jsonKey = Object.keys(palJson[index])[i]
                pal[`${parseInt(jsonKey.slice(0, 2), 16)},${parseInt(jsonKey.slice(2, 4), 16)},${parseInt(jsonKey.slice(4, 6), 16)}`] = [parseInt(palJson[index][jsonKey].slice(0, 2), 16),parseInt(palJson[index][jsonKey].slice(2, 4), 16),parseInt(palJson[index][jsonKey].slice(4, 6), 16)]
            }

            canvas.width = tempSprite.width
            canvas.height = tempSprite.height

            const context = canvas.getContext('2d')

            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(tempSprite, 0, 0)

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

            for(let i = 0; i < imageData.data.length; i += 4) {
                if(`${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]}` in pal){
                    const palKey = `${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]}`
                    imageData.data[i] = pal[palKey][0]
                    imageData.data[i + 1] = pal[palKey][1]
                    imageData.data[i + 2] = pal[palKey][2]
                }
            }
            
            context.putImageData(imageData, 0, 0)
            sprite.src = canvas.toDataURL()
        }
    }
    else{
        rawJson = await fetch(returnSpriteURL(back, female, spritePath, "json", method, exp))
        json = await rawJson.json()

        sprite.crossOrigin = 'anonymous'
        sprite.src = returnSpriteURL(back, female, spritePath, "png", method, exp)
    }

    sprite.onload = async () => {
        await handleSheetAnimation(panelSpecies, back, female, sprite, json)
    }
}