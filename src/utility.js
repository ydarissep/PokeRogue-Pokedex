fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/utility.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace('const index = ["levelUpLearnsets", "eggMovesLearnsets", "TMHMLearnsets", "tutorLearnsets"]', 'let index = []\nif(!settings.includes("hideEggMoves")){index = ["levelUpLearnsets", "eggMovesLearnsets", "TMHMLearnsets", "tutorLearnsets"]}else{index = ["levelUpLearnsets", "TMHMLearnsets", "tutorLearnsets"]}\n')
    text = text.replaceAll("return species[speciesName][\"sprite\"]", "return `https://raw.githubusercontent.com/\${repo}/public/images/pokemon/\${species[speciesName][\"sprite\"]}.png`")
    text = text.replace("await forceUpdate()", "await getLang(urlParams)\nawait forceUpdate()")
    text = text.replaceAll("${checkUpdate}", "${checkUpdate} ${lang}")
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})



async function getLang(urlParams){
    const supportedLang = ["en", "fr", "es", "it", "de", "ko", "zh_CN", "zh_TW", "pt_BR"]

    for(let i = 0; i < settings.length; i++){
        if(/dexLang=\w+/.test(settings[i])){
            if(supportedLang.includes(settings[i].replace("dexLang=", ""))){
                lang = settings[i].replace("dexLang=", "")
            }
        }
    }

    if(supportedLang.includes(urlParams.get("lang"))){
        lang = urlParams.get("lang")
    }

    if(!supportedLang.includes(lang)){
        lang = "en"
    }

    window.staticTranslationTable = getStaticTranslationTable(lang)

    settings = settings.filter(setting => !/dexLang=\w+/.test(setting))
    settings.push(`dexLang=${lang}`)
    localStorage.setItem("DEXsettings", JSON.stringify(settings))
    document.body.classList.add(lang)

    await appendLangMenu(supportedLang)
}



async function appendLangMenu(supportedLang){
    const langMenu = document.createElement("span"); langMenu.setAttribute("ID", "langMenu")
    const selectedLangContainer = document.createElement("span"); selectedLangContainer.classList = "selectedLangContainer"
    const selectedLangFlag = document.createElement("img"); selectedLangFlag.src = getFlagSrc(lang); selectedLangFlag.classList = "selectedLangFlag"

    selectedLangContainer.append(selectedLangFlag)
    langMenu.append(selectedLangContainer)

    const unorgList = document.createElement("ul")
    supportedLang.forEach(dropDownLangString => {
        if(dropDownLangString !== lang){
            const listItem = document.createElement("li")
            const dropDownFlag = document.createElement("img"); dropDownFlag.src = getFlagSrc(dropDownLangString)
            const dropDownLang = document.createElement("span"); dropDownLang.innerText = getLangFullName(dropDownLangString)

            listItem.append(dropDownFlag)
            listItem.append(dropDownLang)
            unorgList.append(listItem)

            listItem.addEventListener("click", () => {
                settings = settings.filter(setting => !/dexLang=\w+/.test(setting))
                settings.push(`dexLang=${dropDownLangString}`)
                localStorage.setItem("DEXsettings", JSON.stringify(settings))

                window.location.reload()
            })
        }
    })

    langMenu.append(unorgList)
    document.getElementById("tableButton").prepend(langMenu)
}



function getFlagSrc(langString){
    if(langString === "en"){
        return "https://flagcdn.com/gb-eng.svg"
    }
    else if(langString === "fr"){
        return "https://flagcdn.com/fr.svg"
    }
    else if(langString === "es"){
        return "https://flagcdn.com/es.svg"
    }
    else if(langString === "it"){
        return "https://flagcdn.com/it.svg"
    }
    else if(langString === "de"){
        return "https://flagcdn.com/de.svg"
    }
    else if(langString === "ko"){
        return "https://flagcdn.com/kr.svg"
    }
    else if(langString === "zh_CN"){
        return "https://flagcdn.com/cn.svg"
    }
    else if(langString === "zh_TW"){
        return "https://flagcdn.com/cn.svg"
    }
    else if(langString === "pt_BR"){
        return "https://flagcdn.com/pt.svg"
    }
}

function getLangFullName(langString){
    if(langString === "en"){
        return "English"
    }
    else if(langString === "fr"){
        return "Français"
    }
    else if(langString === "es"){
        return "español"
    }
    else if(langString === "it"){
        return "italiano"
    }
    else if(langString === "de"){
        return "Deutsch"
    }
    else if(langString === "ko"){
        return "한국어"
    }
    else if(langString === "zh_CN"){
        return "汉语"
    }
    else if(langString === "zh_TW"){
        return "漢語"
    }
    else if(langString === "pt_BR"){
        return "português"
    }
    else{
        return langString
    }
}