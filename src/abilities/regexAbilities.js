function regexAbilities(jsonAbilities, abilities){
    Object.keys(jsonAbilities).forEach(ability => {
        const abilityName = `ABILITY_${ability.replace(/([A-Z])/g, " $1").replace(/(\d+)/g, " $1").trim().replaceAll(" ", "_").toUpperCase()}`
        abilities[abilityName] = {}
        abilities[abilityName]["name"] = abilityName
        abilities[abilityName]["ingameName"] = sanitizeString(abilityName)
        abilities[abilityName]["flags"] = []

        abilities[abilityName]["ingameName"] = jsonAbilities[ability]["name"]
        abilities[abilityName]["description"] = jsonAbilities[ability]["description"]
    })

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