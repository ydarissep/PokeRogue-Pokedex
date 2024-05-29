window.repo = "pagefaultgames/pokerogue/main"
window.checkUpdate = "18 PR"


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

    const variantButton = document.createElement("button"); variantButton.setAttribute("ID", "onlyShowVariantPokemon"); variantButton.classList = "setting"; variantButton.type = "button"; variantButton.innerText = "Variant"
    variantButton.addEventListener("click", () => {
        variantFilter(variantButton)
    })
    document.getElementById("speciesFilter").insertBefore(variantButton, document.getElementById("speciesFilterList"))

    const variantButtonLocations = document.createElement("button"); variantButtonLocations.setAttribute("ID", "onlyShowVariantPokemonLocations"); variantButtonLocations.classList = "setting"; variantButtonLocations.type = "button"; variantButtonLocations.innerText = "Variant"
    variantButtonLocations.addEventListener("click", () => {
        variantFilter(variantButtonLocations)
    })
    document.getElementById("locationsFilter").insertBefore(variantButtonLocations, document.getElementById("locationsFilterList"))

    window.hideLinksFilter = document.createElement("button"); hideLinksFilter.setAttribute("ID", "hideLinksFilter"); hideLinksFilter.classList = "setting"; hideLinksFilter.type = "button"; hideLinksFilter.innerText = "Hide Links"
    hideLinksFilter.addEventListener("click", () => {
        hideLinks(hideLinksFilter)
    })
    document.getElementById("locationsFilter").insertBefore(hideLinksFilter, document.getElementById("locationsFilterList"))

    await fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/global.js").then(async response => {
        return response.text()
    }).then(async text => {
        text = text.replaceAll("filterLocationsTableInput", "filterLocationsTableInputNew")
        await eval.call(window,text)
    }).catch(error => {
        console.warn(error)
    })    
}).catch(error => {
	console.warn(error)
})







function filterLocationsTableInputNew(input, obj, keyArray){
    const arraySanitizedInput = input.trim().split(/-|'| |,|_/g)

    mainLoop: for(let i = 0, j = Object.keys(tracker).length; i < j; i++){
        const zone = tracker[i]["key"].split("\\")[0]
        const method = tracker[i]["key"].split("\\")[1]
        const name = tracker[i]["key"].split("\\")[2]
        let compareString = `${zone.replaceAll(/-|'| |_/g, "").toLowerCase()},${method.replaceAll(/-|'| |_/g, "").toLowerCase()},`
        if(name in species){
            for (let k = 0; k < keyArray.length; k++){
                compareString += (obj[name][keyArray[k]] + ",").replaceAll(/-|'| |_|species/gi, "").toLowerCase()
            }
            testLoop:for(splitInput of arraySanitizedInput){
                if(!compareString.includes(splitInput.toLowerCase())){
                    if(!locations[zone][method][name].match(new RegExp(`(?:\s+|^)${splitInput}`, "i"))){
                        if(/(?:\s+|^)boss/i.test(input) && new RegExp(splitInput, "i").test(locations[zone][method][name])){
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