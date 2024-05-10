async function getScripts(){
    footerP("Fetching scripts")
    const rawScripts = await fetch(`https://raw.githubusercontent.com/${repo}/data/event_scripts.s`)
    const textScripts = await rawScripts.text()

    const rawTrade = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/trade.h`)
    const tradeText = await rawTrade.text()

    const rawSpecials = await fetch(`https://raw.githubusercontent.com/${repo}/src/field_specials.c`)
    const textSpecials = await rawSpecials.text()

    await getItemBallSripts(textScripts)

    await regexScripts(textScripts, tradeText, await regexSpecialsFunctions(textSpecials))
}

async function getItems(){
    footerP("Fetching items")
    const rawItems = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/items.h`)
    const textItems = await rawItems.text()

    const descriptionConversionTable = await regexItems(textItems)

    const rawItemDescriptions = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/text/item_descriptions.h`)
    const textItemDescriptions = await rawItemDescriptions.text()

    await regexItemDescriptions(textItemDescriptions, descriptionConversionTable)
}

async function getItemBallSripts(textScripts){
    const rawItemBallSripts = await fetch(`https://raw.githubusercontent.com/${repo}/data/scripts/item_ball_scripts.inc`)
    const textItemBallScripts = await rawItemBallSripts.text()

    await regexItemBallSripts(textItemBallScripts, textScripts)
}

async function getHiddenItems(){
    const rawFlags = await fetch(`https://raw.githubusercontent.com/${repo}/include/constants/flags.h`)
    const textFlags = await rawFlags.text()

    await regexHiddenItems(textFlags)
}

async function getItemsIcon(){
    const rawItemIconTable = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/item_icon_table.h`)
    const textItemIconTable = await rawItemIconTable.text()

    const rawItemsIcon = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/graphics/items.h`)
    const textItemsIcon = await rawItemsIcon.text()

    await regexItemIcon(textItemIconTable, textItemsIcon)
}

async function getTrainers(){
    footerP("Fetching trainers")
    const rawTrainers = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/trainers.h`)
    const textTrainers = await rawTrainers.text()

    const rawTrainersParties = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/trainer_parties.h`)
    const textTrainersParties = await rawTrainersParties.text()

    await regexTrainersParties(textTrainersParties, await regexTrainers(textTrainers))
}

async function buildScriptsObjs(){
    window.trainers = {}
    window.items = {}

    /*
    await getItems()

    await getScripts()

    await getTrainers()

    await getItemsIcon()
    await getHiddenItems()
    await getHeldItems()
    await bugFixTrainers()
    */

    localStorage.setItem("trainers", LZString.compressToUTF16(JSON.stringify(trainers)))
    localStorage.setItem("items", LZString.compressToUTF16(JSON.stringify(items)))
    localStorage.setItem("locations", LZString.compressToUTF16(JSON.stringify(locations)))
}


async function fetchScripts(){
    if(!localStorage.getItem("trainers") || !localStorage.getItem("items")){
        await buildScriptsObjs()
    }
    else{
        window.items = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("items")))   
        window.trainers = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("trainers")))   
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







async function bugFixTrainers(){
    let trainerToZone = {}
    let stop = false
    let correctZone = false
    Object.keys(trainers).forEach(zone => {
        Object.keys(trainers[zone]).forEach(trainer => {
            if(!trainerToZone[trainer]){
                trainerToZone[trainer] = zone
            }
            else{
                const baseTrainerName = trainer.split("_").splice(0, 2).join("_")
                const fullTrainerName = trainer.split("_").slice(0, -1).join("_")
                Object.keys(trainers[zone]).forEach(trainerName => {
                    if(trainerName.split("_").splice(0, 2).join("_") == baseTrainerName && trainerName.split("_").slice(0, -1).join("_") != fullTrainerName){
                        correctZone = trainerToZone[trainer]
                        stop = true
                    }
                })
                if(!stop){
                    Object.keys(trainers[trainerToZone[trainer]]).forEach(trainerName => {
                        if(trainerName.split("_").splice(0, 2).join("_") == baseTrainerName && trainerName.split("_").slice(0, -1).join("_") != fullTrainerName){
                            correctZone = zone
                        }
                    })
                }
                stop = false
            }


            if(correctZone){
                if(correctZone === zone){
                    if(Object.keys(trainers[zone][trainer]["party"]).length === 0){
                        trainers[zone][trainer] = JSON.parse(JSON.stringify(trainers[trainerToZone[trainer]][trainer]))
                        delete trainers[trainerToZone[trainer]][trainer]
                    }
                }
                else{
                    if(Object.keys(trainers[trainerToZone[trainer]][trainer]["party"]).length === 0){
                        trainers[trainerToZone[trainer]][trainer] = JSON.parse(JSON.stringify(trainers[zone][trainer]))
                        delete trainers[zone][trainer]
                    }
                }
                correctZone = false
            }
        })
    })






    Object.keys(trainers).forEach(zone => {
        let rematchObj = {}
        let sortedZoneObj = {}
        Object.keys(trainers[zone]).sort(function(a, b) {
            return (a < b) ? -1 : (a > b) ? 1 : 0
        }).forEach(trainer => {
            sortedZoneObj[trainer] = trainers[zone][trainer]
        })
        trainers[zone] = JSON.parse(JSON.stringify(sortedZoneObj))

        Object.keys(trainers[zone]).forEach(trainer => {
            if(trainers[zone][trainer]["rematch"]){
                rematchObj[trainer.split("_").slice(0, -1).join("_")] = trainers[zone][trainer]["rematch"]
            }
            else if(rematchObj[trainer.split("_").slice(0, -1).join("_")] && !trainers[zone][trainer]["rematch"]){
                trainers[zone][trainer]["rematch"] = rematchObj[trainer.split("_").slice(0, -1).join("_")]
                trainers[zone][rematchObj[trainer.split("_").slice(0, -1).join("_")]]["rematchArray"].push(trainer)

            }
            if(Object.keys(trainers[zone][trainer]["party"]).length === 0){
                delete trainers[zone][trainer]
                if(Object.keys(trainers[zone]).length === 0){
                    delete trainers[zone]
                }
            }
        })
    })
}