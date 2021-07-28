#!/usr/bin/env node

const fs = require('fs');
const Gemtext = require('./main.js');

/*
gemtext [-s|--strict] [html|md|org] [filename] [output file name]
*/

function printHelpExit(additionalStr) {
    console.log('Usate: gemtext [-s|--strict] [html|md|org] [filename] [output file name]');
    console.log('[output file name] can be omitted.');
    if (additionalStr) { console.log(additionalStr); }
    process.exit(0);
}

function isFlag(str) { return str.startsWith('-'); }
function getFlag(str) {
    if (str.startsWith('--')) { return str.substring(2); }
    else if (str.startsWith('-')) { return str.substring(1); }
    else { return undefined; }
}

function expectFlag(flagShort, flagLong, str) {
    return (str === `-${flagShort}`) || (str === `--${flagLong}`);
}

let isStrict = false;
let convert = 'html';
let filename = '';

let i = 2;
if (process.argv.length < i+1) { printHelpExit(); }
isStrict = expectFlag('s', 'strict', process.argv[i]);
if (isFlag(process.argv[i])) {
    if (!expectFlag('s', 'strict', process.argv[i])) {
        printHelpExit(`Unsupported flag: ${process.argv[i]}`);
    }
    i++;
}
if (process.argv.length < i+1) { printHelpExit(); }
let target = process.argv[i];
i++;
if (process.argv.length < i+1) { printHelpExit(); }
let file = process.argv[i];
i++;
let outputFile = `${file}.${target}`;
if (process.argv[i]) { outputFile = process.argv[i]; }

let source = fs.readFileSync(file, {encoding: 'utf-8'});
let result = Gemtext.parse(source).generate(
    target === 'html'? Gemtext.HTMLRenderer
    : target === 'md'? Gemtext.MarkdownRenderer
    : target === 'org'? Gemtext.OrgRenderer
    : Gemtext.HTMLRenderer
);
fs.writeFileSync(outputFile, result);



