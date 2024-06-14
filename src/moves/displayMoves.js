fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/moves/displayMoves.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace('sanitizeString(moves[moveName]["type"])', '(translationTable[sanitizeString(moves[moveName]["type"])] ??= sanitizeString(moves[moveName]["type"])).substring(0, 6)')
    text = text.replace('moveType.innerText = sanitizeString(move["type"])', '(moveType.innerText = translationTable[sanitizeString(move["type"])] ??= sanitizeString(move["type"])).substring(0, 6)')
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})