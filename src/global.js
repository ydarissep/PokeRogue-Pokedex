window.repo = "pagefaultgames/pokerogue/main"
window.checkUpdate = "1 PR"


fetch('https://raw.githubusercontent.com/ydarissep/dex-core/main/index.html').then(async response => {
	return response.text()
}).then(async rawHTMLText => {
	const parser = new DOMParser()
	const doc = parser.parseFromString(rawHTMLText, 'text/html')
    document.querySelector('html').innerHTML = doc.querySelector('html').innerHTML




    document.title = "PokeRogue Dex"
    document.getElementById("footerName").innerText = "PokeRogue\nYdarissep Pokedex"

    document.getElementById("speciesPanelTutorTable").classList.add("hide")
    document.getElementById("speciesEggGroupsContainer").classList.add("hide")

    document.getElementById("speciesPanelTablesContainer").insertBefore(document.getElementById("speciesPanelEggMovesTable"), document.getElementById("speciesPanelLevelUpFromPreviousEvoTable"))


    await fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/global.js").then(async response => {
        return response.text()
    }).then(async text => {
        await eval.call(window,text)
    }).catch(error => {
        console.warn(error)
    })    

}).catch(error => {
	console.warn(error)
})


