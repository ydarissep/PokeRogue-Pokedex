function regexBiomes(textBiomes, locations){
	const biomesMatch = textBiomes.match(/Biome\.\w+\s*]\s*:\s*{\s*\[\s*BiomePoolTier\.\w+\s*\]\s*:\s*{\s*\[\s*TimeOfDay.\w+.*?(?=Biome\.\w+\s*]|}\s*;)/igs)
	if(biomesMatch){
		biomesMatch.forEach(biome => {

			let biomeName = biome.match(/Biome\.(\w+)/i)
			if(biomeName){

				biomeName = sanitizeString(biomeName[1])

				const biomePoolTierMatch = biome.match(/BiomePoolTier\.\w+.*?(?=BiomePoolTier\.\w+|$)/igs)
				if(biomePoolTierMatch){
					biomePoolTierMatch.forEach(biomePoolTier => {

						const tier = sanitizeString(biomePoolTier.match(/BiomePoolTier\.(\w+)/i)[1])

						const timeOfDayMatch = biomePoolTier.match(/TimeOfDay\.\w+.*?(?=TimeOfDay\.\w+|$)/igs)
						if(timeOfDayMatch){
							timeOfDayMatch.forEach(timeOfDayPool => {

								const timeOfDay = sanitizeString(timeOfDayPool.match(/TimeOfDay\.(\w+)/)[1])

								const speciesNameMatch = timeOfDayPool.match(/Species\.\w+/igs)
								if(speciesNameMatch){
									speciesNameMatch.forEach(speciesName => {

										speciesName = speciesName.toUpperCase().replace(".", "_")

										if(speciesName in species){

											if(!(biomeName in locations)){
												locations[biomeName] = {}
											}

											if(!(timeOfDay in locations[biomeName])){
												locations[biomeName][timeOfDay] = {}
											}

											locations[biomeName][timeOfDay][speciesName] = tier
										}
									})
								}
							})
						}
					})
				}
			}
		})
	}

    return locations
}





function replaceMethodString(method, index){
	if(method.match(/fish/i)){
		if(index >=0 && index <= 1)
			return "Old Rod"
		else if(index >= 2 && index <= 4)
			return "Good Rod"
		else if(index >= 5 && index <= 9)
			return "Super Rod"
		else
			return "Fishing"
	}
	else if(method.match(/water/i)){
		return "Surfing"
	}
	else if(method.match(/smash/i)){
		return "Rock Smash"
	}
	else if(method.match(/land/i)){
		return "Land"
	}
	else if(method.match(/honey/i)){
		return "Honey"
	}
    else{
    	console.log(method)
        return method
    }
}


function returnRarity(method, index){
	if(method === "Land" || method === "land_mons"){
		if(index === 0 || index === 1)
			return 20
		else if(index >= 2 && index <= 5){
			return 10
		}
		else if(index >= 6 && index <= 7){
			return 5
		}
		else if(index >= 8 && index <= 9){
			return 4
		}
		else if(index >= 10 || index <= 11){
			return 1
		}
		else
			return 100
	}
	if(method === "Honey"){
		if(index === 0)
			return 50
		else if(index >= 1 && index <= 2){
			return 15
		}
		else if(index === 3){
			return 10
		}
		else if(index >= 4 && index <= 5){
			return 5
		}
		else
			return 100
	}
	else if(method === "Surfing" || method === "Rock Smash"){
		if(index === 0)
			return 60
		else if(index === 1)
			return 30
		else if(index === 2)
			return 5
		else if(index === 3)
			return 5
		else
			return 100
	}
	else if(method === "Old Rod"){
		if(index === 0)
			return 60
		else if(index === 1)
			return 40
		else 
			return 100
	}
	else if(method === "Good Rod"){
		if(index === 2)
			return 60
		else if(index === 3 || index === 4)
			return 20
		else 
			return 100
	}
	else if(method === "Super Rod"){
		if(index === 5)
			return 40
		else if(index === 6)
			return 30
		else if(index === 7)
			return 15
		else if(index === 8)
			return 10
		else if(index === 9)
			return 5
		else 
			return 100
	}
    else{
        return 100
    }
}