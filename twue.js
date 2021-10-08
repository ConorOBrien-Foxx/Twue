const RULE_SET = "=";
const RULE_INPUT = ">";
const RULE_OUTPUT = "~";
const RULE_KINDS = [ RULE_SET, RULE_INPUT, RULE_OUTPUT ];
const IS_BROWSER = typeof window !== "undefined";

if(IS_BROWSER) {
    // dummy variable
    var require = (name) => {};
}

const fs = require("fs");
// const reader = require("readline-sync");
const Preprocess = require("./preprocess.js") || window.BrowserPreprocess;
// console.log("owo?", Preprocess);

let isRuleIndicator = (s) =>
    s.slice(0, 2) == "::" && RULE_KINDS.includes(s.slice(2));

const DIGIT_TEST = /[0-9.]/;
// from https://stackoverflow.com/a/3561711/4119004
const ESCAPE_REGEX_TEST = /[-\/\\^$*+?.()|[\]{}]/;

class TwueRule {
    constructor(search, replace, ruleKind) {
        this.search = TwueRule.reduceEscapes(search);
        this.replace = TwueRule.reduceEscapes(replace);
        this.ruleKind = ruleKind;
        this.groups = null;
        this.regex = null;//this.getRegex();
    }
    
    // reduces the custom escapes
    static reduceEscapes(str) {
        return str.replace(/\\e/g, "")
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            // .replace(/\\\\/g, "\\")
            // .replace(/\\_/g, "\\x5f")
            .replace(/\\([0-7]{1,2})/g, (all, n) => String.fromCharCode(parseInt(n, 8)))
            .replace(/\\x(\d\d)/g, (all, n) => String.fromCharCode(parseInt(n, 16)))
            .replace(/\\u(\d{4})/g, (all, n) => String.fromCharCode(parseInt(n, 16)));
    }
    
    // compiles search to regex
    getRegex() {
        if(this.regex) return this.regex;
        this.groups = {};
        let groupIndex = 1;
        // console.log(this.search);
        let regStr = "";
        for(let i = 0; i < this.search.length; i++) {
            // console.log(i, this.search[i], regStr, ESCAPE_REGEX_TEST.test(this.search[i]));
            // console.log(this.search[i], "&&&&", ESCAPE_REGEX_TEST.test(this.search[i]));
            if(this.search[i] == "\\") {
                i++;
                regStr += "\\";
                // }
                regStr += this.search[i];
            }
            else if(ESCAPE_REGEX_TEST.test(this.search[i])) {
                regStr += "\\" + this.search[i];
            }
            else if(this.search[i] == "_") {
                let n = "";
                while(DIGIT_TEST.test(this.search[++i])) {
                    if(this.search[i] == ".") {
                        i++;
                        break;
                    }
                    n += this.search[i];
                }
                i--;
                n = n || "1";
                if(this.groups[n]) {
                    regStr += "\\" + this.groups[n];
                }
                else {
                    this.groups[n] = groupIndex++;
                    regStr += "([\\s\\S])";
                }
            }
            else {
                regStr += this.search[i];
            }
        }
        console.log("REGSTR = ", regStr);
        /*
        regStr = regStr
        
            // .replace(/(\\*)/g, (esc) => esc.slice(0, esc.length / 2))
            .replace(/(\\*)_(\d*)/g, (match, esc, n) => {
                // esc = esc.slice(0, esc.length / 2);
                console.log("ESC MAP", match, esc);
                if(esc.length % 2) {
                    // we don't need to escape the _
                    return esc.slice(1) + "_" + n;
                }
                n = n || "1";
                let str;
                if(this.groups[n]) {
                    str =  "\\" + this.groups[n];
                }
                else {
                    this.groups[n] = groupIndex++;
                    str = "";
                }
                
                return esc + str;
            })
            .replace(/\\([\[\]])/g, "$1");*/
        this.regex = new RegExp(regStr);
        return this.regex;
    }
    
    matchIndex(target) {
        return target.match(this.getRegex());
    }
    
    isTerminator() {
        return !this.search && !this.replace;
    }
}

class TwueParser {
    constructor(str) {
        this.str = str;
        this.rules = [];
        this.workspace = null;
        this.parseIndex = 0;
    }
    
    parse() {
        let line, rule;
        do {
            if(rule) {
                this.rules.push(rule);
            }
            line = this.getLine();
            // terminate on out of input
            if(line === null) break;
            // skip empty lines
            if(!line.trim()) continue;
            rule = this.parseRule(line);
        }
        while(!rule || !rule.isTerminator());
        this.workspace = this.str.slice(this.parseIndex);
    }
    
    getLine() {
        if(this.parseIndex >= this.str.length) {
            return null;
        }
        let i = this.parseIndex;
        while(i < this.str.length) {
            if(this.str[i] === "\n") break;
            i++;
        }
        let endIndex = i;
        // skip trailing carriage return
        if(this.str[endIndex - 1] === "\r") {
            endIndex--;
        }
        let res = this.str.slice(this.parseIndex, endIndex);
        this.parseIndex = i + 1;
        return res;
    }
    
    parseRule(line) {
        let i = 0;
        while(i < line.length && !isRuleIndicator(line.substr(i, 3))) {
            if(line[i] == "\\") i++;
            i++;
        }
        if(i >= line.length) {
            console.error("No rule indicator found on line: `" + line + "`");
            return null;
        }
        let search = line.slice(0, i);
        let ruleKind = line[i + 2];
        let replace = line.slice(i + 3);
        return new TwueRule(search, replace, ruleKind);
    }
}

let cutIntoString = (source, start, size, replace) =>
    source.slice(0, start) + replace + source.slice(start + size);

const readLineStdin = (eof = 10) => {
    let outBuf = Buffer.alloc(0);
    let buffer = Buffer.alloc(1);
    //EOF or EOL
    do {
        fs.readSync(0, buffer, 0, 1);
        outBuf = Buffer.concat([outBuf, buffer], outBuf.length + 1);
    } while(buffer[0] != 0 && buffer[0] != 10);
    return outBuf.toString("utf8");
};

class TwueInterpreter {
    constructor(code) {
        code = Preprocess(code);
        let parser = new TwueParser(code);
        parser.parse();
        let { workspace, rules } = parser;
        this.workspace = TwueRule.reduceEscapes(workspace);
        this.rules = rules;
        
        this.running = true;
        this.outputElement = null;
        this.inputElement = null;
        this.inputPointer = 0;
    }
    
    run() {
        this.debug("initial workspace:\n" + this.workspace);
        while(this.running) {
            this.stepRule();
            this.debug("Workspace after step:\n" + this.workspace);
        }
    }
    
    output(str) {
        //TODO: make better
        if(IS_BROWSER) {
            if(this.outputElement) {
                this.outputElement.value += str;
            }
        }
        else {
            process.stdout.write(str);
        }
    }
    
    getByte() {
        if(IS_BROWSER) {
            if(this.inputElement) {
                return this.inputElement.value[this.inputPointer++] || "\x00";
            }
            else {
                let p = prompt("Enter a character");
                p = p || "\x00";
                return p[0];
            }
        }
        let buffer = Buffer.alloc(1);
        try {
            fs.readSync(0, buffer, 0, 1);
        }
        catch(e) {
            if(e.code != "EOF") {
                console.error(e);
            }
            buffer[0] = 0;
        }
        this.debug("Input:", buffer, buffer.toString());
        // console.log(buffer, buffer.toString(), this.workspace);
        return buffer.toString("utf8");
    }
    
    getLine() {
        if(IS_BROWSER) {
            if(this.inputElement) {
                let i = this.inputPointer;
                let s = this.inputElement.value;
                let line = "";
                while(i < s.length && s[i] !== "\n") {
                    line += s[i];
                    i++;
                }
                this.inputPointer = i + 1;
                return line;
            }
            else {
                return prompt("Enter a line:") || "";
            }
        }
        else {
            return readLineStdin();
        }
    }
    
    debug(...args) {
        if(!this.debugMode) return;
        console.log("DEBUG:", ...args);
    }
    
    stepRule() {
        for(let rule of this.rules) {
            let match = rule.matchIndex(this.workspace);
            this.debug(rule.search, rule.getRegex(), match);
            if(match) {
                this.debug("Rule matched:", rule);
                let { replace, groups, ruleKind } = rule;
                this.debug("Replace:", replace);
                replace = replace.replace(/_(\d*);?/g, (all, n) => {
                    let g = groups[n || "1"];
                    return g in match ? match[g] : all;
                });
                if(ruleKind === RULE_SET) {
                    //pass
                }
                else if(ruleKind === RULE_OUTPUT) {
                    this.output(replace);
                    replace = "";
                }
                else if(ruleKind === RULE_INPUT) {
                    // TODO: check escaped
                    replace = replace.replace(/\.|\*/g, (match) => {
                        if(match === ".") {
                            return this.getByte();
                        }
                        else {
                            return this.getLine();
                        }
                    });
                }
                this.workspace = cutIntoString(this.workspace, match.index, match[0].length, replace);
                return true;
            }
        }
        // this.debug("no rules found\n" + this.workspace);
        return this.running = false;
    }
}

if(typeof process === 'object') {
    const fs = require("fs");
    let i = new TwueInterpreter(fs.readFileSync(process.argv[2]).toString());
    // i.debugMode = true;
    i.run();
    // console.log(i);
}