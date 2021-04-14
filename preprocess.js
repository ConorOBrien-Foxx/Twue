(function () {
    
    const Preprocess = function (str) {
        let lines = str.split("\n");
        let replacements = new Map([]);
        let defined = {};
        let parsed = [];
        let processLine = (line) => {
            for(let [ search, replace ] of replacements) {
                line = line.replaceAll(search, replace);
            }
            return line;
        };
        
        let depth = 0;
        let skipping = false;
        for(let line of lines) {
            let commandMatch = line.match(/^\s*#(define|undef|ifn?def|endif|else|note)(?:\s+(.+?)(?:\s+(.+))?$)?/);
            if(commandMatch) {
                let [ all, cmd, ...args ] = commandMatch;
                // console.log("PREPROCESS: ", all);
                // console.log("depth", depth, "skipping", skipping);
                // console.log(defined);
                depth += cmd === "ifdef";
                let toSkip = false;
                if(skipping && depth !== skipping) {
                    toSkip = true;
                }
                depth -= cmd === "endif";
                if(toSkip) {
                    continue;
                }
                // depth -= cmd === "en
                if(cmd === "ifdef") {
                    let [ term ] = args;
                    skipping = !defined[term] && depth;
                    continue;
                }
                else if(cmd === "ifndef") {
                    let [ term ] = args;
                    skipping = defined[term] && depth;
                    continue;
                }
                else if(cmd === "else") {
                    if(depth === skipping) {
                        skipping = false;
                    }
                    else {
                        skipping = ++depth;
                    }
                    continue;
                }
                else if(cmd === "endif") {
                    skipping = false;
                    continue;
                }
                // else 
                if(cmd === "define") {
                    let [ search, replace ] = args;
                    if(replace) {
                        replace = processLine(replace);
                        replacements.set(search, replace);
                    }
                    defined[search] = true;
                }
                else if(cmd === "undef") {
                    let [ term ] = args;
                    defined[term] = false;
                }
                else if(cmd === "note") {
                    // pass
                }
                else {
                    console.error("Unhandled command:", cmd);
                }
            }
            else if(!skipping) {
                parsed.push(processLine(line));
            }
        }
        
        return parsed.join("\n");
        
        // let tempReplacements = new Map(replacements);
        // let tempReplacements = replacements.slice();
        
        // for(let [search, replace] of tempReplacements) {
            // replacements = new Map(tempReplacements);
            // replacements.delete(search);
            // tempReplacements.set(search, processLine(replace));
        // }
        
        // replacements = tempReplacements;
        
        // return toParse.map(processLine).join("\n");
    };
    // Preprocess.Preprocessor = Preprocessor;
    
    
    if(typeof module !== "undefined") {
        module.exports = Preprocess;
    }
    else {
        window.BrowserPreprocess = Preprocess;
    }
})();