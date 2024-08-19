window.repo = "pagefaultgames/pokerogue/main"
window.checkUpdate = "25 PR"
window.lang = "en"


fetch('https://raw.githubusercontent.com/ydarissep/dex-core/main/index.html').then(async response => {
	return response.text()
}).then(async rawHTMLText => {
	const parser = new DOMParser()
	const doc = parser.parseFromString(rawHTMLText, 'text/html')
    document.querySelector('html').innerHTML = doc.querySelector('html').innerHTML




    document.title = "PokeRogue Dex"
    document.getElementById("footerName").innerText = "PokeRogue\nYdarissep Pokedex"

    document.getElementById("speciesPanelTutorTable").classList.add("hide")
    document.getElementById("speciesEggGroupsText").innerText = "Starter Cost:"

    document.getElementById("speciesPanelTablesContainer").insertBefore(document.getElementById("speciesPanelEggMovesTable"), document.getElementById("speciesPanelLevelUpFromPreviousEvoTable"))
    document.getElementById("locationsButton").innerText = "Biomes"

    document.getElementById("changelogMode").classList.add("hide")
    document.getElementById("onlyShowChangedPokemon").classList.add("hide")

    insertVariantsContainer()

    window.speciesPanelWeight = document.createElement("div"); speciesPanelWeight.setAttribute("ID", "speciesPanelWeight")
    document.getElementById("speciesPanelSubcontainer3").prepend(speciesPanelWeight)

    window.speciesPanelBiomesContainer = document.createElement("span"); speciesPanelBiomesContainer.setAttribute("ID", "speciesPanelBiomesContainer"); speciesPanelBiomesContainer.classList = "speciesPanelTextPadding"
    speciesBaseStatsGraphContainer.append(speciesPanelBiomesContainer)

    window.variantButton = document.createElement("button"); variantButton.setAttribute("ID", "onlyShowVariantPokemon"); variantButton.classList = "setting"; variantButton.type = "button"; variantButton.innerText = "Variant"
    variantButton.addEventListener("click", () => {
        variantFilter(variantButton)
    })
    document.getElementById("speciesFilter").insertBefore(variantButton, document.getElementById("speciesFilterList"))

    const variantButtonLocations = document.createElement("button"); variantButtonLocations.setAttribute("ID", "onlyShowVariantPokemonLocations"); variantButtonLocations.classList = "setting"; variantButtonLocations.type = "button"; variantButtonLocations.innerText = "Variant"
    variantButtonLocations.addEventListener("click", () => {
        variantFilter(variantButtonLocations)
    })
    document.getElementById("locationsFilter").insertBefore(variantButtonLocations, document.getElementById("locationsFilterList"))

    /*
    window.hideLinksFilter = document.createElement("button"); hideLinksFilter.setAttribute("ID", "hideLinksFilter"); hideLinksFilter.classList = "setting"; hideLinksFilter.type = "button"; hideLinksFilter.innerText = "Hide Links"
    hideLinksFilter.addEventListener("click", () => {
        hideLinks(hideLinksFilter)
    })
    document.getElementById("locationsFilter").insertBefore(hideLinksFilter, document.getElementById("locationsFilterList"))
    */

    speciesSprite.addEventListener("contextmenu", (e) => { // right click download sprite animation as gif in speciesPanel
        if(typeof spriteAnimation != "undefined" && animateIconContainer.classList.contains("animateActive")){
            if(Object.keys(spriteAnimation["frames"]).length > 1){
                let index = variantsContainer.querySelector(".activeVariant")
                if(index && !index.classList.contains("hide")){
                    index = parseInt(index.id.match(/\d/)[0])
                }
                else{
                    index = "base"
                }
                if(index == spriteAnimation["index"]){
                    e.preventDefault()
                    let canvas = document.createElement("canvas")
                    const sheet = spriteAnimation["sheet"]
                    canvas.width = spriteAnimation["width"]
                    canvas.height = spriteAnimation["height"]
                    const context = canvas.getContext('2d')

                    let encoder = new GIFEncoder()
                    encoder.setRepeat(0)
                    encoder.setDelay(83)
                    encoder.setQuality(1)
                    encoder.start()

                    Object.keys(spriteAnimation["frames"]).forEach(key => {
                        context.clearRect(0, 0, canvas.width, canvas.height)
                        context.drawImage(sheet, spriteAnimation["frames"][key][2], spriteAnimation["frames"][key][3], spriteAnimation["frames"][key][0], spriteAnimation["frames"][key][1], spriteAnimation["frames"][key][4], spriteAnimation["frames"][key][5], spriteAnimation["frames"][key][0], spriteAnimation["frames"][key][1])

                        encoder.addFrame(context)
                    })

                    encoder.finish()
                    encoder.download(`${sanitizeString(panelSpecies)}_${index}.gif`)
                }
            }
        }
    })

    await fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/global.js").then(async response => {
        return response.text()
    }).then(async text => {
        text = text.replaceAll("filterLocationsTableInput", "filterLocationsTableInputNew")
        text = text.replace(/filterTableInput\(value, species, \[.*?\]\)/, 'filterTableInput(value, species, ["name", "ingameName", "abilities", "innates", "starterAbility", "ID"])')
        await eval.call(window,text)
    }).catch(error => {
        console.warn(error)
    })    
}).catch(error => {
	console.warn(error)
})







function filterLocationsTableInputNew(input, obj, keyArray){
    const arraySanitizedInput = input.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/-|'| |,|_/g)

    mainLoop: for(let i = 0, j = Object.keys(tracker).length; i < j; i++){
        const zone = tracker[i]["key"].split("\\")[0]
        const rarity = tracker[i]["key"].split("\\")[1]
        const name = tracker[i]["key"].split("\\")[2]
        let compareString = `${zone},${name},`.replaceAll(/-|'| |_/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        if(name in species){
            for (let k = 0; k < keyArray.length; k++){
                if(keyArray[k] === "evolutionLine"){
                    obj[name][keyArray[k]].forEach(evoName => {
                        compareString += (species[evoName]["ingameName"] + ",").replaceAll(/-|'| |_|species/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
                        compareString += sanitizeString(evoName).toLowerCase()
                    })
                }
                else{
                    compareString += (obj[name][keyArray[k]] + ",").replaceAll(/-|'| |_|species/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
                }
            }
            testLoop:for(splitInput of arraySanitizedInput){
                if(!compareString.includes(splitInput.toLowerCase())){
                    if(!rarity.match(new RegExp(`(?:\s+|^)${splitInput}`, "i"))){
                        if(/(?:\s+|^)boss/i.test(input) && new RegExp(splitInput, "i").test(rarity)){
                            continue testLoop
                        }
                        tracker[i]["filter"].push("input")
                        continue mainLoop
                    }
                }
            }
            tracker[i]["filter"] = tracker[i]["filter"].filter(value => value !== "input")
        }
    }

    lazyLoading(true)
}








function variantFilter(el){
    el.classList.toggle("activeSetting")

    let locationsKey = false
    if(tracker == locationsTracker){
        locationsKey = true
    }

    for(let i = 0, j = tracker.length; i < j; i++){
        if(el.classList.contains("activeSetting")){
            let key = tracker[i]["key"]
            if(locationsKey){
                key = key.split("\\")[2]
            }
            if(species[key]["variant"].length <= 1){
                tracker[i]["filter"].push("variant")
            }
        }
        else{
            tracker[i]["filter"] = tracker[i]["filter"].filter(value => value !== "variant")
        }
    }
    lazyLoading(true)
}








function hideLinks(el){
    el.classList.toggle("activeSetting")

    locationsTable.querySelectorAll(".nextBiomeContainer, .previousBiomeContainer").forEach(biomeContainer => {
        if(el.classList.contains("activeSetting")){
            biomeContainer.classList.add("hide")
        }
        else{
            biomeContainer.classList.remove("hide")
        }
    })
}