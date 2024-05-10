fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/speciesPanelUtility.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replaceAll("row.append(movedescription)", "row.append(returnMoveDescription(move))")
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