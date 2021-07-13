const fs = require('fs');

(async () => {
    const textToAnalyze = await fs.promises.readFile("test3.txt", "utf8");


    console.log(textToAnalyze);

    let res = analyzeScope(textToAnalyze, {})
    console.log(res)


})();

const analyzeScope = (textToAnalyze : string, scopedVariables : object) : {text: string, elaspedCharacters: number} => {
    let analyzedText = '';

    // create copy to add to
    let newScopeVariables = JSON.parse( JSON.stringify(scopedVariables) )


    let index = 0;
    while (index < textToAnalyze.length) {

        // handle curly braces
        if (textToAnalyze[index] === '{') {
            // we want to simulate entering a new scope
            // store variables in an object i.e. {e: 1, t: 2}

            let res = analyzeScope(textToAnalyze.substring(index + 1), newScopeVariables)

            analyzedText += res.text
            index += res.elaspedCharacters;
            continue;
        }
        else if (textToAnalyze[index] === '}') {
            // exit scope

            return {text: `{${analyzedText}}`, elaspedCharacters: index + 2};
        }
        // adding variables to scope
        else if (textToAnalyze[index] === '=') {
            if (textToAnalyze[index - 1] !== '=' && textToAnalyze[index + 1] !== '=') {
                let startIndex = index;
                // recognize assignment / declaration
                index--;
                let varDecName = '';
                while (textToAnalyze[index] !== ' ' && textToAnalyze[index] !== ';' && textToAnalyze[index] !== ',') {
                    varDecName = textToAnalyze[index] + varDecName
                    index--;
                }


                // aka we're referencing this[thing] or its not something we can assign to the scope
                if (varDecName.includes("[") || varDecName.includes("]")) {

                    // at this point the brackets have already been parsed to the best of their ability
                    analyzedText += '='


                    // now we should be at the equals, which we will skip
                    index += varDecName.length + 2;

                    continue;
                }
                // if we're declaring a function
                else if (textToAnalyze.substr(varDecName.length + index + 2, 8) === 'function') {

                    // at this point the brackets have already been parsed to the best of their ability
                    analyzedText += '='


                    // now we should be at the equals, which we will skip
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

                if (toEvalExpression.substring(1).includes("[")) {
                    let res = evaluateBracket(toEvalExpression + "]", newScopeVariables)
                    newScopeVariables[varDecName] = eval('(' + res.variableValue + ')')

                }
                else {
                    newScopeVariables[varDecName] = eval('(' + toEvalExpression + ')')
                }

                console.log('cinting')


                analyzedText += textToAnalyze.substring(startIndex, endIndex)

                // and we're at the index of the semicolon
                continue;
            }
        }

        // // handle let variable declaration
        // if (textToAnalyze.substr(index, 4) === 'let ') {
        //     // get ready to record variable
        // }
        // // handle var variable declaration
        // else if (textToAnalyze.substr(index, 4) === 'var ') {

        // }
        // // handle const variable declaration
        // else if (textToAnalyze.substr(index, 6) === 'const ') {

        // }
        // // handle bracket
        // else 
        if (textToAnalyze[index] === '[' || textToAnalyze[index] === ']') { // close bracket shouldnt happen

            // co
            // index--;
            // while (textToAnalyze[index] !== ' ') {

            // }

            let res = evaluateBracket(textToAnalyze.substring(index + 1), newScopeVariables)
            console.log(newScopeVariables)
            analyzedText += "[" + res.variableValue + "]"
            index += res.rawLength
        }
        else {
            analyzedText += textToAnalyze[index];
            index++;
        }

    }

    return {text: analyzedText, elaspedCharacters: textToAnalyze.length};
}

const recordVariable = (s : string, scopedVariables : object) => {
    // eval the expression until we hit an unescaped or quoted ; (semicolon)

    // record variable name (stop when we see =)
    let index = 0;
    let variableName = '';
    while (s[index] !== '=') {
        variableName += s[index];
        index++;
    }

    // now we are at = which we will skip
    index++;

    let variableValue = '';
    // now we want to eval what the variable is, keeping in mind we might encounter [ and ]
    // we also need to make sure the semicolon we stop at is actually where we're supposed to stop
    while (s[index] !== ';') {
        if (s[index] === "[") {

        }
        else {
            variableValue += s[index];
        }
    }

    // now we need to evaluate what the variable actually is
}

const isOnlyNumbers = (s : string) : boolean => {
    return /^\d+$/.test(s);
}

// s starts after [
export const evaluateBracket = (s : string, scopedVariables : object) : {variableValue: any, rawLength: number}=> {
    let index = 0;
    let variableName = ''
    let personalAccumulatorVariableValue;
    let changedToString = false;

    console.log(`starting EvaluateBracket with s: ${s}`)

    // if we're evaluating a string, not a variable
    if (s[index] === '"' || s[index] === "'" || s[index] === '`') {

        let delimeter = s[index];
        
        variableName = '"';
        index++;

        while (index < s.length) {

            // we're closing off
            if (s[index] === delimeter) {
                variableName += '"'
                return { variableValue: variableName, rawLength: variableName.length + 2}
            }
            else {
                variableName += s[index];
                index++;
            }
        }
    }

    // else we're not evaluating a string
    while (index < s.length) {
        if (s[index] !== '[' && s[index] !== ']') {
            variableName += s[index];
            index++;
        }
        else if (s[index] === '[') {
            // recursive bracket evaluation
            let res = evaluateBracket(s.substring(index + 1), scopedVariables);

            // if we just evaluated a string
            if (res.variableValue[0] === '"') {
                if (personalAccumulatorVariableValue) {
                    if (changedToString) {
                        personalAccumulatorVariableValue += "[" + res.variableValue + "]"
                    }
                    else {
                        if (personalAccumulatorVariableValue[res.variableValue.substring(1, res.variableValue.length - 1)]) {
                            personalAccumulatorVariableValue = personalAccumulatorVariableValue[res.variableValue.substring(1, res.variableValue.length - 1)]
                        }
                        else {
                            changedToString = true;
                            personalAccumulatorVariableValue += "[" + res.variableValue + "]"
                        }
                    }
                }

                else {
                    if (scopedVariables[variableName]) {
                        if (scopedVariables[variableName][res.variableValue.substring(1, res.variableValue.length - 1)]) {
                            personalAccumulatorVariableValue = scopedVariables[variableName][res.variableValue.substring(1, res.variableValue.length - 1)]
                        }
                        else {
                            personalAccumulatorVariableValue = variableName + "[" + res.variableValue + "]"
                            changedToString = true;
                        }
                    }
                    else {
                        changedToString = true;
                        personalAccumulatorVariableValue = variableName + "[" + res.variableValue + "]"
                    }
                }

            }

            // i.e. we're indexing an array
            else if (typeof res.variableValue === 'number') {
                if (changedToString) {
                    // if (personalAccumulatorVariableValue[res.variableValue]) {
                    //     personalAccumulatorVariableValue += "[" +  personalAccumulatorVariableValue[res.variableValue] + "]"
                    // }
                    // else {

                    // }
                    personalAccumulatorVariableValue += "[" + res.variableValue + "]"
                }
                else {
                    if (personalAccumulatorVariableValue) {
                        if (personalAccumulatorVariableValue[res.variableValue]) {
                            personalAccumulatorVariableValue = personalAccumulatorVariableValue[res.variableValue]
                        }
                        // property doesnt exist so we change to string
                        else {
                            changedToString = true;
                            personalAccumulatorVariableValue += "[" + res.variableValue + "]"
                        }
                        // if (!scopedVariables[variableName]) {
                        //     personalAccumulatorVariableValue += "[" + res.variableValue + "]";
                        // }
                        // else {
                        //     personalAccumulatorVariableValue += "[" + scopedVariables[variableName][res.variableValue] + "]";
                        // }
                    }
                    else {
                        if (!scopedVariables[variableName]) {
                            changedToString = true;
                            personalAccumulatorVariableValue = res.variableValue
                        }
                        else {
                            personalAccumulatorVariableValue = scopedVariables[variableName][res.variableValue];
                        }
                    }
                }
            }
            // if its a string, we check if its an object property and act accordingly
            else {
                if (personalAccumulatorVariableValue) {
                    if (changedToString) {
                        personalAccumulatorVariableValue += "[" + '"' + res.variableValue + '"' + "]";
                    }
                    else {
                        if (personalAccumulatorVariableValue[res.variableValue]) {
                            personalAccumulatorVariableValue = personalAccumulatorVariableValue[res.variableValue];
                        }
                        else {
                            changedToString = true;
                            personalAccumulatorVariableValue += "[" + '"' + res.variableValue + '"' + "]";
                        }
                    }

                }
                else {
                    if (!scopedVariables[variableName]) {
                        changedToString = true;
                        personalAccumulatorVariableValue = '"' +  res.variableValue + '"';
                    }
                    else {
                        personalAccumulatorVariableValue = scopedVariables[variableName][res.variableValue];
                    }
                }
            }

            index += res.rawLength;
            variableName = ''

        }
        else if (s[index] === ']') {
            if (personalAccumulatorVariableValue) {
                if (isOnlyNumbers(personalAccumulatorVariableValue)) {
                    return {variableValue: personalAccumulatorVariableValue, rawLength: index + 2}
                }
                else {
                    return {variableValue: '"' + personalAccumulatorVariableValue + '"', rawLength: index + 2}
                }
            }
            
            // check that variableName isn't a straight number
            if (isOnlyNumbers(variableName)) {
                // treat as an index
                return {variableValue: parseInt(variableName), rawLength: variableName.length + 2}; // +2 for [ and ]
            }
            else {
                if (scopedVariables[variableName] === undefined) {
                    return {variableValue: variableName, rawLength: variableName.length + 2}
                }
                else {
                    return {variableValue: scopedVariables[variableName], rawLength: variableName.length + 2}
                }
            }
        }
    }
}