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
    while (index < s.length) {
        if (s[index] !== '[' && s[index] !== ']') {
            variableName += s[index];
            // console.log('detected neighte, new varibla ame: ' + variableName)
            index++;
        }
        else if (s[index] === '[') {
            // console.log(`detected [`)
            // recursive bracket evaluation
            let res = evaluateBracket(s.substring(index + 1), scopedVariables);
            // console.log('res: ' + res + " " + typeof res)
            index += res.rawLength;


            // console.log(`res.variableValue: ${res.variableValue} ${typeof res.variableValue}`)
            // console.log(`personalAccumulatorVariableValue`)
            // console.log(personalAccumulatorVariableValue)
            // console.log(`variableName: ${variableName}`)
            personalAccumulatorVariableValue = personalAccumulatorVariableValue ? personalAccumulatorVariableValue[res.variableValue] : scopedVariables[variableName][res.variableValue];
            // console.log(`personalAccumulatorVariableValue`)
            // console.log(personalAccumulatorVariableValue)
            // console.log(`remaining string to parse: ${s.substring(index)}`)

            variableName = ''


        }
        else if (s[index] === ']') {
            if (personalAccumulatorVariableValue) {
                return {variableValue: personalAccumulatorVariableValue, rawLength: index + 2}
            }
            
            // console.log(`detected ]`)
            // check that variableName isn't a straight number
            if (isOnlyNumbers(variableName)) {
                // treat as an index
                return {variableValue: parseInt(variableName), rawLength: variableName.length + 2}; // +2 for [ and ]
            }
            else {
                return {variableValue: scopedVariables[variableName], rawLength: variableName.length + 2}
            }
        }
    }
}