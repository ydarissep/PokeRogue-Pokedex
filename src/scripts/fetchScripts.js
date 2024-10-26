async function getItems(){
    footerP("Fetching items")
    const rawItemDescriptions = await fetch(`https://raw.githubusercontent.com/${localesRepo}/${lang}/modifier-type.json`)
    const jsonItemDescriptions = await rawItemDescriptions.json()

    const modifierTypeTable = await regexItemDescriptions(jsonItemDescriptions)

    const rawItemsTier = await fetch(`https://raw.githubusercontent.com/${repo}/src/modifier/modifier-type.ts`)
    const textItemsTier = await rawItemsTier.text()

    await regexItemsTier(textItemsTier, modifierTypeTable, jsonItemDescriptions)

    const rawItemsIcon = await fetch(`https://raw.githubusercontent.com/${repo}/public/images/items.json`)
    const jsonItemsIcon = await rawItemsIcon.json()

    await regexItemIcon(jsonItemsIcon)
}

async function getTrainers(){
    footerP("Fetching trainers")
    const rawTrainers = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/trainer-config.ts`)
    const textTrainers = await rawTrainers.text()

    await regexTrainersParties(textTrainers)
}

async function getTranslationTable(){
    footerP("Fetching translation table")
    const rawPokemonInfo = await fetch(`https://raw.githubusercontent.com/${localesRepo}/${lang}/pokemon-info.json`)
    const jsonPokemonInfo = await rawPokemonInfo.json()

    await regexPokemonInfo(jsonPokemonInfo)

    const rawMenu = await fetch(`https://raw.githubusercontent.com/${localesRepo}/${lang}/menu.json`)
    const jsonMenu = await rawMenu.json()

    await regexMenu(jsonMenu)
}

async function buildScriptsObjs(){
    window.trainers = {}
    window.items = {}
    window.translationTable = {}

    await getTranslationTable()

    //await getTrainers()

    //await getItems()

    localStorage.setItem("translationTable", LZString.compressToUTF16(JSON.stringify(translationTable)))
    localStorage.setItem("trainers", LZString.compressToUTF16(JSON.stringify(trainers)))
    localStorage.setItem("items", LZString.compressToUTF16(JSON.stringify(items)))
    //localStorage.setItem("locations", LZString.compressToUTF16(JSON.stringify(locations))) // do not uncomment
}


async function fetchScripts(){
    if(!localStorage.getItem("trainers") || !localStorage.getItem("items")){
        await buildScriptsObjs()
    }
    else{
        window.items = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("items")))
        window.trainers = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("trainers")))
        window.translationTable = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("translationTable")))
    }
    

    window.itemsTracker = []
    Object.keys(items).forEach(async name => {
        if(localStorage.getItem(`${name}`)){
            sprites[name] = await LZString.decompressFromUTF16(localStorage.getItem(`${name}`))
            if(sprites[name].length < 500){
                localStorage.removeItem(name)
                spriteRemoveItemBgReturnBase64(name)
            }
        }
    })
    for(let i = 0, j = Object.keys(items).length; i < j; i++){
        itemsTracker[i] = {}
        itemsTracker[i]["key"] = Object.keys(items)[i]
        itemsTracker[i]["filter"] = []
    }

    let counter = 0
    window.trainersTracker = []
    Object.keys(trainers).forEach(zone => {
        Object.keys(trainers[zone]).forEach(trainer => {
            trainersTracker[counter] = {}
            trainersTracker[counter]["key"] = `${zone}\\${trainer}`
            trainersTracker[counter]["filter"] = []
            counter++

            for(difficulty in trainers[zone][trainer]["party"]){
                if(difficulty !== "Normal" && !document.getElementById(`difficulty${difficulty}`)){
                    const newDifficulty = document.createElement("button"); newDifficulty.innerText = difficulty; newDifficulty.className = "setting"; newDifficulty.setAttribute("id", `difficulty${difficulty}`); newDifficulty.setAttribute("type", "button")
                    difficultyButtonContainer.append(newDifficulty)

                    newDifficulty.addEventListener("click", () => {
                        if(newDifficulty.classList.contains("activeSetting")){
                            trainersDifficulty = "Normal"
                            newDifficulty.classList.remove("activeSetting")
                        }
                        else{
                            for(const difficultyButton of difficultyButtonContainer.children){
                                difficultyButton.classList.remove("activeSetting")
                            }
                            newDifficulty.classList.add("activeSetting")
                            trainersDifficulty = newDifficulty.innerText
                        }
                        trainerSpeciesMatchFilter(true)
                        filterTrainersTableInput(trainersInput.value)
                    })
                }
            }

            const sprite = trainers[zone][trainer]["sprite"]
            if(localStorage.getItem(sprite)){
                sprites[sprite] = LZString.decompressFromUTF16(localStorage.getItem(sprite))
                if(sprites[sprite].length < 500){
                    localStorage.removeItem(sprite)
                    spriteRemoveBgReturnBase64(sprite, `https://raw.githubusercontent.com/${repo}/graphics/trainers/front_pics/${sprite.replace(/^TRAINER_PIC_/, "").toLowerCase()}_front_pic.png`)
                }
            }
        })
    })
}







function getItemSpriteSrc(itemName){
    if(sprites[itemName]){
        if(sprites[itemName].length < 500){
            localStorage.removeItem(itemName)
            spriteRemoveItemBgReturnBase64(itemName)
            return items[itemName]["url"]
        }
        else{
            return sprites[itemName]
        }
    }
    else{
        spriteRemoveItemBgReturnBase64(itemName)
        return items[itemName]["url"]
    }
}








function getTrainerSpriteSrc(trainerSprite){
    const url = `https://raw.githubusercontent.com/${repo}/graphics/trainers/front_pics/${trainerSprite.replace(/^TRAINER_PIC_/, "").toLowerCase()}_front_pic.png`
    if(sprites[trainerSprite]){
        if(sprites[trainerSprite].length < 500){
            localStorage.removeItem(trainerSprite)
            spriteRemoveTrainerBgReturnBase64(trainerSprite, url)
            return url
        }
        else{
            return sprites[trainerSprite]
        }
    }
    else{
        spriteRemoveTrainerBgReturnBase64(trainerSprite, url)
        return url
    }
}
