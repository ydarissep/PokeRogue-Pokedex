async function regexStrategies(textStrategies, strategies){
    const lines = textStrategies.split("\n")
    let name = null, inBracket = false, pushLine = false

    lines.forEach(line => {
        line = line.trim()

        if(line === "{"){
            if(name){
                inBracket = true
                createAndInitializeSetForSpecies(strategies, name)
            }
        }
        else if(line === "}," || line === "}"){
            inBracket = false
            pushLine = false
            name = null
        }
        else if(!inBracket){
            matchSpecies = line.match(/SPECIES_\w+/i)
            if(matchSpecies){
                name = matchSpecies[0]
            }
            else if(`SPECIES_${line.toUpperCase().replaceAll(/-|'| |_/g, "_")}` in species){
                name = `SPECIES_${line.toUpperCase().replaceAll(/-|'| |_/g, "_")}`
            }
        }
        else if(inBracket){
                
            const i = strategies[name].length - 1

            if(/name *=/i.test(line)){
                strategies[name][i]["name"] = line.match(/= *(.*)$/)[1].trim() // regex is fun
            }
            else if(/item *=/i.test(line)){
                if(/ITEM_\w+/i.test(line)){
                    strategies[name][i]["item"] = line.match(/ITEM_\w+/i)[0]
                }
                else{
                    strategies[name][i]["item"] = line.match(/= *(.*)/i)[1]
                }
            }
            else if(/ability *=/i.test(line)){
                if(/= *\d+/i.test(line)){
                    strategies[name][i]["ability"] = species[name]["abilities"][parseInt(line.match(/\d+/)[0])]
                }
                else{
                    strategies[name][i]["ability"] = line.match(/= *(.*)/i)[1]
                }
            }
            else if(/evs *=/i.test(line)){
                strategies[name][i]["evs"] = line.match(/\d+/g)
            }
            else if(/nature *=/i.test(line)){
                if(/NATURE_\w+/i.test(line)){
                    strategies[name][i]["nature"] = line.match(/NATURE_\w+/i)[0]
                }
                else{
                    strategies[name][i]["nature"] = line.match(/= *(.*)/i)[1]
                }
            }
            else if(/moves *=/i.test(line)){
                if(/MOVE_\w+/i.test(line)){
                    strategies[name][i]["moves"] = line.match(/MOVE_\w+/gi)
                }
                else{
                    strategies[name][i]["moves"] = line.match(/= *(.*)/i)[1].split(",")
                }
            }
            else if(/moves *=/i.test(line)){
                if(/MOVE_\w+/i.test(line)){
                    strategies[name][i]["moves"] = line.match(/MOVE_\w+/gi)
                }
                else{
                    strategies[name][i]["moves"] = line.match(/= *(.*)/i)[1].split(",")
                }
            }
            else if(/tags *=/i.test(line)){
                if(/,/.test(line)){
                    strategies[name][i]["tags"] = line.match(/= *(.*)/i)[1].split(",")
                }
                else{
                    strategies[name][i]["tags"].push(line.match(/= *(.*)/i)[1])
                }
            }
            else if(/comment *=/i.test(line)){
                strategies[name][i]["comment"].push(line.match(/= *(.*)/i)[1])
                pushLine = "comment"
            }
            else if(/paste *=/i.test(line)){
                strategies[name][i]["paste"].push(line.match(/= *(.*)/i)[1])
                pushLine = "paste"
            }
            else if(pushLine){
                if(/^\w+ *=/i.test(line) || line === "}," || line === "}"){
                    pushLine = false
                }
                else{
                    strategies[name][i][pushLine].push(line)
                }
            }
        }
    })

    return strategies
}



function createAndInitializeSetForSpecies(strategies, name){
    if(!strategies[name]){
        strategies[name] = []
    }

    strategies[name].push({})

    const i = strategies[name].length - 1

    strategies[name][i]["name"] = ""
    strategies[name][i]["item"] = ""
    strategies[name][i]["ability"] = 0
    strategies[name][i]["evs"] = []
    strategies[name][i]["nature"] = ""
    strategies[name][i]["moves"] = []
    strategies[name][i]["comment"] = []
    strategies[name][i]["tags"] = []
    strategies[name][i]["paste"] = []
}