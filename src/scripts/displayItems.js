fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/scripts/displayItems.js").then(response => {
    return response.text()
}).then(text => {
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})