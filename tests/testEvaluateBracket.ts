import { evaluateBracket } from "../deobfuscator";

let simpleTest = "[hello[test[1]]]";
let simpleTestScoped = {hello: ['arr1', 'arr2', 'arr3'], test: [0, 1]}

console.log(evaluateBracket(simpleTest.substring(1), simpleTestScoped))

let simpleTest2 = "[hello[2][1]]"
let simpleTest2Scoped = {hello: [[1, 2], [3, 4], [5, 6]]}

console.log(evaluateBracket(simpleTest2.substring(1), simpleTest2Scoped))

let simpleTest3 = "[hello[1][test[0]]]"
let simpleTest3Scoped = {hello: [[1, 2], [3, 4], [5, 6]], test: [1, 0]}

console.log(evaluateBracket(simpleTest3.substring(1), simpleTest3Scoped))


let simpleTest4 = "[deeply[nested[value]]]"
let simpleTest4Scoped = {deeply: {30: 1123}, value: 2, nested: [10, 20, 30, 0]}

console.log(evaluateBracket(simpleTest4.substring(1), simpleTest4Scoped))


let simpleTest5 = "[deeply[nested[value]]]"
let simpleTest5Scoped = {deeply: {30: 1123}, value: 2, nested: [10, 20, 30, 0]}

console.log(evaluateBracket(simpleTest4.substring(1), simpleTest4Scoped))