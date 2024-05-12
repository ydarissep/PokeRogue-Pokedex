fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/tableFilters.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace("if(!species[name][\"abilities\"].includes(abilityName)){", "if(!species[name][\"abilities\"].includes(abilityName)){\nif(species[name][\"starterAbility\"] == abilityName){continue}\n")
    text = text.replace("createFilterGroup(createFilterArray([\"flags\"], moves), \"Flag\", [movesFilterList])", "createFilterGroup(createFilterArray([\"flags\"], moves), \"Flag\", [movesFilterList])\ncreateFilterGroup(createFilterArray([\"flags\"], abilities), \"Flag\", [abilitiesFilterList])\n")
    text = text.replace(/else\s*if\(label\s*===\s*"Flag"\s*\)\s*\{\s*filterMovesFlags\s*\(\s*value,\s*label\s*\)\s*\}/is, "else if(label === \"Flag\"){if(tracker === abilitiesTracker){filterAbilitiesFlags(value, label)}else{filterMovesFlags(value, label)}}")

    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})


function filterAbilitiesFlags(value, label){
    mainLoop: for(let i = 0, j = tracker.length; i < j; i++){
        let name = tracker[i]["key"]

        for(let k = 0; k < abilities[name]["flags"].length; k++){
            if((sanitizeString(abilities[name]["flags"][k]) === value)){
                continue mainLoop
            }   
        }
        tracker[i]["filter"].push(`filter${label}${value}`.replaceAll(" ", ""))
    }
}