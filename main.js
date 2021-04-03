window.addEventListener("load", function () {
    let submitCode = document.getElementById("submitCode");
    let submitRunCode = document.getElementById("submitRunCode");
    let stepCode = document.getElementById("stepCode");
    let runCode = document.getElementById("runCode");
    let code = document.getElementById("code");
    let output = document.getElementById("output");
    let input = document.getElementById("input");
    let useInput = document.getElementById("useInput");
    let workspace = document.getElementById("workspace");
    output.value = workspace.value = "";
    
    let inst;
    let step = function () {
        inst.stepRule();
        workspace.value = inst.workspace;
        if(!inst.running) {
            stepCode.disabled = true;
            runCode.disabled = true;
        }
    };
    
    let run = function () {
        inst.run();
        workspace.value = inst.workspace;
    };
    
    useInput.addEventListener("change", function () {
        input.style.display = useInput.checked ? "block" : "none";
    });
    
    submitCode.addEventListener("click", function () {
        inst = new TwueInterpreter(code.value);
        inst.outputElement = output;
        if(useInput.checked) {
            inst.inputElement = input;
        }
        inst.debugMode = true;
        stepCode.disabled = false;
        runCode.disabled = false;
        workspace.value = inst.workspace;
        output.value = "";
    });
    
    submitRunCode.addEventListener("click", function () {
        submitCode.click();
        run();
    });
    
    stepCode.addEventListener("click", step);
    runCode.addEventListener("click", run);
});