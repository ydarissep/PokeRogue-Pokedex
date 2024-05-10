function regexAbilities(textAbilities, abilities){
    const abilitiesMatch = textAbilities.match(/.*?:.*?\}/igs)
    if(abilitiesMatch){
        abilitiesMatch.forEach(abilityMatch => {
            const abilityNameMatch = abilityMatch.match(/(\w+)\s*:\s*{/)
            if(abilityNameMatch){
                const abilityName = `ABILITY_${abilityNameMatch[1].replace(/([A-Z])/g, " $1").replace(/(\d+)/g, " $1").trim().replaceAll(" ", "_").toUpperCase()}`
                abilities[abilityName] = {}
                abilities[abilityName]["name"] = abilityName
                abilities[abilityName]["ingameName"] = sanitizeString(abilityName)

                const abilityIngameNameMatch = abilityMatch.match(/name:\s*"(.*?)"/i)
                if(abilityIngameNameMatch){
                    abilities[abilityName]["ingameName"] = abilityIngameNameMatch[1]
                }
                const abilityDescMatch = abilityMatch.match(/description:\s*"(.*?)"/i)
                if(abilityDescMatch){
                    abilities[abilityName]["description"] = abilityDescMatch[1]
                }
            }
        })
    }

    return abilities
}