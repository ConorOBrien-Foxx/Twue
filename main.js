window.addEventListener("load", function () {
    let submitCode = document.getElementById("submitCode");
    let stepCode = document.getElementById("stepCode");
    let runCode = document.getElementById("runCode");
    let code = document.getElementById("code");
    let output = document.getElementById("output");
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
    
    submitCode.addEventListener("click", function () {
        inst = new TwueInterpreter(code.value);
        inst.outputElement = output;
        inst.debugMode = true;
        stepCode.disabled = false;
        runCode.disabled = false;
        workspace.value = inst.workspace;
        output.value = "";
    });
    
    stepCode.addEventListener("click", step);
    runCode.addEventListener("click", run);
});