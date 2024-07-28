fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/species/displaySpecies.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace(/function\s*spriteRemoveBgReturnBase64/i, "function spriteRemoveBgReturnBase64Old")
    const textMatch = Array.from(new Set(text.match(/\w+\.src\s*=\s*getSpeciesSpriteSrc\(.*?\)/ig)))
    if(textMatch){
        textMatch.forEach(srcMatch => {
            const el = srcMatch.match(/(\w+)\./)[1]
            const speciesNameTemp = srcMatch.match(/getSpeciesSpriteSrc\((.*?)\)/)[1].trim()

            text = text.replaceAll(srcMatch, `if(spritesInfo[returnTargetSpeciesSprite(${speciesNameTemp})]){${el}.style.transform = \`scale(\${spritesInfo[returnTargetSpeciesSprite(${speciesNameTemp})]})\`}\n${srcMatch}`)
        })
    }

    text = text.replace("row.append(nameContainer)", "if(variantButton.classList.contains('activeSetting') && species[speciesName]['variant'][0] != 0){nameContainer.append(returnNewShinyEl())}\nrow.append(nameContainer)")
    text = text.replace("row.append(abilitiesContainer)", "const starterAbility = document.createElement(\"div\");starterAbility.innerText = abilities[species[speciesName][\"starterAbility\"]][\"ingameName\"];starterAbility.classList = \"starterAbility\";abilitiesContainer.prepend(starterAbility)\nrow.append(abilitiesContainer)")
    text = text.replace('ingameName.innerText = sanitizeString(species[speciesName]["name"])', 'ingameName.innerText = species[speciesName]["ingameName"]')
    text = text.replace('sanitizeString(species[speciesName]["type1"])', '(translationTable[sanitizeString(species[speciesName]["type1"])] ??= sanitizeString(species[speciesName]["type1"])).substring(0, 6)')
    text = text.replace('sanitizeString(species[speciesName]["type2"])', '(translationTable[sanitizeString(species[speciesName]["type2"])] ??= sanitizeString(species[speciesName]["type2"])).substring(0, 6)')
    text = text.replace("statInfo[0], statInfo[1]", "`${translationTable[statInfo[0]] ??= statInfo[0]}`, statInfo[1]")
    text = text.replace('if(speciesFilterContainer.children[i].innerText.split(":")[0] == "Move"){', 'if(speciesFilterContainer.children[i].innerText.split(":")[0] == (staticTranslationTable["Move"] ??= "Move")){')

    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})





function returnNewShinyEl(){
    const newShiny = document.createElement("div")
    newShiny.className = "baseShinyChanged"
    newShiny.innerText = "new shiny"
    return newShiny
}





async function spriteRemoveBgReturnBase64(speciesName, species){
    if(species[speciesName]["variantF"].length > 0){
        getSpriteInfo(speciesName, species, false, true)
    }
    if(species[speciesName]["backF"].length > 0){
        getSpriteInfo(speciesName, species, true, true)
    }
    if(species[speciesName]["back"]){
        getSpriteInfo(speciesName, species, true, false)
    }

    let sprite = new Image()
    let canvas = document.createElement("canvas")

    let canvasWidth = 64
    let canvasHeight = 64
    let frameX = 0
    let frameY = 0

    const rawJson = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/${species[speciesName]["sprite"]}.json`)
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
        spritesInfo[speciesName] = `1, ${1 / (canvasWidth / canvasHeight)}`
    }
    else{
        spritesInfo[speciesName] = `${1 / (canvasHeight / canvasWidth)}, 1`
    }

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    sprite.crossOrigin = 'anonymous'
    sprite.src = `https://raw.githubusercontent.com/${repo}/public/images/pokemon/${species[speciesName]["sprite"]}.png`

    const context = canvas.getContext('2d')

    sprite.onload = async () => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(sprite, -frameX, -frameY)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        let spriteDataString = "", repeat = 1, pal = []
        for (let i = 0; i < imageData.data.length; i += 4) {
            if(!pal.includes(`${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]},${imageData.data[i + 3]}`)){
                pal.push(`${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]},${imageData.data[i + 3]}`)
            }

            if(imageData.data[i] === imageData.data[i + 4] && imageData.data[i + 1] === imageData.data[i + 5] && imageData.data[i + 2] === imageData.data[i + 6] && imageData.data[i + 3] === imageData.data[i + 7]){
                repeat++
            }
            else{
                spriteDataString += `&${pal.indexOf(`${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]},${imageData.data[i + 3]}`)}*${repeat}`
                repeat = 1
            }
        }
        context.putImageData(imageData, 0, 0)

        spriteDataString = `${canvas.width}&${canvas.height}&[${pal}]${spriteDataString}`

        if(!localStorage.getItem(speciesName)){
            localStorage.setItem(speciesName, LZString.compressToUTF16(spriteDataString))
            sprites[speciesName] = canvas.toDataURL()
            localStorage.setItem(`spriteInfo${speciesName}`, spritesInfo[speciesName])
        }
        const els = document.getElementsByClassName(`sprite${speciesName}`)
        if(els.length > 0){
            for(let i = 0; i < els.length; i++){
                els[i].src = canvas.toDataURL()
                els[i].style.transform = `scale(${spritesInfo[speciesName]})`
            }
        }
    }
}