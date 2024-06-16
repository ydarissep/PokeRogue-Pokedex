fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/moves/displayMoves.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace('sanitizeString(moves[moveName]["type"])', '(translationTable[sanitizeString(moves[moveName]["type"])] ??= sanitizeString(moves[moveName]["type"]))')
    text = text.replace('moveType.innerText = sanitizeString(move["type"])', '(moveType.innerText = translationTable[sanitizeString(move["type"])] ??= sanitizeString(move["type"]))')
    text = text.replace('movePower.innerText = `${move["power"]}\\nPower`', 'movePower.innerText = `${move["power"]}\\n${staticTranslationTable["Power"] ??= "Power"}`')
    text = text.replace('moveAccuracy.innerText = `${move["accuracy"]}\\nAcc`', 'moveAccuracy.innerText = `${move["accuracy"]}\\n${staticTranslationTable["Acc"] ??= "Acc"}`')
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})