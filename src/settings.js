fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/settings.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace("if(settings.includes(\"hideEggMoves\"))", "!if(settings.includes(\"hideEggMoves\"))")
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})