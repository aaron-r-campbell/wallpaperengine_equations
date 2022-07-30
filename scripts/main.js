// Config
let update_interval = 15;
let max_history_size = equations.length;
// Other
let upcoming = [];
let history = [];

window.onresize = () => {
    resizeCanvas(main_canvas, canvas_orientation);
    drawFunction();
}

let getNewFunction = () => {
    storeToHistory();
    if (upcoming.length < 1) upcoming = equations.sort(() => Math.random() - 0.5).concat(upcoming);
    while (upcoming.length > max_history_size * 2) upcoming.shift();
}

let storeToHistory = () => {
    if (upcoming[upcoming.length - 1] != null) history.push(upcoming.pop());
    while (history.length > max_history_size) history.shift();
}

let recoverHistory = () => {
    if (history.length < 1) history = equations.sort(() => Math.random() - 0.5).concat(history);
    upcoming.push(history.pop());
}

let drawFunction = async () => {
    clearContent(main_canvas, main_canvas_context, canvas_title);
    resizeCanvas(main_canvas, canvas_orientation);
    // Draw the new function
    draw_pixels(main_canvas, main_canvas_context, upcoming[upcoming.length - 1](main_canvas, canvas_title));
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