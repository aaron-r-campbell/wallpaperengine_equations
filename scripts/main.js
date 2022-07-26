// Other
let update_interval = 15;
let equation_queue = [];
let history = [];
let history_size = equations.length;
let currentFunction;
let monitor_count = 1;
let last_switch = 0;

window.onresize = () => {
    resizeCanvas(main_canvas, canvas_orientation);
    drawFunction();
}

let getNewFunction = () => {
    storeToHistory();
    if (equation_queue.length < monitor_count) equation_queue = equations.sort(() => Math.random() - 0.5).concat(equation_queue);
    while (equation_queue.length > history_size * 2) equation_queue.shift();
}

let storeToHistory = () => {
    if(equation_queue[equation_queue.length-1] != null) history.push(equation_queue.pop());
    while (history.length > history_size) history.shift();
}

let recoverHistory = () => {
    if (history.length < monitor_count) history = equations.sort(() => Math.random() - 0.5).concat(history);
    equation_queue.push(history.pop());
}

let drawFunction = () => {
    clearContent(main_canvas, main_canvas_context, canvas_title);
    resizeCanvas(main_canvas, canvas_orientation);
    // Draw the new function
    equation_queue[equation_queue.length - 1](main_canvas, main_canvas_context, canvas_title, currentColors.stroke_color);
}

let drawNewFunction = () => {
    getNewFunction();
    drawFunction();
}

let timer = () => {
    if (new Date().getMinutes() % update_interval == 0) drawNewFunction();
}

window.onkeydown = (evt) => {
    switch (evt.keyCode) {
        case 112: // f1 (back)
            evt.preventDefault();
            recoverHistory();
            drawFunction();
            break;
        case 113: // f2 (forward)
            evt.preventDefault();
            getNewFunction();
            drawFunction();
            break;
        default:
            return;
    }
};

let main = () => {
    drawNewFunction();
    setInterval(timer, 60000);
}

main();