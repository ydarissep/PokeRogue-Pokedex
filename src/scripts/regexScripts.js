async function regexTrainersParties(textTrainers){
    const matchTrainers = textTrainers.match(/\[\s*TrainerType\.\w+\s*].*?(?=\[\s*TrainerType\.\w+\s*]|}\s*;)/igs)
    if(matchTrainers){
        matchTrainers.forEach(trainer => {
            console.log(trainer)
        })
    }
}





function initTrainer(trainers, trainer, zone){
    if(!trainers[zone]){
        trainers[zone] = {}
    }
    if(!trainers[zone][trainer]){
        trainers[zone][trainer] = {}
    }
    trainers[zone][trainer]["sprite"] = ""
    trainers[zone][trainer]["ingameName"] = sanitizeString(trainer)
    trainers[zone][trainer]["items"] = []
    trainers[zone][trainer]["double"] = false
    trainers[zone][trainer]["party"] = {}
}


function initItem(name){
    items[name] = {}
    items[name]["name"] = name
    items[name]["url"] = ""
    items[name]["description"] = ""
    items[name]["locations"] = {}
    items[name]["pocket"] = ""
    items[name]["price"] = 0
    items[name]["ingameName"] = sanitizeString(name)
    items[name]["effect"] = ""
}