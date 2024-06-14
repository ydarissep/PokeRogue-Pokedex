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
}