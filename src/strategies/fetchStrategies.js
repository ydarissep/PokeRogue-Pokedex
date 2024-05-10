async function getStrategies(strategies){
    footerP("Fetching strategies")
    const rawStrategies = await fetch(`https://raw.githubusercontent.com/darkyy92/inclementpatch/master/src/data/dex-strategy.md`)
    const textStrategies = await rawStrategies.text()

    return regexStrategies(textStrategies, strategies)
}




async function buildStrategiesObj(){
    let strategies = {}
    
    //strategies = await getStrategies(strategies)

    //await localStorage.setItem("strategies", LZString.compressToUTF16(JSON.stringify(strategies)))
    return strategies
}



async function fetchStrategiesObj(){
    if(!localStorage.getItem("strategies"))
        window.strategies = await buildStrategiesObj()
    else
        window.strategies = await JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("strategies")))
}

