fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/settings.js").then(response => {
    return response.text()
}).then(text => {
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})


async function staticTranslation(){
    if(lang !== "en"){
        document.querySelectorAll("#tableButton > button").forEach(button => {
            if(button.innerText in staticTranslationTable){
                button.innerText = staticTranslationTable[button.innerText]
            }
        })

        document.querySelectorAll(".speciesPanelText").forEach(speciesPanelText => {
            let text = speciesPanelText.innerText.match(/(.*?):/)
            if(text){
                text = text[1]
                if(text in staticTranslationTable){
                    speciesPanelText.innerText = `${staticTranslationTable[text]}:`
                }
            }
        })

        document.querySelectorAll("#statsNames > p").forEach(statsGraphHeader => {
            const stat = statsGraphHeader.innerText.match(/\w+/)
            if(stat){
                if(stat[0] in translationTable){
                    statsGraphHeader.innerText = `${translationTable[stat[0]]}:`
                }
            }
            const replaceSpan = document.createElement("span"); replaceSpan.classList = "statsGraphHeader"
            statsGraphHeader.append(replaceSpan)

            window.statDisplays = [...document.querySelectorAll(".statsGraphHeader")]
        })

        document.querySelectorAll("#speciesTableThead, #abilitiesTableThead, #movesTableThead, #speciesPanelTablesContainer").forEach(tableThead => {
            tableThead.querySelectorAll("th").forEach(tableTh => {
                if(tableTh.innerText in staticTranslationTable){
                    tableTh.innerText = staticTranslationTable[tableTh.innerText]
                }
                else if(tableTh.innerText in translationTable){
                    tableTh.innerText = translationTable[tableTh.innerText]
                }
            })
        })

        document.querySelector("#speciesPanelTablesContainer").querySelectorAll("caption").forEach(caption => {
            const captionInnerText = caption.innerHTML.match(/.*/)
            caption.innerHTML = caption.innerHTML.replace(captionInnerText, staticTranslationTable[captionInnerText] ?? captionInnerText)
        })

        document.getElementById("onlyShowVariantPokemon").innerText = staticTranslationTable[document.getElementById("onlyShowVariantPokemon").innerText] ??= document.getElementById("onlyShowVariantPokemon").innerText
        document.getElementById("onlyShowVariantPokemonLocations").innerText = staticTranslationTable[document.getElementById("onlyShowVariantPokemonLocations").innerText] ??= document.getElementById("onlyShowVariantPokemonLocations").innerText
    }
}


function getStaticTranslationTable(lang){
    const staticTranslationTable = {
        "en": {
            "Species": "Species",
            "Starter Cost": "Starter Cost",
            "Variant": "Variant",
            "Level": "Level",
            "Level Up": "Level Up",
            "Day": "Day",
            "Dawn": "Dawn",
            "Night": "Night",
            "Dusk": "Dusk",
            "Common": "Common",
            "Uncommon": "Uncommon",
            "Rare": "Rare",
            "Super Rare": "Super Rare",
            "Ultra Rare": "Ultra Rare",
            "Boss": "Boss",
            "Boss Rare": "Boss Rare",
            "Boss Super Rare": "Boss Super Rare",
            "Boss Ultra Rare": "Boss Ultra Rare",
            "Name": "Name",
            "Types": "Types",
            "Type": "Type",
            "Split": "Split",
            "Power": "Power",
            "Acc": "Acc",
            "Description": "Description",
            "Effect": "Description",
            "Biome": "Biome",
            "Biomes": "Biomes",
            "Moves": "Moves",
            "Move": "Move",
            "Ability": "Ability",
            "Abilities": "Abilities"
        },
        "fr": {
            "Species": "Pokémon",
            "Starter Cost": "Coût",
            "Variant": "Chromatique",
            "Level": "Niveau",
            "Level Up": "Montée de niveau",
            "Day": "Jour",
            "Dawn": "Aube",
            "Night": "Nuit",
            "Dusk": "Soir",
            "Common": "Commun",
            "Uncommon": "Peu commun",
            "Rare": "Rare",
            "Super Rare": "Super rare",
            "Ultra Rare": "Ultra rare",
            "Boss": "Boss",
            "Boss Rare": "Boss rare",
            "Boss Super Rare": "Boss super rare",
            "Boss Ultra Rare": "Boss ultra rare",
            "Name": "Nom",
            "Types": "Types",
            "Type": "Type",
            "Split": "Caté.",
            "Power": "Force",
            "Acc": "Pré.",
            "Description": "Description",
            "Effect": "Description",
            "Biome": "Biome",
            "Biomes": "Biomes",
            "Moves": "Capacités",
            "Move": "Capacité",
            "Ability": "Talent",
            "Abilities": "Talents"
        },
        "it": {
            "Species": "Pokémon",
            "Starter Cost": "Costo",
            "Variant": "Cromatico",
            "Level": "Livello",
            "Level Up": "Sale di livello",
            "Day": "Gior",
            "Dawn": "Alba",
            "Night": "Notte",
            "Dusk": "Sera",
            "Common": "Comune",
            "Uncommon": "Non comune",
            "Rare": "Raro",
            "Super Rare": "Super raro",
            "Ultra Rare": "Ultra raro",
            "Boss": "Boss",
            "Boss Rare": "Boss raro",
            "Boss Super Rare": "Boss super raro",
            "Boss Ultra Rare": "Boss ultra raro",
            "Name": "Nome",
            "Types": "Tipi",
            "Type": "Tipo",
            "Split": "Cate.",
            "Power": "Potenza",
            "Acc": "Pre.",
            "Description": "Descrizione",
            "Effect": "Descrizione",
            "Biome": "Biomo",
            "Biomes": "Biomi",
            "Moves": "Mosse",
            "Move": "Mossa",
            "Ability": "Abilità",
            "Abilities": "Abilità"
        },
        "de": {
            "Species": "Pokémon",
            "Starter Cost": "Kosten",
            "Variant": "Schillernd",
            "Level": "Level",
            "Level Up": "Heraufschrauben",
            "Day": "Tag",
            "Dawn": "Morgen",
            "Night": "Nacht",
            "Dusk": "Abend",
            "Common": "Gewöhnlich",
            "Uncommon": "Ungewöhnlich",
            "Rare": "Selten",
            "Super Rare": "Super selten",
            "Ultra Rare": "Ultra selten",
            "Boss": "Boss",
            "Boss Rare": "Boss selten",
            "Boss Super Rare": "Boss super selten",
            "Boss Ultra Rare": "Boss ultra selten",
            "Name": "Name",
            "Types": "Typen",
            "Type": "Typ",
            "Split": "Kate.",
            "Power": "Stärke",
            "Acc": "Gen.",
            "Description": "Beschreibung",
            "Effect": "Beschreibung",
            "Biome": "Biom",
            "Biomes": "Biome",
            "Moves": "Attacken",
            "Move": "Attacke",
            "Ability": "Fähigkeit",
            "Abilities": "Fähigkeiten"
        },
        "es": {
            "Species": "Pokémon",
            "Starter Cost": "Costo",
            "Variant": "Variocolor",
            "Level": "Nivel",
            "Level Up": "Subir de nivel",
            "Day": "Día",
            "Dawn": "Alba",
            "Night": "Noche",
            "Dusk": "Tarde",
            "Common": "Común",
            "Uncommon": "Poco común",
            "Rare": "Raro",
            "Super Rare": "Súper raro",
            "Ultra Rare": "Ultra raro",
            "Boss": "Boss",
            "Boss Rare": "Boss raro",
            "Boss Super Rare": "Boss súper raro",
            "Boss Ultra Rare": "Boss ultra raro",
            "Name": "Nombre",
            "Types": "Tipos",
            "Type": "Tipo",
            "Split": "Cate.",
            "Power": "Potencia",
            "Acc": "Pre.",
            "Description": "Descripción",
            "Effect": "Descripción",
            "Biome": "Bioma",
            "Biomes": "Biomas",
            "Moves": "Movimientos",
            "Move": "Movimiento",
            "Ability": "Habilidad",
            "Abilities": "Habilidades"
        },
        "ko": {
            "Species": "포켓몬",
            "Starter Cost": "코스트",
            "Variant": "색이 다른 모습",
            "Level": "레벨",
            "Level Up": "Level Up",
            "Day": "낮",
            "Dawn": "새벽",
            "Night": "밤",
            "Dusk": "황혼",
            "Common": "보통",
            "Uncommon": "드묾",
            "Rare": "레어",
            "Super Rare": "수퍼 레어",
            "Ultra Rare": "울트라 레어",
            "Boss": "보스",
            "Boss Rare": "레어 보스",
            "Boss Super Rare": "수퍼 레어 보스",
            "Boss Ultra Rare": "울트라 레어 보스",
            "Name": "이름",
            "Types": "타입",
            "Type": "타입",
            "Split": "분류",
            "Power": "위력",
            "Acc": "명중",
            "Description": "설명",
            "Effect": "설명",
            "Biome": "바이옴",
            "Biomes": "바이옴",
            "Moves": "기술",
            "Move": "기술",
            "Ability": "특성",
            "Abilities": "특성"
        },
        "zh_CN": {
            "Species": "宝可梦",
            "Starter Cost": "费用",
            "Variant": "异色",
            "Level": "等级",
            "Level Up": "等级提升",
            "Day": "白天",
            "Dawn": "黎明",
            "Night": "夜晚",
            "Dusk": "黄昏",
            "Common": "普通",
            "Uncommon": "罕见",
            "Rare": "稀有",
            "Super Rare": "超级稀有",
            "Ultra Rare": "极其稀有",
            "Boss": "Boss",
            "Boss Rare": "Boss 稀有",
            "Boss Super Rare": "Boss 非常稀有",
            "Boss Ultra Rare": " Boss 极其稀有",
            "Name": "名字",
            "Types": "属性",
            "Type": "属性",
            "Split": "分类",
            "Power": "威力",
            "Acc": "命中",
            "Description": "描述",
            "Effect": "描述",
            "Biome": "地区",
            "Biomes": "地区",
            "Moves": "招式",
            "Move": "招式",
            "Ability": "特性",
            "Abilities": "特性"
        },
        "zh_TW": {
            "Species": "寶可夢",
            "Starter Cost": "花費",
            "Variant": "異色",
            "Level": "等級",
            "Level Up": "Level Up",
            "Day": "白天",
            "Dawn": "黎明",
            "Night": "夜",
            "Dusk": "昏",
            "Common": "普通",
            "Uncommon": "不常見",
            "Rare": "稀有",
            "Super Rare": "超級稀有",
            "Ultra Rare": "極其稀有",
            "Boss": "首領",
            "Boss Rare": "首領稀有",
            "Boss Super Rare": "首領超級稀有",
            "Boss Ultra Rare": "首領極其稀有",
            "Name": "名字",
            "Types": "屬性",
            "Type": "屬性",
            "Split": "分類",
            "Power": "威力",
            "Acc": "命中",
            "Description": "描述",
            "Effect": "描述",
            "Biome": "區域",
            "Biomes": "區域",
            "Moves": "招式",
            "Move": "招式",
            "Ability": "特性",
            "Abilities": "特性"
        },
        "pt_BR": {
            "Species": "Pokémon",
            "Starter Cost": "Custo",
            "Variant": "Brilhante",
            "Level": "Nível",
            "Level Up": "Subir de nível",
            "Day": "Dia",
            "Dawn": "Alva",
            "Night": "Noite",
            "Dusk": "Tarde",
            "Common": "Comum",
            "Uncommon": "Incomum",
            "Rare": "Raro",
            "Super Rare": "Super raro",
            "Ultra Rare": "Ultra raro",
            "Boss": "Boss",
            "Boss Rare": "Boss raro",
            "Boss Super Rare": "Boss super raro",
            "Boss Ultra Rare": "Boss ultra raro",
            "Name": "Nome",
            "Types": "Tipos",
            "Type": "Tipo",
            "Split": "Cate.",
            "Power": "Poder",
            "Acc": "Pre.",
            "Description": "Descrição",
            "Effect": "Descrição",
            "Biome": "Bioma",
            "Biomes": "Biomas",
            "Moves": "Movimentos",
            "Move": "Movimento",
            "Ability": "Habilidad",
            "Abilities": "Habilidades"
        }
    }

    if(lang in staticTranslationTable){
        return staticTranslationTable[lang]
    }
    else{
        return staticTranslationTable["en"]
    }
}