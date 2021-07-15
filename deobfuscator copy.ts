const fs = require('fs');

(async () => {
    const textToAnalyze = await fs.promises.readFile("newDeobTest.txt", "utf8");


    // console.log(textToAnalyze);

    // let res = analyzeScope(textToAnalyze, {})
    // console.log(res)

    // let res = await deobfuscate(textToAnalyze, '_$sZ', ['key', 'time', 2])
    // console.log(res)
    const res = await analyzeScope(textToAnalyze, {});
    console.log(res)
})();

// find all variables that are arrays
// store them in a scope variable (i.e. {t: [1, 2, 3]})
// loop over original textToAnalyze, scope like usual (i.e. delimiting by { and })
// use regex from that github repo to find and replace instances of array

async function deobfuscate(originalString, arrayVarName, deobArray) {
    var newString = originalString;
    var replace;

    for(var x = 0; x < deobArray.length; x++){
        replace = `${arrayVarName}[${x}]`.toString();
        newString = await newString.split(`[${replace}]`).join(`.${deobArray[x]}`);
    }

    for(var x = 0; x < deobArray.length; x++){
        replace = `${arrayVarName}[${x}]`.toString();
        newString = await newString.split(`${replace}`).join(`${deobArray[x]}`);
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
                while (textToAnalyze[index] !== ' ' && textToAnalyze[index] !== ';' && textToAnalyze[index] !== ',') {
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
                    toEvalExpression += textToAnalyze[index]
                    index++;
                }
    
                let endIndex = index;
    
                // now we have our eval expression
                console.log(`varDecName: ${varDecName}`)
                console.log(`toEvnalExp: ${toEvalExpression}`)
    
                newScopeVariables[varDecName] = eval('(' + toEvalExpression + ')')
    
                // analyzedText += textToAnalyze.substring(startIndex, endIndex)
    
                console.log('endIndexnow')
                console.log(textToAnalyze.substring(endIndex))
    
                // and we're at the index of the semicolon
                let toReplace = await deobfuscate(textToAnalyze.substring(index), varDecName, newScopeVariables[varDecName])
                console.log(toReplace)
                analyzedText += textToAnalyze.substring(startIndex, endIndex);
                textToAnalyze = textToAnalyze.substring(0, index) + toReplace;
                continue;
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