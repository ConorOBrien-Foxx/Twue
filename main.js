window.addEventListener("load", function () {
    let submitCode = document.getElementById("submitCode");
    let submitRunCode = document.getElementById("submitRunCode");
    let stepCode = document.getElementById("stepCode");
    let runCode = document.getElementById("runCode");
    let runStepCode = document.getElementById("runStepCode");
    let runStepCodeDelay = document.getElementById("runStepCodeDelay");
    let code = document.getElementById("code");
    let output = document.getElementById("output");
    let input = document.getElementById("input");
    let useInput = document.getElementById("useInput");
    let workspace = document.getElementById("workspace");
    let bytes = document.getElementById("bytes");
    let exportURL = document.getElementById("exportURL");
    let exportPPCG = document.getElementById("exportPPCG");
    let stopCode = document.getElementById("stopCode");
    let optionButtonHolder = document.getElementById("optionButtonHolder");
    output.value = workspace.value = "";
    
    let encodeInfoToURL = (code, input = null) => {
        let s = "?code=" + encodeURIComponent(code);
        if(input) {
            s += ",input="+ encodeURIComponent(input);
        }
        return s;
    };
    exportURL.addEventListener("click", function () {
        window.location.search = encodeInfoToURL(code.value, input.value);
    });
    
    // modified from https://stackoverflow.com/a/14130005/4119004
    function escapeForHTML(str) {
        return str.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    };
    
    let width = 5;
    let base = 16;
    let getUniqueId = () => {
        let nowNumber = +new Date();
        let n = nowNumber % (base ** width);
        let s = n.toString(base);
        let rev = [...s].reverse().join("");
        return rev;
    };
    
    exportPPCG.addEventListener("click", function () {
        let base = location.protocol + "//" + location.host + location.pathname;
        let codeUrl = base + encodeInfoToURL(code.value, input.value);
        let outStr = "# [Twue], " + bytes.textContent + "\n\n";
        outStr += "<pre><code>" + escapeForHTML(code.value) + "</code></pre>\n\n";
        let id = "Twue-" + getUniqueId();
        outStr += "[Try it on the website!][" + id + "]\n\n";
        outStr += "[Twue]: https://github.com/ConorOBrien-Foxx/Twue/\n";
        outStr += "[" + id + "]: " + codeUrl;
        output.value = outStr;
    });
    
    if(window.location.search) {
        let strs = window.location.search.slice(1).split(",");
        for(let str of strs) {
            let match = str.match(/(\w+)=(.+)/);
            if(!match) {
                console.error("Malformed match:", match);
                continue;
            }
            let [ all, word, value ] = match;
            value = decodeURIComponent(value);  
            if(word === "code") {
                code.value = value;
            }
            else if(word === "input") {
                input.value = value;
            }
        }
    }
    
    let inst;
    let step = function () {
        inst.stepRule();
        workspace.value = inst.workspace;
        if(!inst.running) {
            return false;
        }
        return true;
    };
    
    let run = function () {
        inst.run();
        workspace.value = inst.workspace;
        setEnableState(false);
    };
    
    let updateCodeBytes = () => {
        let n = code.value.length;
        // console.log(n);
        bytes.textContent = n == 1 ? "1 byte" : n + " bytes";
    };
    updateCodeBytes();
    code.addEventListener("change", updateCodeBytes);
    code.addEventListener("input", updateCodeBytes);
    
    useInput.addEventListener("change", function () {
        input.style.display = useInput.checked ? "block" : "none";
    });
    
    const setEnableState = (enabled) => {
        for(let bt of optionButtonHolder.querySelectorAll("button")) {
            bt.disabled = !enabled;
        }
    };
    setEnableState(false);
    
    submitCode.addEventListener("click", function () {
        inst = new TwueInterpreter(code.value);
        inst.outputElement = output;
        if(useInput.checked) {
            inst.inputElement = input;
        }
        // inst.debugMode = true;
        setEnableState(true);
        workspace.value = inst.workspace;
        output.value = "";
    });
    
    submitRunCode.addEventListener("click", function () {
        submitCode.click();
        run();
    });
    
    stopCode.addEventListener("click", function () {
        isStepping = false;
    });
    
    
    let isStepping = false;
    let stepWithDelay = () => {
        if(!isStepping) {
            console.log("Interrupted/terminated");
            isStepping = false;
            return;
        }
        if(step()) {
            setTimeout(stepWithDelay, runStepCodeDelay.value);
        }
        else {
            isStepping = false;
            setEnableState(false);
        }
    };
    
    runStepCode.addEventListener("click", () => {
        if(isStepping) return;
        isStepping = true;
        stepWithDelay();
    });
    
    stepCode.addEventListener("click", step);
    runCode.addEventListener("click", run);
});