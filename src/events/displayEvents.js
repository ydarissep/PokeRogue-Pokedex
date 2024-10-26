async function appendEventsToTable(eventName){
    if(!events[eventName]["title"]){
        return false
    }
    
    const tBody = eventsTableTbody

    const eventDetails = document.createElement("details")
    const eventSummary = document.createElement("summary"); eventSummary.classList = "eventSummary"
    const eventTitle = document.createElement("span"); eventTitle.innerText = events[eventName]["title"]
    const randomBiome = events[eventName]["biomes"][Math.floor(Math.random() * events[eventName]["biomes"].length)]
    const biomeName = Object.keys(biomeTranslation).find(biome => biomeTranslation[biome] == randomBiome).toLowerCase().replaceAll(/-| /g, "_")
    const eventSpriteContainer = document.createElement("div")
    const eventSprite = document.createElement("img"); eventSprite.src = getEventSpriteSrc(events[eventName], biomeName); eventSprite.classList = `sprite${eventName} sprite${biomeName} eventSprite`
    eventSummary.append(eventTitle)
    eventSpriteContainer.append(eventSprite)
    eventSummary.append(eventSpriteContainer)
    eventDetails.append(eventSummary)
    const eventTable = document.createElement("table"); eventTable.classList = "eventTable"
    eventTable.append(returnEventTableThead(eventName))
    eventTable.append(returnEventTableTbody(eventName))

    eventTable.setAttribute("id", `${eventName}`)

    eventDetails.append(eventTable)
    tBody.append(eventDetails)
    return true
}






function returnEventTableThead(eventName){
    const eventTableThead = document.createElement("thead"); eventTableThead.classList = "eventTableThead"
    const eventTableTheadRow = document.createElement("tr")

    const eventTier = document.createElement("th");
    const eventTierText = document.createElement("span"); eventTierText.innerText = `${staticTranslationTable["Tier"]}: `
    const eventTierImg = document.createElement("img"); eventTierImg.classList = "eventTierImg"
    if(events[eventName]["tier"] == "GREAT"){
        eventTierImg.src = "https://raw.githubusercontent.com/pagefaultgames/pokerogue/refs/heads/beta/public/images/pokeball/gb.png"
    }
    else if(events[eventName]["tier"] == "ULTRA"){
        eventTierImg.src = "https://raw.githubusercontent.com/pagefaultgames/pokerogue/refs/heads/beta/public/images/pokeball/ub.png"
    }
    else if(events[eventName]["tier"] == "ROGUE"){
        eventTierImg.src = "https://raw.githubusercontent.com/pagefaultgames/pokerogue/refs/heads/beta/public/images/pokeball/rb.png"
    }
    else if(events[eventName]["tier"] == "MASTER"){
        eventTierImg.src = "https://raw.githubusercontent.com/pagefaultgames/pokerogue/refs/heads/beta/public/images/pokeball/mb.png"
    }
    else{
        eventTierImg.src = "https://raw.githubusercontent.com/pagefaultgames/pokerogue/refs/heads/beta/public/images/pokeball/pb.png"
    }
    eventTier.append(eventTierText); eventTier.append(eventTierImg)

    eventTableTheadRow.append(eventTier)

    const eventWave = document.createElement("th");
    const eventWaveTitle = document.createElement("span"); eventWaveTitle.innerText = `${translationTable["wave"] ??= "Wave"}: `
    const eventWaveText = document.createElement("span"); eventWaveText.innerText = `${events[eventName]["wave"][0]}-${events[eventName]["wave"][1]}`
    eventWave.append(eventWaveTitle); eventWave.append(eventWaveText)
    eventTableTheadRow.append(eventWave)

    const eventBiomes = document.createElement("th"); eventBiomes.innerText = staticTranslationTable["Biomes"]; eventBiomes.classList = "hyperlink"
    eventTableTheadRow.append(eventBiomes)
    eventBiomes.addEventListener("click", () => {
        createPopupBiomes(events[eventName]["biomes"])
    })

    eventTableThead.append(eventTableTheadRow)

    if(events[eventName]["intro"]){
        const eventTalbeTheadIntroRow = document.createElement("tr")
        const eventIntro = document.createElement("th"); eventIntro.innerText = events[eventName]["intro"]; eventIntro.colSpan = "3"
        eventTalbeTheadIntroRow.append(eventMarkdown(eventIntro))
        eventTableThead.append(eventTalbeTheadIntroRow)
    }

    const eventTalbeTheadDescRow = document.createElement("tr")
    const eventDesc = document.createElement("td"); eventDesc.innerText = events[eventName]["description"]; eventDesc.colSpan = "3"
    eventTalbeTheadDescRow.append(eventMarkdown(eventDesc))
    eventTableThead.append(eventTalbeTheadDescRow)

    if(events[eventName]["query"]){
        const eventTalbeTheadQueryRow = document.createElement("tr")
        const eventQuery = document.createElement("td"); eventQuery.innerText = `\n${events[eventName]["query"]}`; eventQuery.colSpan = "3"
        eventTalbeTheadQueryRow.append(eventMarkdown(eventQuery))
        eventTableThead.append(eventTalbeTheadQueryRow)
    }

    return eventTableThead
}






function returnEventTableTbody(eventName){
    const eventTableTbody = document.createElement("tbody")

    Object.keys(events[eventName]["option"]).forEach(optionKey => {
        eventTableTbody.append(returnEventOption(events[eventName]["option"][optionKey]))
    })

    return eventTableTbody
}








function returnEventOption(option){
    const eventTalbeTbodyOptionRow = document.createElement("tr"); eventTalbeTbodyOptionRow.classList = "optionRow"

    const optionLabelContainer = document.createElement("td")
    const optionLabel = document.createElement("div"); optionLabel.innerText = option["label"]
    optionLabelContainer.append(optionLabel)

    if(option["disabled"]){
        const optionDisabled = document.createElement("div")
        optionDisabled.innerText = option["disabled"]
        if(option["requirements"].length > 0){
            optionDisabled.classList = "hyperlink"
            optionDisabled.addEventListener("click", () => {
                createPopupRequirements(option["requirements"])
            })
        }
        optionLabelContainer.append(optionDisabled)
    }

    const optionTooltip = document.createElement("div"); optionTooltip.innerText = option["tooltip"]
    optionLabelContainer.append(eventMarkdown(optionTooltip))

    eventTalbeTbodyOptionRow.append(optionLabelContainer)

    const optionSelected = document.createElement("td"); optionSelected.colSpan = "2"
    if(option["selected"]){
        optionSelected.innerText = option["selected"]
    }
    eventTalbeTbodyOptionRow.append(optionSelected)

    return eventTalbeTbodyOptionRow
}








function createPopupBiomes(array){
    overlayAbilities.style.display = 'flex'
    body.classList.add("fixedAbilities")

    while(popupAbilities.firstChild){
        popupAbilities.removeChild(popupAbilities.firstChild)
    }

    const requirementsMainContainer = document.createElement("ul")

    for(let i = 0; i < array.length; i++){
        const requirement = document.createElement("li"); requirement.innerText = array[i]
        requirementsMainContainer.append(requirement)
    }

    popupAbilities.append(requirementsMainContainer)
}







function createPopupRequirements(optionRequirementArray){
    overlayAbilities.style.display = 'flex'
    body.classList.add("fixedAbilities")

    while(popupAbilities.firstChild){
        popupAbilities.removeChild(popupAbilities.firstChild)
    }

    optionRequirementArray.forEach(optionRequirement => {
        const requirementsMainContainer = document.createElement("ul")

        if(optionRequirement in moves){
            const requirement = document.createElement("li"); requirement.innerText = moves[optionRequirement]["ingameName"]
            requirementsMainContainer.append(requirement)
        }
        else if(optionRequirement in abilities){
            const requirement = document.createElement("li"); requirement.innerText = abilities[optionRequirement]["ingameName"]
            requirementsMainContainer.append(requirement)
        }
        else if(optionRequirement in eventsRequirements){
            for(const requirementValue of eventsRequirements[optionRequirement]){
                const requirement = document.createElement("li")
                if(requirementValue in moves){
                    requirement.innerText = moves[requirementValue]["ingameName"]
                }
                else if(requirementValue in abilities){
                    requirement.innerText = abilities[requirementValue]["ingameName"]
                }
                requirementsMainContainer.append(requirement)
            }
        }

        popupAbilities.append(requirementsMainContainer)
    })
}







function eventMarkdown(el){
    const markdownMatch = el.innerHTML.match(/@\[.*?\]{.*?}/g)
    if(markdownMatch){
        markdownMatch.forEach(markdown => {
            const match = markdown.match(/@\[(.*?)\]{(.*?)}/)
            el.innerHTML = el.innerHTML.replace(markdown, `<span class="${match[1]}">${match[2]}</span>`)
        })
    }

    const markdownTooltipMatch = el.innerHTML.match(/\((?:\+|-|\?)\).*?(?=\((?:\+|-|\?)\)|$)/gs)
    if(markdownTooltipMatch){
        markdownTooltipMatch.forEach(markdown => {
            if(/\((?:-|\?)\)/.test(markdown)){
                el.innerHTML = el.innerHTML.replace(markdown, `<span class="SUMMARY_BLUE">${markdown}</span>`)
            }
            else if(/\(\+\)/.test(markdown)){
                el.innerHTML = el.innerHTML.replace(markdown, `<span class="SUMMARY_GREEN">${markdown}</span>`)
            }
        })
    }

    return el
}







async function setupEvents(){
    window.eventsTable = document.createElement("table"); eventsTable.setAttribute("ID", "eventsTable"); eventsTable.classList = "hide"
    window.eventsTableTbody = document.createElement("tbody"); eventsTableTbody.setAttribute("ID", "eventsTableTbody")
    eventsTable.append(eventsTableTbody)
    table.append(eventsTable)

    const eventsFilter = document.createElement("div"); eventsFilter.setAttribute("ID", "eventsFilter"); eventsFilter.classList = "hide"
    const eventsFilterList = document.createElement("div"); eventsFilterList.setAttribute("ID", "eventsFilterList"); eventsFilterList.classList = "filterList"
    const eventsFilterContainer = document.createElement("div"); eventsFilterContainer.setAttribute("ID", "eventsFilterContainer"); eventsFilterContainer.classList = "filterContainer"
    eventsFilter.append(eventsFilterList)
    eventsFilter.append(eventsFilterContainer)
    tableFilter.append(eventsFilter)

    window.eventsButton = document.createElement("button"); eventsButton.setAttribute("type", "button"); eventsButton.setAttribute("ID", "eventsButton"); eventsButton.innerText = "Event"
    tableButton.append(eventsButton)
    eventsButton.addEventListener("click", async () => {
        if(!eventsButton.classList.contains("activeButton")){
            await tableButtonClick("events")
        }
    })

    let typingTimerEvent
    let doneTypingIntervalEvent = 300
    window.eventsInput = document.createElement("input"); eventsInput.setAttribute("type", "search"); eventsInput.setAttribute("ID", "eventsInput"); eventsInput.classList = "hide"
    tableInput.append(eventsInput)
    eventsInput.addEventListener("input", e => {
        clearTimeout(typingTimerEvent)
        typingTimerEvent = setTimeout(function(){
            const value = e.target.value
            //filterFilters(value)
            filterTableInput(value, events, ["title", "tier"])
        }, doneTypingIntervalEvent)
    })
}










function getEventSpriteSrc(eventObj, biome){
    if(sprites[eventObj["name"]]){
        if(sprites[eventObj["name"]].length < 500){
            localStorage.removeItem(eventObj["name"])
            spriteEventLocalStorageBase64(eventObj, biome)
            return getBiomeSpriteSrc(biome)
        }
        else{
            return sprites[eventObj["name"]]
        }
    }
    else{
        spriteEventLocalStorageBase64(eventObj, biome)
        return getBiomeSpriteSrc(biome)
    }
}








function spriteEventLocalStorageBase64(eventObj, biome){
    const ySpriteTarget = 77
    let append = [["bg", 0, 0], ["a", 0, 0], ["b", 0, 0]].concat(eventObj["sprite"])
    if(biome === "end"){
        append = [["bg", 0, 0]].concat(eventObj["sprite"])
    }
    
    let sprite = []
    let completed = []
    let canvas = document.createElement("canvas")
    const context = canvas.getContext('2d')
    canvas.width = 320
    canvas.height = 132
    for(let i = 0; i < append.length; i++){
        sprite.push(new Image())

        sprite[i].crossOrigin = 'anonymous'
        if(append[i][0] == "bg" || append[i][0] == "a" || append[i][0] == "b"){
            sprite[i].src = `https://raw.githubusercontent.com/${repo}/public/images/arenas/${biome}_${append[i][0]}.png`
        }
        else{
            if(append[i][0] in species){
                if(sprites[append[i][0]]){
                    sprite[i].src = sprites[append[i][0]]
                }
                else{
                    const speciesSprite = new Image()
                    speciesSprite.crossOrigin = 'anonymous'
                    speciesSprite.src = `https://raw.githubusercontent.com/${repo}/public/images/pokemon/${species[append[i][0]]["sprite"]}.png`
                    speciesSprite.onload = async () => {
                        sprite[i].src = await returnSpriteDataWithJSON(`https://raw.githubusercontent.com/${repo}/public/images/pokemon/${species[append[i][0]]["sprite"]}.png`, speciesSprite)
                    }
                }
            }
            else if(/\/trainer\//.test(append[i][0]) || /\/mystery-encounters\//.test(append[i][0])){
                const trainerSprite = new Image()
                trainerSprite.crossOrigin = 'anonymous'
                trainerSprite.src = append[i][0]
                trainerSprite.onload = async () => {
                    sprite[i].src = await returnSpriteDataWithJSON(append[i][0], trainerSprite)
                }
            }
            else{
                sprite[i].src = append[i][0]
            }
        }


        sprite[i].onload = async () => {
            completed.push(i)
            if(completed.length == append.length){
                for(let j = 0; j < sprite.length; j++){
                    let x = append[j][1], y = append[j][2]
                    if(sprite[j].width != canvas.width){
                        y += ySpriteTarget - sprite[j].height
                        x -= sprite[j].width / 2
                    }
                    context.imageSmoothingEnabled = false
                    context.drawImage(sprite[j], 0, 0, sprite[j].width, sprite[j].height, x, y, sprite[j].width, sprite[j].height)
                }
                if(!localStorage.getItem(eventObj["name"])){
                    localStorage.setItem(eventObj["name"], LZString.compressToUTF16(canvas.toDataURL()))
                    sprites[eventObj["name"]] = canvas.toDataURL()
                }
                const els = document.getElementsByClassName(`sprite${eventObj["name"]}`)
                for(let l = 0; l < els.length; l++){
                    els[l].src = canvas.toDataURL()
                }
            }
        }
    }
}











async function returnSpriteDataWithJSON(url, sprite){
    let canvas = document.createElement("canvas")

    let canvasWidth = 64
    let canvasHeight = 64
    let frameX = 0
    let frameY = 0

    const rawJson = await fetch(url.replace(/\.png$/, ".json"))
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

    const context = canvas.getContext('2d')
    context.imageSmoothingEnabled = false

    context.drawImage(sprite, -frameX, -frameY)

    return canvas.toDataURL()
}