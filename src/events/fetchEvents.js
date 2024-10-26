async function getEventsRequirements(){
    footerP("Fetching events")
    const rawEventsRequirements = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/mystery-encounters/requirements/requirement-groups.ts`)
    const textEventsRequirements = await rawEventsRequirements.text()

    await regexEventsRequirements(textEventsRequirements)
}

async function getEvents(){
    const rawEvents = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/mystery-encounters/mystery-encounters.ts`)
    const textEvents = await rawEvents.text()

    await regexEvents(textEvents)
}

async function getEventsInfo(){
    Object.keys(events).forEach(async event => {
        let rawEventLocales = await fetch(`https://raw.githubusercontent.com/${localesRepo}/${lang}/mystery-encounters/${event.replace("_ENCOUNTER", "").replaceAll("_", "-").toLowerCase()}-dialogue.json`)
        let jsonEventLocales = await rawEventLocales.json()

        if(!jsonEventLocales["title"]){
            rawEventLocales = await fetch(`https://raw.githubusercontent.com/${localesRepo}/en/mystery-encounters/${event.replace("_ENCOUNTER", "").replaceAll("_", "-").toLowerCase()}-dialogue.json`)
            jsonEventLocales = await rawEventLocales.json()
        }

        const rawEvent = await fetch(`https://raw.githubusercontent.com/${repo}/src/data/mystery-encounters/encounters/${event.replaceAll("_", "-").toLowerCase()}.ts`)
        const textEvent = await rawEvent.text()

        await regexEventInfo(jsonEventLocales, textEvent, event)
    })
}

function initializeEventsObj(eventsObj){
    eventsObj["title"] = ""
    eventsObj["description"] = ""
    eventsObj["option"] = {}
    eventsObj["intro"] = ""
    eventsObj["tier"] = ""
    eventsObj["query"] = ""
    eventsObj["wave"] = [10, 180]
    eventsObj["biomes"] = []
    eventsObj["sprite"] = []
}

async function buildEventsObj(){
    window.events = {}
    window.eventsRequirements = {}

    await getEventsRequirements()
    await getEvents()
    await getEventsInfo()

    events["DANCING_LESSONS_ENCOUNTER"]["sprite"] = [["SPECIES_ORICORIO", 210, 0]]
    events["THE_EXPERT_POKEMON_BREEDER_ENCOUNTER"]["sprite"] = [["SPECIES_CLEFABLE", 225, 0], [ "https://raw.githubusercontent.com/pagefaultgames/pokerogue/beta/public/images/trainer/expert_pokemon_breeder.png", 196, 4]]
    events["FIGHT_OR_FLIGHT_ENCOUNTER"]["sprite"] = [["SPECIES_SCIZOR", 205, 0], ["https://raw.githubusercontent.com/pagefaultgames/pokerogue/beta/public/images/items/charcoal.png", 250, 0]]
    events["BUG_TYPE_SUPERFAN_ENCOUNTER"]["sprite"] = [[ "https://raw.githubusercontent.com/pagefaultgames/pokerogue/beta/public/images/trainer/bug_type_superfan.png", 210, 4]]
    events["UNCOMMON_BREED_ENCOUNTER"]["sprite"] = [[ "SPECIES_EEVEE", 210, 0]]
    events["BERRIES_ABOUND_ENCOUNTER"]["sprite"] = [[ "SPECIES_CATERPIE", 200, 0]]
    events["MYSTERIOUS_CHALLENGERS_ENCOUNTER"]["sprite"] = [["https://raw.githubusercontent.com/pagefaultgames/pokerogue/beta/public/images/trainer/unknown_f.png", 196, 0], ["https://raw.githubusercontent.com/pagefaultgames/pokerogue/beta/public/images/trainer/unknown_m.png", 240, 0]]

    localStorage.setItem("events", await LZString.compressToUTF16(JSON.stringify(events)))
    localStorage.setItem("eventsRequirements", await LZString.compressToUTF16(JSON.stringify(eventsRequirements)))
}


async function fetchEventsObj(){
    if(!localStorage.getItem("events") || !localStorage.getItem("eventsRequirements")){
        await buildEventsObj()
    }
    else{
        window.events = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("events")))
        window.eventsRequirements = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("eventsRequirements")))
    }

    window.eventsTracker = []
    for(let i = 0, j = Object.keys(events).length; i < j; i++){
        eventsTracker[i] = {}
        eventsTracker[i]["key"] = Object.keys(events)[i]
        eventsTracker[i]["filter"] = []
    }

    Object.keys(events).forEach(async event => {
        if(localStorage.getItem(event)){
            sprites[event] = await LZString.decompressFromUTF16(localStorage.getItem(event))
        }
    })

    for(const event in events){
        if(events[event]["title"]){
            eventsButton.classList.remove("hide")
            break
        }
    }
}
