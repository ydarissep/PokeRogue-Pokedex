fetch("https://raw.githubusercontent.com/ydarissep/dex-core/main/src/tableUtility.js").then(response => {
    return response.text()
}).then(text => {
    text = text.replace("function filterTableInput(", "function filterTableInputOld(")
    text = text.replace("async function displaySetup(){", "async function displaySetup(){\nawait staticTranslation()")

    eval.call(window,text)
}).catch(error => {
    console.warn(error)
})






function filterTableInput(input, obj, keyArray){
    const sanitizedInput = input.trim().replaceAll(regexSpChar, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const regexInput = new RegExp(sanitizedInput, "i")

    for(let i = 0, j = Object.keys(tracker).length; i < j; i++){
        tracker[i]["filter"].push("input")
        for (let k = 0; k < keyArray.length; k++){
            if(keyArray[k] !== "innates" || typeof innatesDefined !== "undefined"){
                if(keyArray[k] === "abilities"){
                    obj[tracker[i]["key"]][keyArray[k]].forEach(ability => {
                        if(regexInput.test(sanitizeString("" + abilities[ability]["ingameName"]).replaceAll(regexSpChar, ""))){
                            tracker[i]["filter"] = tracker[i]["filter"].filter(value => value !== "input")
                        }
                    })   
                }
                else if(keyArray[k] === "starterAbility"){
                    if(regexInput.test(sanitizeString("" + abilities[obj[tracker[i]["key"]][keyArray[k]]]["ingameName"]).replaceAll(regexSpChar, ""))){
                        tracker[i]["filter"] = tracker[i]["filter"].filter(value => value !== "input")
                        break
                    }
                }
                else if(keyArray[k] === "description"){
                    if(regexInput.test(obj[tracker[i]["key"]][keyArray[k]].toString().replaceAll(regexSpChar, "").normalize("NFD").replace(/[\u0300-\u036f]/g, ""))){
                        tracker[i]["filter"] = tracker[i]["filter"].filter(value => value !== "input")
                        break
                    }
                }
                else{
                    if(regexInput.test(sanitizeString("" + obj[tracker[i]["key"]][keyArray[k]]).replaceAll(regexSpChar, ""))){
                        tracker[i]["filter"] = tracker[i]["filter"].filter(value => value !== "input")
                        break
                    }
                }
            }
        }
    }

    lazyLoading(true)
}