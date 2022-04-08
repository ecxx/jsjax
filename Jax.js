const _CURRENT_VERSION = '1.0-dev'

const process = require('process')
const JaxInstance = require('./src/JaxInstance');
const Lexer = require('./src/Lexer');
const Parser = require('./src/Parser');
const TreePrinter = require('./src/TreePrinter');
const TreeInterpreter = require('./src/TreeInterpreter');
const instance = new JaxInstance();
const reader = require('readline-sync');
const JaxObject = require('./src/JaxObject');
const JaxContext = require('./src/JaxContext');
const JaxFunction = require('./src/JaxFunction');
const JIO = require('./src/SysModules/IO');
const fs = require('fs')

const args = process.argv.slice(process.execArgv.length + 2);

function main() {

    if (args.length == 0) { // standard repl
        repl().catch((e) => {return;});
    }

    let r = "";

    try {
        r = fs.readFileSync(args[0], "utf-8");
    } catch (error) {
        console.log("ERROR : File Not Found")
    }

    let ctx = new JaxContext();
    ctx.__attachbuiltin();
    let instance = new JaxInstance(true);
    let VM = new TreeInterpreter();
    VM.init(instance);
    
    try {
        let lexer = new Lexer(r, instance);
        lexer.scan();
        let tokens = lexer.tokens;
        let parser = new Parser(tokens, instance);
        let result = parser.parse();
        VM.visit(result, ctx);
    } catch (error) {
        return;
    }

}

async function token_repl() {

    console.log("Welcome to JaxLang Tokenizer", _CURRENT_VERSION)
    console.log("Enter Text Below")

    while (true) {

        var text = reader.question('> ');
        let lexer = new Lexer(text, instance);
        lexer.scan();
        for (x of lexer.tokens) {
            x.log();
        }

    }

}

async function repl() {

    console.log("Welcome to JaxLang", _CURRENT_VERSION)
    console.log("Enter Text Below")

    let ctx = new JaxContext();
    ctx.addmodule('', new JIO());
    ctx.addmodule('io', new JIO());
    while (true) {
        let instance = new JaxInstance(false);
        let tprinter = new TreeInterpreter();
        tprinter.init(instance);
        var text = reader.question('> ');
        let lexer = new Lexer(text, instance);
        lexer.scan();
        if (instance.process_has_error) continue;
        let tokens = lexer.tokens;
        let parser = new Parser(tokens, instance);
        let result = parser.parse();
        //console.log(JSON.stringify(result))
        let vres = tprinter.visit(result, ctx);
        if (vres != undefined && vres != null) console.log(vres);
    }
}

main();