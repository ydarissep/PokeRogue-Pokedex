function regexMovesDescription(textMovesDescription, moves){
    const movesMatch = textMovesDescription.match(/.*?:.*?\}/igs)
    if(movesMatch){
        movesMatch.forEach(moveMatch => {
            const moveNameMatch = moveMatch.match(/"?\s*(\w+)\s*"?\s*:\s*{/)
            if(moveNameMatch){
                const moveName = `MOVE_${moveNameMatch[1].replace(/([A-Z])/g, " $1").replace(/(\d+)/g, " $1").trim().replaceAll(" ", "_").toUpperCase()}`
                if(moveName in moves){
                    const moveIngameNameMatch = moveMatch.match(/name:\s*"(.*?)"/i)
                    if(moveIngameNameMatch){
                        moves[moveName]["ingameName"] = moveIngameNameMatch[1]
                    }
                    const moveDescMatch = moveMatch.match(/effect\s*:\s*\W(.*?)\W\s*,?\s*(?:\n|})/i)
                    if(moveDescMatch){
                        moves[moveName]["description"] = moveDescMatch[1].replaceAll(/Sp\s*\./ig, "Sp").replaceAll("\\n", "").replaceAll(/\.+/g, ".ceciEstUnPoint").split("ceciEstUnPoint")
                        moves[moveName]["description"] = moves[moveName]["description"].filter(desc => desc.trim() !== "")
                    }
                }
            }
        })
    }

    return moves
}


function regexMoves(textMoves, moves){
    let flagArray = ["unimplemented","partial"]
    const flagsMatch = textMoves.match(/this.setFlag\s*\(\s*MoveFlags\.\w+\s*,\s*\w+\s*\)/ig)
    if(flagsMatch){
        flagsMatch.forEach(flagMatch => {
            const flag = flagMatch.match(/this.setFlag\s*\(\s*MoveFlags\.\w+\s*,\s*(\w+)\s*\)/i)[1]
            if(flag !== "true" && flag !== "false"){
                flagArray.push(flag)
            }
        })
    }

    const textMovesMatch = textMoves.match(/new\s*\w+Move\(Moves\.\w+.*?(?=new\s*\w+Move\(Moves\.|$)/igs)
    if(textMovesMatch){
        textMovesMatch.forEach(moveMatch => {
            const moveName = moveMatch.match(/Moves\.\w+/i)[0].toUpperCase().replace("MOVES.", "MOVE_").replaceAll(/_+/g, "_")

            moves[moveName] = {}
            moves[moveName]["name"] = moveName
            moves[moveName]["ingameName"] = sanitizeString(moveName)
            initMove(moves[moveName])

            const split = moveMatch.match(/MoveCategory\.\w+/i)
            let stats = null
            if(split){
                moves[moveName]["split"] = split[0].toUpperCase().replace("MOVECATEGORY.", "SPLIT_")
                stats = moveMatch.match(/(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)/)
                if(stats){
                    moves[moveName]["power"] = parseInt(stats[1])
                    moves[moveName]["accuracy"] = parseInt(stats[2])
                    moves[moveName]["PP"] =  parseInt(stats[3])
                    moves[moveName]["chance"] = parseInt(stats[4])
                    moves[moveName]["priority"] = parseInt(stats[5])
                }
                if(moves[moveName]["split"] === "SPLIT_PHYSICAL" && !/makesContact\(\s*false/i.test(moveMatch)){
                    moves[moveName]["flags"].push("FLAG_MAKES_CONTACT")
                }
            }
            else{
                moves[moveName]["split"] = "SPLIT_STATUS"
                stats = moveMatch.match(/(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)/)
                if(stats){
                    moves[moveName]["power"] = 0
                    moves[moveName]["accuracy"] = parseInt(stats[1])
                    moves[moveName]["PP"] =  parseInt(stats[2])
                    moves[moveName]["chance"] = parseInt(stats[3])
                    moves[moveName]["priority"] = parseInt(stats[4])
                }
            }

            const target = moveMatch.match(/MoveTarget\.\w+/i)
            if(target){
                moves[moveName]["target"] = target[0].toUpperCase().replace("MOVETARGET.", "MOVE_TARGET_")
            }

            const type = moveMatch.match(/Type\.\w+/i)
            if(type){
                moves[moveName]["type"] = type[0].toUpperCase().replace(".", "_")
            }

            const flags = moveMatch.match(/\.\w+\(\)/g)
            if(flags){
                flags.forEach(flag => {
                    const flagName = flag.match(/\w+/)[0]
                    if(flagArray.includes(flagName)){
                        moves[moveName]["flags"].push(`FLAG_${flagName.replace(/([A-Z])/g, " $1").replace(/(\d+)/g, " $1").trim().replaceAll(" ", "_").toUpperCase()}`)
                    }
                })
            }
            if(/.attr\s*\(\s*HighCritAttr/i.test(moveMatch)){
                moves[moveName]["flags"].push("FLAG_HIGH_CRIT")
            }

            let effect = "EFFECT"
            const status = moveMatch.match(/\(\s*StatusEffectAttr\s*,\s*StatusEffect.(\w+)\)/i)
            if(status){
                effect = `${effect}_${status[1].toUpperCase()}`
            }
            const flinch = moveMatch.match(/.attr\(\s*FlinchAttr\s*\)/i)
            if(flinch){
                effect = `${effect}_FLINCH`
            }
            const confuse = moveMatch.match(/.attr\(\s*ConfuseAttr\s*\)/i)
            if(confuse){
                effect = `${effect}_CONFUSE`
            }
            const statsChangeMatch = moveMatch.match(/.attr\(\s*StatChangeAttr.*?\)/ig)
            if(statsChangeMatch){
                statsChangeMatch.forEach(statsChange => {
                    let string = ""
                    const intMatch = statsChange.match(/-?\d+/)
                    if(intMatch){
                        const statsMatch = statsChange.match(/BattleStat\.(?:HP|ATK|DEF|SPATK|SPDEF|SPD|ACC)\s*(?:,|\)|\])/ig)
                        if(statsMatch){
                            const change = parseInt(intMatch[0])
                            if(change > 0){
                                string = "UP"
                            }
                            else if(change < 0){
                                string = "LOWER"
                            }
                            statsMatch.forEach(stat => {
                                string = `${string}_${stat.match(/BattleStat\.(HP|ATK|DEF|SPATK|SPDEF|SPD|ACC)\s*(?:,|\)|\])/)[1]}`
                            })
                            string = `${string}_${Math.abs(change)}`
                            effect = `${effect}_${string}`
                        }
                    }
                })
            }
            if(effect !== "EFFECT" && lang === "en"){
                moves[moveName]["effect"] = effect
            }

            validateMove(moves, moveName)
        })
    }

    return moves
}




function initMove(moveObj){
    moveObj["PP"] = null
    moveObj["accuracy"] = null
    moveObj["chance"] = 0
    moveObj["changes"] = []
    moveObj["description"] = []
    moveObj["effect"] = ""
    moveObj["flags"] = []
    moveObj["power"] = null
    moveObj["priority"] = null
    moveObj["target"] = ""
    moveObj["type"] = null
}






function validateMove(moves, moveName){
    const moveObj = moves[moveName]
    if(moveObj["PP"] == null || moveObj["accuracy"] == null || moveObj["power"] == null || moveObj["priority"] == null || moveObj["type"] == null){
        if(moveName !== "MOVE_NONE"){
            delete(moves[moveName])
        }
    }
}