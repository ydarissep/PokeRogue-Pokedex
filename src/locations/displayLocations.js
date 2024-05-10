fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/locations/displayLocations.js").then(response => {
    return response.text()
}).then(text => {
    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})