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
    text = text.replace("speciesSprite.src = getSpeciesSpriteSrc(name)", "handleVariants()\nappendBiomes(name)\nspeciesSprite.src = getSpeciesSpriteSrc(name)")
    
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})




function appendBiomes(speciesName){
    while(speciesPanelBiomesContainer.lastChild){
        speciesPanelBiomesContainer.removeChild(speciesPanelBiomesContainer.lastChild)
    }



    const locationsKey = Object.keys(locations)
    biomeLoop:for(let i = 0; i < locationsKey.length; i++){
        const timeOfDayKey = Object.keys(locations[locationsKey[i]])
        for(let j = 0; j < timeOfDayKey.length; j++){
            const speciesKey = Object.keys(locations[locationsKey[i]][timeOfDayKey[j]])
            for(let k = 0; k < speciesKey.length; k++){
                if(species[speciesName]["evolutionLine"].includes(speciesKey[k])){
                    const speciesPanelBiome = document.createElement("div"); speciesPanelBiome.innerText = locationsKey[i]; speciesPanelBiome.classList = "hyperlink speciesPanelTextPadding"
                    speciesPanelBiomesContainer.append(speciesPanelBiome)

                    speciesPanelBiome.addEventListener("click", async() => {
                        if(!locationsButton.classList.contains("activeButton")){
                            tracker = locationsTracker
                            await tableButtonClick("locations")
                        }
                        deleteFiltersFromTable()
        
                        createFilter(locationsKey[i], "Biome")
                        speciesPanel("hide")
                        window.scrollTo({ top: 0})
                    })

                    continue biomeLoop
                }
            }
        }
    }

    if(speciesPanelBiomesContainer.children.length > 0){
        const speciesPanelBiomeText = document.createElement("div"); speciesPanelBiomeText.innerText = "Biomes:"; speciesPanelBiomeText.classList = "speciesPanelText"
        speciesPanelBiomesContainer.prepend(speciesPanelBiomeText)
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

    femaleIconContainer.addEventListener("click", async () => {
        femaleIconContainer.classList.toggle("femaleActive")
        for(let i = 0; i < 3; i++){
            if(variantsContainer.children[i].classList.contains("activeVariant")){
                fetchVarSprite(variantsContainer.children[i], i, false)
            }
        }
    })
}





function fetchVarSprite(variantContainer, i, clicked = false, female = false){
    if(species[panelSpecies]["variantF"].length > 0){
        if(femaleIconContainer.classList.contains("femaleActive")){
            female = true
        }
    }

    const targetSpecies = returnTargetSpeciesSprite(panelSpecies)
    if(variantContainer.classList.contains("activeVariant") && clicked){
        speciesSprite.src = sprites[targetSpecies]
        variantContainer.classList.remove("activeVariant")
    }
    else{
        for(let j = 0; j < 3; j++){
            variantsContainer.children[j].classList.remove("activeVariant")
        }

        let method = species[targetSpecies]["variant"][i]
        if(female){
            method = species[targetSpecies]["variantF"][i]
        }

        if(method == 0 || method == 2){
            downloadVarSprite(targetSpecies, i, method, female)
        }
        else if(method == 1){
            applyPalVar(targetSpecies, i, female)
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
        //variantsContainer.children[i].classList.remove("activeVariant")
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






async function downloadVarSprite(speciesName, index, method, female){
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
    
    let rawJson = null
    if(method == 0){
        if(female){
            rawJson = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/shiny/female/${spritePath}.json`)
        }
        else{
            rawJson = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/shiny/${spritePath}.json`)
        }
    }
    else if(method == 2){
        if(female){
            rawJson = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/variant/female/${spritePath}.json`)
        }
        else{
            rawJson = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/variant/${spritePath}.json`)
        }
    }
    const json = await rawJson.json()

    let i = 0
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

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    sprite.crossOrigin = 'anonymous'
    if(method == 0){
        if(female){
            sprite.src = `https://raw.githubusercontent.com/${repo}/public/images/pokemon/shiny/female/${spritePath}.png`
        }
        else{
            sprite.src = `https://raw.githubusercontent.com/${repo}/public/images/pokemon/shiny/${spritePath}.png`
        }
    }
    else if(method == 2){
        if(female){
            sprite.src = `https://raw.githubusercontent.com/${repo}/public/images/pokemon/variant/female/${spritePath}.png`
        }
        else{
            sprite.src = `https://raw.githubusercontent.com/${repo}/public/images/pokemon/variant/${spritePath}.png`
        }
    }

    const context = canvas.getContext('2d')

    sprite.onload = async () => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(sprite, -frameX, -frameY)

        speciesSprite.src = canvas.toDataURL()
    }
}










async function applyPalVar(speciesName, index, female){
    let sprite = new Image()
    let canvas = document.createElement("canvas")

    sprite.src = sprites[speciesName]

    canvas.width = sprite.width
    canvas.height = sprite.height

    let rawJson = null
    if(female){
        rawJson = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/variant/female/${species[speciesName]["sprite"]}.json`)
    }
    else{
        rawJson = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/variant/${species[speciesName]["sprite"]}.json`)
    }
    const json = await rawJson.json()

    let pal = {}
    for(let i = 0; i < Object.keys(json[index]).length; i++){
        const jsonKey = Object.keys(json[index])[i]
        pal[`${parseInt(jsonKey.slice(0, 2), 16)},${parseInt(jsonKey.slice(2, 4), 16)},${parseInt(jsonKey.slice(4, 6), 16)}`] = [parseInt(json[index][jsonKey].slice(0, 2), 16),parseInt(json[index][jsonKey].slice(2, 4), 16),parseInt(json[index][jsonKey].slice(4, 6), 16)]
    }

    const context = canvas.getContext('2d')

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(sprite, 0, 0)

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
    speciesSprite.src = canvas.toDataURL()
}