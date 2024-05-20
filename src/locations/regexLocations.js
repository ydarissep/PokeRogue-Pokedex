function regexBiomes(textBiomes, locations, conversionTable){
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

	const biomeLinksMatch = textBiomes.match(/const\s*biomeLinks.*?}\s*;/is)
	if(biomeLinksMatch){
		const biomesMatch = biomeLinksMatch[0].match(/\[\s*Biome\.\w+\s*\].*?$/igm)
		if(biomesMatch){
			biomesMatch.forEach(biomeMatch => {
				const biomeNameMatch = biomeMatch.match(/\[\s*Biome\.(\w+)\s*\]/i)
				const biomeName = sanitizeString(biomeNameMatch[1])

				biomeLinks[biomeName] = []

				biomeMatch = biomeMatch.replace(biomeNameMatch[0], "")

				const biomeBracketMatch = biomeMatch.match(/\[\s*Biome\.\w+\s*,\s*\d+\s*\]/ig)
				if(biomeBracketMatch){
					biomeBracketMatch.forEach(biomeBracket => {
						biomeLinks[biomeName].push([sanitizeString(biomeBracket.match(/Biome\.(\w+)/i)[1]), parseInt(100 / parseInt(biomeBracket.match(/,\s*(\d+)/)[1]))])
						biomeMatch = biomeMatch.replace(biomeBracket, "")
					})
				}
				let chance = 100
				biomeLinks[biomeName].forEach(nextBiome => {
					chance -= nextBiome[1]
				})

				const remainingBiomes = biomeMatch.match(/Biome\.(\w+)/ig)
				if(remainingBiomes){
					remainingBiomes.forEach(remainingBiome => {
						biomeLinks[biomeName].push([sanitizeString(remainingBiome.match(/Biome\.(\w+)/i)[1]), parseInt(chance / remainingBiomes.length)])
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