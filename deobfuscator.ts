const fs = require('fs');

(async () => {
    const textToAnalyze = await fs.promises.readFile("newDeobTest.txt", "utf8");


    // console.log(textToAnalyze);

    // let res = analyzeScope(textToAnalyze, {})
    // console.log(res)

    // let res = await deobfuscate(textToAnalyze, '_$sZ', ['key', 'time', 2])
    // console.log(res)
    const res = await analyzeScope(textToAnalyze, {});
    // console.log(res)
    // const res = textToAnalyze.substring(5350)

    await fs.promises.writeFile('output.txt', res);

})();

// find all variables that are arrays
// store them in a scope variable (i.e. {t: [1, 2, 3]})
// loop over original textToAnalyze, scope like usual (i.e. delimiting by { and })
// use regex from that github repo to find and replace instances of array

async function deobfuscate(originalString, arrayVarName, deobArray) {
    var newString = originalString;
    var replace;

    if (deobArray.length === 0) return originalString;

    if (arrayVarName === 's') console.log('HERE')

    for(var x = 0; x < deobArray.length; x++){
        replace = `${arrayVarName}[${x}]`.toString();
        if (arrayVarName === 's') console.log(replace)
        newString = await newString.split(`[${replace}]`).join(`.${deobArray[x]}`);
    }


    let buildingString = '';


    for(var x = 0; x < deobArray.length; x++){
        let index = 0;
        replace = `${arrayVarName}[${x}]`.toString();

        let tearString = newString;

        while (index !== -1) {
            
            index = tearString.indexOf(replace);
            if (index === -1) {
                buildingString += tearString;
            }
            else if (index !== 0 && tearString[index - 1].match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/)) {
                buildingString += tearString.substring(0, index + replace.length)
                tearString = tearString.substring(index + replace.length);
                index = 0;
            }
            else {
                let toRep = `${deobArray[x]}`;
                buildingString += tearString.substring(0, index) + toRep
                tearString = tearString.substring(index + replace.length);
                // newString = newString.substring(0, index) + `${deobArray[x]}` + newString.substr(replace.length)
                index = 0;
            }
        }

        newString = buildingString;
        buildingString = '';
    }

    return newString;
}

const analyzeScope = async (textToAnalyze : string, scopedVariables : object) : Promise<any> => { //{text: string, elaspedCharacters: number} 
    // try to detect array variable declarations
    // adding variables to scope
    let index = 0;
    let analyzedText = '';
    let newScopeVariables = JSON.parse(JSON.stringify(scopedVariables));

    while (index < textToAnalyze.length) {


        // console.log(`index: ${index}`)
        if (textToAnalyze[index] === '=') {
            if (textToAnalyze[index - 1] !== '=' && textToAnalyze[index + 1] !== '=') {

                // if we're not declaring an array we don't want it
                if (textToAnalyze[index + 1] !== '[') {
                    analyzedText += '=';
                    index++;
                    continue;
                }
                
                let startIndex = index;
                // recognize assignment / declaration
                index--;
                let varDecName = '';
                while (textToAnalyze[index] !== ' ' && textToAnalyze[index] !== ';' && textToAnalyze[index] !== ',' && textToAnalyze[index] !== '(' && textToAnalyze[index] !== '{') {
                    varDecName = textToAnalyze[index] + varDecName
                    index--;
                }

                // we're not gonna fuck with this[thing] or this.thing
                if (varDecName.substring(0, 5) === 'this[' || varDecName.substring(0, 5) === 'this.') {
                    analyzedText += '=';
                    index += varDecName.length + 2;
                    continue;
                }
    
                // now we're at the space in between {let, const, var} and the variable name
                index += varDecName.length + 2;
                // now we're at the beginning of the assignment expression
                // for now we're going to assume ; terminates assignment (keep in mind commas can too, with the comma operator)
                let toEvalExpression = '';
                let bracketCounter = 0;
                while (true) {
                    if (textToAnalyze[index] === '[') {
                        // let res = evaluateBracket(textToAnalyze.substring(index + 1), scopedVariables)
                        // index += res.rawLength
    
                        bracketCounter++;
                    }
                    else if (textToAnalyze[index] === ']') {
                        bracketCounter--;
                    }
                    else if (textToAnalyze[index] === ';') {
                        break;
                    }
                    else if (textToAnalyze[index] === ',' && bracketCounter === 0) {
                        break;
                    }

                    if (textToAnalyze[index] === ']' && bracketCounter === 0) {
                        toEvalExpression += textToAnalyze[index];
                        // index++;
                        break;
                    }

                    toEvalExpression += textToAnalyze[index]
                    index++;
                }
    
                let endIndex = index;
    
                // now we have our eval expression
                // console.log(`varDecName: ${varDecName}`)
                // console.log(`toEvnalExp: ${toEvalExpression}`)

                if (varDecName === '_$S') {
                    // console.log(`_$S: ${index}`);
                    // console.log(textToAnalyze.substring(index))
                }
                
                try {
                    newScopeVariables[varDecName] = eval('(' + toEvalExpression + ')')
                    // analyzedText += textToAnalyze.substring(startIndex, endIndex)
        
                    // console.log('endIndexnow')
                    // console.log(textToAnalyze.substring(endIndex))
        
                    // and we're at the index of the semicolon
                    let toReplace = await deobfuscate(textToAnalyze.substring(index), varDecName, newScopeVariables[varDecName])
                    // console.log(toReplace)
                    analyzedText += textToAnalyze.substring(startIndex, endIndex);
                    textToAnalyze = textToAnalyze.substring(0, index) + toReplace;
                    if (textToAnalyze.includes('new Date()[_$307]()')) console.log(`fucks up at ${varDecName}`)

                    continue;
                }
                catch (err) {
                    console.log(`Error trying to eval ${toEvalExpression}`)
                    // console.log(err)
                    analyzedText += textToAnalyze.substring(startIndex, endIndex);
                }

            }
            else {
                analyzedText += textToAnalyze[index];
                index++;
            }
        }
        else {
            analyzedText += textToAnalyze[index];
            index++;
        }
    }

    return analyzedText;
}

const isOnlyNumbers = (s : string) : boolean => {
    return /^\d+$/.test(s);
}