window.repo = "pagefaultgames/pokerogue/main"
window.checkUpdate = "7 PR"


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

    // Hide egg moves button
    let tempSettings = []
    if(localStorage.getItem("DEXsettings")){
        tempSettings = JSON.parse(localStorage.getItem("DEXsettings"))
    }
    const hideEggMovesButton = document.createElement("button"); hideEggMovesButton.setAttribute("type", "button"); hideEggMovesButton.innerText = "Show Egg Moves"; hideEggMovesButton.setAttribute("ID", "hideEggMovesButton")
    if(tempSettings.includes("hideEggMovesButton")){
        hideEggMovesButton.classList.add("activeSetting")
    }
    else{
        document.getElementById("speciesPanelEggMovesTableTbody").classList.add("hide")
    }
    document.getElementById("speciesPanelEggMovesTable").children[0].append(hideEggMovesButton)
    hideEggMovesButton.addEventListener("click", () => {
        hideEggMovesButton.classList.toggle("activeSetting")
        if(hideEggMovesButton.classList.contains("activeSetting")){
            document.getElementById("speciesPanelEggMovesTableTbody").classList.remove("hide")
            settings.push("hideEggMovesButton")
        }
        else{
            document.getElementById("speciesPanelEggMovesTableTbody").classList.add("hide")
            settings = settings.filter(value => value != "hideEggMovesButton")
        }
        localStorage.setItem("DEXsettings", JSON.stringify(settings))
    })
    // ---------------------------------------------------------------------------

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