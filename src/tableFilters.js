fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/tableFilters.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace("if(!species[name][\"abilities\"].includes(abilityName)){", "if(!species[name][\"abilities\"].includes(abilityName)){\nif(species[name][\"starterAbility\"] == abilityName){continue}\n")
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})





