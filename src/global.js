window.repo = "pagefaultgames/pokerogue/main"
window.checkUpdate = "6 PR"


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
            for(splitInput of arraySanitizedInput){
                if(!compareString.includes(splitInput.toLowerCase())){
                    if(!locations[zone][method][name].match(new RegExp(`^${splitInput}`, "i"))){
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