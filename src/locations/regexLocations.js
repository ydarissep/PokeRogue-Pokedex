function regexBiomes(textBiomes, locations, conversionTable){
	const speciesBiomesMatch = textBiomes.match(/\[\s*Species\.\w+\s*,\s*Type.*?(?=\[\s*Species\.\w+\s*,\s*Type|]\s*;)/igs)
	if(speciesBiomesMatch){
		speciesBiomesMatch.forEach(speciesMatch => {

			let baseSpecies = speciesMatch.match(/Species\.\w+/)[0].toUpperCase().replace(".", "_")
			if(baseSpecies in species){

				const biomesMatch = speciesMatch.match(/Biome\.\w+.*?]\s*(?:,|$)/igs)
				if(biomesMatch){
					biomesMatch.forEach(biomeMatch => {
						const biomeName = sanitizeString(biomeMatch.match(/Biome\.(\w+)/i)[1])

						let tier = biomeMatch.match(/BiomePoolTier\.(\w+)/i)
						if(tier){
							tier = sanitizeString(tier[1])

							if(!(biomeName in locations)){
								locations[biomeName] = {}
							}

							if(!(tier in locations[biomeName])){
								locations[biomeName][tier] = {}
							}

							let speciesName = baseSpecies
							if(`${speciesName}${biomeName}` in conversionTable){
								if(species[speciesName]["forms"][conversionTable[`${speciesName}${biomeName}`]]){
									speciesName = species[speciesName]["forms"][conversionTable[`${speciesName}${biomeName}`]]
								}
							}

							const timeOfDayMatch = biomeMatch.match(/TimeOfDay\.\w+/ig)
							if(timeOfDayMatch){
								timeOfDayMatch.forEach(timeOfDay => {
									timeOfDay = sanitizeString(timeOfDay.match(/timeOfDay\.(\w+)/i)[1])
									speciesName = baseSpecies

									if(`${speciesName}${biomeName}` in conversionTable){
										if(species[speciesName]["forms"][conversionTable[`${speciesName}${biomeName}`]]){
											speciesName = species[speciesName]["forms"][conversionTable[`${speciesName}${biomeName}`]]
										}
									}

									if(`${speciesName}${timeOfDay}` in conversionTable){
										if(species[speciesName]["forms"][conversionTable[`${speciesName}${timeOfDay}`]]){
											speciesName = species[speciesName]["forms"][conversionTable[`${speciesName}${timeOfDay}`]]
										}
									}

									if(!(speciesName in locations[biomeName][tier])){
										locations[biomeName][tier][speciesName] = [timeOfDay]
									}
									else{
										locations[biomeName][tier][speciesName].push(timeOfDay)
									}
								})
							}
							else{
								locations[biomeName][tier][speciesName] = ["All"]
							}
						}
					})
				}
			}
		})
	}






	const biomeLinksMatch = textBiomes.match(/const\s*biomeLinks.*?}\s*;/is)
	if(biomeLinksMatch){
		const biomesMatch = biomeLinksMatch[0].match(/\[\s*Biome\.\w+\s*\].*?$/igm)
		if(biomesMatch){
			biomesMatch.forEach(biomeMatch => {
				const biomeNameMatch = biomeMatch.match(/\[\s*Biome\.(\w+)\s*\]/i)
				const biomeName = sanitizeString(biomeNameMatch[1])

				biomeLinks[biomeName] = []

				biomeMatch = biomeMatch.replace(biomeNameMatch[0], "")

				const linkMatch = biomeMatch.match(/Biome.\w+\s*(?:,\s*\d+)?/ig)
				if(linkMatch){
					linkMatch.forEach(nextLink => {
						const weightMatch = nextLink.match(/,\s*(\d+)/)
						if(weightMatch){
							biomeLinks[biomeName].push([sanitizeString(nextLink.match(/Biome.(\w+)/i)[1]), parseInt(100 / weightMatch[1])])
						}
						else{
							biomeLinks[biomeName].push([sanitizeString(nextLink.match(/Biome.(\w+)/i)[1]), 100])
						}
					})
				}
			})
		}
	}

    return locations
}







async function getBiomesFormsConverionTable(textBiomesForms){
	let conversionTable = {}
	const textBiomesFormsMatch = textBiomesForms.match(/getSpeciesFormIndex.*?getTypeForBiome/is)
	if(textBiomesFormsMatch){
		let stop = false
		let speciesArray = []
		let biomesObj = {}
		let currentBiome = null

		const lines = textBiomesFormsMatch[0].split("\n")
		lines.forEach(line => {
			let speciesMatch = line.match(/Species\.\w+/i)
			if(speciesMatch){
				speciesMatch = speciesMatch[0].toUpperCase().replace(".", "_")
				if(speciesMatch in species){
					if(stop){
						speciesArray = []
						biomesObj = {}
						currentBiome = null
						stop = false
					}
					speciesArray.push(speciesMatch)
				}
			}
			let biomeMatch = line.match(/(?:Biome|TimeOfDay)\.(\w+)/i)
			if(biomeMatch){
				currentBiome = sanitizeString(biomeMatch[1])
			}
			let intMatch = line.match(/return\s*(\d+)/i)
			if(intMatch){
				intMatch = parseInt(intMatch[1])
				stop = true
			}

			if((Number.isInteger(intMatch) && currentBiome)){
				biomesObj[currentBiome] = intMatch
				currentBiome = null
				speciesArray.forEach(speciesName => {
					Object.keys(biomesObj).forEach(biome => {
						conversionTable[`${speciesName}${biome}`] = biomesObj[biome]
					})
				})
			}
		})
	}

	return conversionTable
}











async function getBiomesTranslationTable(jsonBiomesTranslation){
	let translationTable = {}
	Object.keys(jsonBiomesTranslation).forEach(biome => {
		translationTable[sanitizeString(biome)] = jsonBiomesTranslation[biome]
	})

	return translationTable
}