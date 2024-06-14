function regexAbilities(textAbilities, abilities){
    const abilitiesMatch = textAbilities.match(/.*?:.*?\}/igs)
    if(abilitiesMatch){
        abilitiesMatch.forEach(abilityMatch => {
            const abilityNameMatch = abilityMatch.match(/"?(\w+)"?\s*:\s*{/)
            if(abilityNameMatch){
                const abilityName = `ABILITY_${abilityNameMatch[1].replace(/([A-Z])/g, " $1").replace(/(\d+)/g, " $1").trim().replaceAll(" ", "_").toUpperCase()}`
                abilities[abilityName] = {}
                abilities[abilityName]["name"] = abilityName
                abilities[abilityName]["ingameName"] = sanitizeString(abilityName)
                abilities[abilityName]["flags"] = []

                const abilityIngameNameMatch = abilityMatch.match(/name:\s*"(.*?)"/i)
                if(abilityIngameNameMatch){
                    abilities[abilityName]["ingameName"] = abilityIngameNameMatch[1]
                }
                const abilityDescMatch = abilityMatch.match(/description\s*:\s*\W(.*?)\W\s*,?\s*(?:\n|})/i)
                if(abilityDescMatch){
                    abilities[abilityName]["description"] = abilityDescMatch[1].replaceAll("\\n", " ")
                }
            }
        })
    }

    return abilities
}





function regexAbilitiesFlags(textAbilitiesFlags, abilities){
    const textAbilitiesFlagsMatch = textAbilitiesFlags.match(/new\s*Ability\s*\(\s*Abilities\.\w+.*?(?=new\s*Ability\s*\(\s*Abilities\.\w+|\)\s*;)/igs)
    if(textAbilitiesFlagsMatch){
        textAbilitiesFlagsMatch.forEach(abilityMatch => {
            const abilityName = abilityMatch.match(/Abilities\.\w+/i)[0].toUpperCase().replace("ABILITIES.", "ABILITY_")
            if(abilityName in abilities){
                const flagMatch = abilityMatch.match(/\.partial|\.unimplemented/i)
                if(flagMatch){
                    abilities[abilityName]["flags"].push(`FLAG_${flagMatch[0].replace(".", "").toUpperCase()}`)
                }
            }
        })
    }
    
    return abilities
}