// Light mode default values
const default_light = {
    background_color: '#F5F5F7FF',
    canvas_color: '#FFFFFFFF',
    stroke_color: '#000000FF',
    shadow_color: '#00000022',
    font_color: '#000000FF',
    fill_color: '#000000CC',
    box_shadow: 'var(--shadow_color) 0px 0.1rem 1rem, var(--shadow_color) 0px 0.5rem 1rem',
}
// Dark mode default values
const default_dark = {
    background_color: '#1f1f1fFF',
    canvas_color: '#282828FF',
    stroke_color: '#F5F5F7FF',
    shadow_color: '#FFFFFF22',
    font_color: '#F5F5F7AA',
    fill_color: '#F5F5F7CC',
    box_shadow: 'var(--shadow_color) 0 0 0, var(--shadow_color) 0 0 0',
}

let setColors = (colors = default_light) => {
    let style = document.querySelector(':root').style;
    style.setProperty('--background_color', colors.background_color)
    style.setProperty('--canvas_color', colors.canvas_color)
    style.setProperty('--shadow_color', colors.shadow_color)
    style.setProperty('--font_color', colors.font_color)
    document.querySelector('canvas').style["boxShadow"] = colors.box_shadow;
    return colors;
}

let resizeCanvas = (canvas, orientation) => {
    const phi = (1 + Math.sqrt(5)) / 2;
    switch (orientation) {
        case 'auto':
            if (window.innerWidth > window.innerHeight) {
                resizeCanvas(canvas, 'landscape');
            } else if (window.innerWidth < window.innerHeight) {
                resizeCanvas(canvas, 'portrait');
            } else {
                resizeCanvas(canvas, 'square');
            }
            break;
        case 'landscape':
            if (window.innerWidth > window.innerHeight && window.innerHeight < window.innerWidth / phi) {
                canvas.width = window.innerHeight;
                canvas.height = canvas.width / phi;
            } else {
                canvas.width = window.innerWidth / phi;
                canvas.height = canvas.width / phi;
            }
            break;
        case 'portrait':
            if (window.innerWidth < window.innerHeight && window.innerWidth < window.innerHeight / phi) {
                canvas.height = window.innerWidth;
                canvas.width = canvas.height / phi;
            } else {
                canvas.height = window.innerHeight / phi;
                canvas.width = canvas.height / phi;
            }
            break;
        case 'square':
            if (window.innerWidth < window.innerHeight) {
                canvas.width = canvas.height = window.innerWidth / phi;
            } else {
                canvas.width = canvas.height = window.innerHeight / phi;
            }
            console.log('set to', canvas.width, canvas.height)
            break;
        default:
            console.log('Error, unknown type: ' + orientation);
    }
    // Update vertical position
    canvas.style.setProperty('--canvas_y_pos',(window.innerHeight-canvas.height)/2+'px');
    canvas.style.setProperty('--canvas_x_pos',(window.innerWidth-canvas.width)/2+'px');
    // Update label position
    let title = document.getElementById('canvas_title');
    let v_spacer = window.innerHeight/100*phi;
    let h_spacer = window.innerWidth/100*phi;
    title.style.setProperty('--title_y_pos',canvas.height+(window.innerHeight-canvas.height)/2+v_spacer+'px');
    title.style.setProperty('--title_x_pos',(window.innerWidth-canvas.width)/2+h_spacer+'px');
}

let clearContent = (canvas, context, title) => {
    context.restore();
    context.clearRect(0, 0, canvas.width, canvas.height);
    title.innerHTML = '';
}