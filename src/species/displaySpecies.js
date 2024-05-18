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

    text = text.replace("row.append(abilitiesContainer)", "const starterAbility = document.createElement(\"div\");starterAbility.innerText = abilities[species[speciesName][\"starterAbility\"]][\"ingameName\"];starterAbility.classList = \"starterAbility\";abilitiesContainer.prepend(starterAbility)\nrow.append(abilitiesContainer)")

    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})



async function spriteRemoveBgReturnBase64(speciesName, species){
    let sprite = new Image()
    let canvas = document.createElement("canvas")

    let canvasWidth = 64
    let canvasHeight = 64
    let frameX = 0
    let frameY = 0

    const rawJson = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/${species[speciesName]["sprite"]}.json`)
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

        //const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        
        //context.putImageData(imageData, 0, 0)

        if(!localStorage.getItem(speciesName)){
            localStorage.setItem(speciesName, LZString.compressToUTF16(canvas.toDataURL()))
            sprites[speciesName] = canvas.toDataURL()
            localStorage.setItem(`spriteInfo${speciesName}`, spritesInfo[speciesName])
        }
        const els = document.getElementsByClassName(`sprite${speciesName}`)
        if(els.length > 0){
            for(let i = 0; i < els.length; i++){
                els[i].src = canvas.toDataURL()
                els[i].style.transform = `scale(${spritesInfo[returnTargetSpeciesSprite(speciesName)]})`
            }
        }
    }
}