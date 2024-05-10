fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/species/displaySpecies.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace(/function\s*spriteRemoveBgReturnBase64/i, "function spriteRemoveBgReturnBase64Old")
    const textMatch = Array.from(new Set(text.match(/\w+\.src\s*=\s*getSpeciesSpriteSrc\(.*?\)/ig)))
    if(textMatch){
        textMatch.forEach(srcMatch => {
            const el = srcMatch.match(/(\w+)\./)[1]
            const speciesNameTemp = srcMatch.match(/getSpeciesSpriteSrc\((.*?)\)/)[1].trim()

            text = text.replaceAll(srcMatch, `if(spritesInfo[\`spriteInfo\${${speciesNameTemp}}\`]){${el}.style.transform = \`scale(\${spritesInfo[\`spriteInfo\${${speciesNameTemp}}\`]})\`}\n${srcMatch}`)
        })
    }

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

    const rawJson = await fetch(species[speciesName]["sprite"].replace(".png", ".json"))
    const textJson = await rawJson.text()

    const sourceSizeMatch = textJson.match(/\"\s*frame\s*\".*?}/igs)
    if(sourceSizeMatch){
        let bestScale = 10
        sourceSizeMatch.forEach(frameMatch => {
            let scale = 10

            let width = frameMatch.match(/\"\s*w\s*\".*?(\d+)/i)
            if(width){
                width = parseInt(width[1])
            }
            let height = frameMatch.match(/\"\s*h\s*\".*?(\d+)/i)
            if(height){
                height = parseInt(height[1])
            }

            if(width && height){
                if(width > height){
                    scale = width / height
                }
                else{
                    scale = height / width
                }
    
                if(scale < bestScale){
                    bestScale = scale
                    const frameXmatch = frameMatch.match(/\"\s*x\s*\".*?(\d+)/i)
                    if(frameXmatch){
                        frameX = parseInt(frameXmatch[1])
                    }
                    const frameYmatch = frameMatch.match(/\"\s*y\s*\".*?(\d+)/i)
                    if(frameYmatch){
                        frameY = parseInt(frameYmatch[1])
                    }
                    canvasWidth = width
                    canvasHeight = height
                }
            }
        })

        if(canvasWidth > canvasHeight){
            spritesInfo[`spriteInfo${speciesName}`] = `1, ${1 / (canvasWidth / canvasHeight)}`
        }
        else{
            spritesInfo[`spriteInfo${speciesName}`] = `${1 / (canvasHeight / canvasWidth)}, 1`
        }
    }

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    sprite.crossOrigin = 'anonymous'
    sprite.src = species[speciesName]["sprite"]

    const context = canvas.getContext('2d')

    sprite.onload = async () => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(sprite, -frameX, -frameY)

        /*
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

        const backgroundColor = []
        for (let i = 0; i < 4; i++) {
          backgroundColor.push(imageData.data[i])
        }
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (
            imageData.data[i] === backgroundColor[0] &&
            imageData.data[i + 1] === backgroundColor[1] &&
            imageData.data[i + 2] === backgroundColor[2]
          ) imageData.data[i + 3] = 0
        }
        
        context.putImageData(imageData, 0, 0)
        */

        if(!localStorage.getItem(`${speciesName}`)){
            await localStorage.setItem(`${speciesName}`, LZString.compressToUTF16(canvas.toDataURL()))
            sprites[speciesName] = canvas.toDataURL()
            localStorage.setItem(`spriteInfo${speciesName}`, LZString.compressToUTF16(spritesInfo[`spriteInfo${speciesName}`]))
        }
        if(document.getElementsByClassName(`sprite${speciesName}`).length > 0){
            const els = document.getElementsByClassName(`sprite${speciesName}`)
            for(let i = 0; i < els.length; i++){
                els[i].src = canvas.toDataURL()
                els[i].style.transform = `scale(${spritesInfo[`spriteInfo${speciesName}`]})`
            }
        }
    }
}