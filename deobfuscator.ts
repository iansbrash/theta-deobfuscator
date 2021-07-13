const fs = require('fs');

(async () => {
    const textToAnalyze = await fs.promises.readFile("test.txt", "utf8");


    console.log(textToAnalyze);


})();

const analyzeScope = (textToAnalyze : string, scopedVariables : object) : string => {
    let analyzedText = '';


    let index = 0;
    while (index < textToAnalyze.length) {

        // handle curly braces
        if (textToAnalyze[index] === '{') {
            // we want to simulate entering a new scope
            // store variables in an object i.e. {e: 1, t: 2}

            analyzedText += analyzeScope(textToAnalyze.substring(index + 1), scopedVariables)
        }
        else if (textToAnalyze[index] === '}') {
            // exit scope

            return analyzedText;
        }
        // handle let variable declaration
        else if (textToAnalyze.substr(index, 4) === 'let ') {
            // get ready to record variable
        }
        // handle var variable declaration
        else if (textToAnalyze.substr(index, 4) === 'var ') {

        }
        // handle const variable declaration
        else if (textToAnalyze.substr(index, 6) === 'const ') {

        }
        // handle bracket
        else if (textToAnalyze[index] === '[' || textToAnalyze[index] === ']') {

        }
        else {
            textToAnalyze += textToAnalyze[index];
            index++;
        }
    }
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
                return {variableValue: personalAccumulatorVariableValue, rawLength: index + 2}
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