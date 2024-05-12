fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/locations/displayLocations.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace(/timeRegex.*?\/.*?\//, "timeRegex = /Bonjour, j\'espere que ce regex ne matchera JAMAIS\./")
    const textMatch = Array.from(new Set(text.match(/\w+\.src\s*=\s*getSpeciesSpriteSrc\(.*?\)/ig)))
    if(textMatch){
        textMatch.forEach(srcMatch => {
            const el = srcMatch.match(/(\w+)\./)[1]
            const speciesNameTemp = srcMatch.match(/getSpeciesSpriteSrc\((.*?)\)/)[1].trim()

            text = text.replaceAll(srcMatch, `if(spritesInfo[\`spriteInfo\${${speciesNameTemp}}\`]){${el}.style.transform = \`scale(\${spritesInfo[\`spriteInfo\${${speciesNameTemp}}\`]})\`}\n${srcMatch}`)
        })
    }
    text = text.replace("time = \"Anytime\"", "time = null")
    text = text.replace("methodTable.children[1].append(row)", "sortAppendlocationRow(methodTable.children[1], row, rarity.innerText)")
    text = text.replace("rarity.innerText = locations[location][method][speciesKey]", "rarity.innerText = locations[location][method][speciesKey]\nif(rarity.innerText in rarityColor){rarity.style.color = `hsl(${rarityColor[rarity.innerText]*2},85%,45%)`}")

    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})




const rarityOrder = {"Common": 1, "Uncommon": 2, "Rare": 3, "Super Rare": 4, "Ultra Rare": 5, "Boss": 6, "Boss Rare": 7, "Boss Super Rare": 8, "Boss Ultra Rare": 9}
const rarityColor = {"Common": 69.5, "Uncommon": 24.2, "Rare": 5, "Super Rare": 0.98, "Ultra Rare": 0.2, "Boss": 68.8, "Boss Rare": 21.9, "Boss Super Rare": 7.8, "Boss Ultra Rare": 1.6}
function sortAppendlocationRow(methodTableTbody, row, rarity){
    if(!(rarity in rarityOrder)){
        methodTableTbody.prepend(row)
        return false
    }

    const speciesRarity = rarityOrder[rarity]

    for(let i = 0; i < methodTableTbody.children.length; i++){
        if(methodTableTbody.children[i].children[2].innerText in rarityOrder){
            if(speciesRarity < rarityOrder[methodTableTbody.children[i].children[2].innerText]){
                methodTableTbody.insertBefore(row, methodTableTbody.children[i])
                return true
            }
        }
    }

    methodTableTbody.append(row)
    return false
}