// Constants
let phi = (1 + Math.sqrt(5)) / 2;
let scale = 2;

// Helper functions
let range = (n) => Array(n).fill().map((x, i) => i);

let gamma = (n) => {
    let g = 7,
        p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (n < 0.5) {
        return Math.PI / Math.sin(n * Math.PI) / gamma(1 - n);
    }
    else {
        n--;
        let x = p[0];
        for (let i = 1; i < g + 2; i++) {
            x += p[i] / (n + i);
        }
        let t = n + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, (n + 0.5)) * Math.exp(-t) * x;
    }
}

let desmos_mod = (n, m) => (n >= 0) ? n % m : m + n % m;

let factorial = (n) => gamma(n + 1);

let greatest_common_denominator = (x, y) => x ? greatest_common_denominator(Math.abs(y), Math.abs(x) % Math.abs(y)) : x;

let fillPixel = (context, x, y, color) => {
    context.save();
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(x + 0.5 - phi / 2, y + 0.5 - phi / 2, phi, phi);
    context.restore();
}

let calculate_equation = async (canvas, context, { eq1 = (x, y) => x, eq2 = (x, y) => y, dims = [-1, -1, 1, 1], stroke_color = 'black', inequality = false } = {}) => {
    // Define number of horizontal and vertical samples to use
    let x_samples = canvas.width * scale,
        y_samples = canvas.height * scale;

    // Define min and max x and y values
    let [xmin, ymin, xmax, ymax] = dims;

    // Define scaling factors
    let pixel_width_x = (xmax - xmin) / x_samples,
        pixel_width_y = (ymax - ymin) / y_samples;

    // Define arrays for pixels and points surrounding the pixels
    let pixels = [],
        points = [];

    // Calculate boundary values
    async.each(
        range((x_samples + 1) * (y_samples + 1)),
        (point_index) => {
            let x = xmin + (point_index % x_samples) * pixel_width_x,
                y = ymin + (Math.floor(point_index / x_samples)) * pixel_width_y;
            points.push(eq1(x, y) - eq2(x, y));
        },
    );

    // Calculate pixel values
    async.each(
        range(x_samples * y_samples),
        (pixel_index) => {
            let p0 = points[pixel_index],
                p1 = points[pixel_index + 1],
                p2 = points[(x_samples + 1) + pixel_index],
                p3 = points[(x_samples + 1) + pixel_index + 1];

            // get value 0-1
            let c = [p0, p1, p2, p3].filter(x => x >= 0).length;
            if (c != 0 && c != 4) pixels.push([pixel_index, c]);
        },
    );

    return {
        pixels: pixels,
        x_samples: x_samples,
        scale: scale,
        inequality,
    };
};

let draw_pixels = (canvas, context, { pixels, scale, x_samples, inequality = false }, { stroke_color = 'black' } = {}) => {
    // Save the context
    context.save();

    // Reflect the y axis and scale the content
    context.translate(0, canvas.height);
    context.scale(1 / scale, -1 / scale);

    // Help with upscaling when resizing to larger canvas
    let resize_scale = canvas.width * scale / x_samples;

    // Draw pixels
    async.each(
        range(pixels.length * resize_scale * resize_scale),
        (i) => {
            let pixel_index = Math.floor(i / resize_scale / resize_scale)
            let [n, v] = pixels[pixel_index],
                x = n % (x_samples * resize_scale),
                y = Math.floor(n / x_samples * resize_scale);
            if (inequality && v > 0) fillPixel(context, x, y, stroke_color)
            else if (!inequality && v == 2) fillPixel(context, x, y, stroke_color)
            else if (!inequality && v == 1 || v == 3) fillPixel(context, x, y, '#000000CC');
        },
    );

    // Restore the context
    context.restore();
};

// Math graphs
let equations = [
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x^y=y^x', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 10, 10],
            eq1: (x, y) => Math.pow(x, y),
            eq2: (x, y) => Math.pow(y, x),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=e^{sin(x)}+x', title);
        for (let i = -11; i <= 11; i++) {
            return calculate_equation(canvas, context, {
                dims: [-50, -50, 50, 50],
                eq1: (x, y) => Math.pow(Math.E, Math.sin(x + i)) + x + i + i * phi,
                stroke_color: color
            });
        }
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y^3+x^3=x^2+y', title);
        return calculate_equation(canvas, context, {
            dims: [-2, -2, 2, 2],
            eq1: (x, y) => Math.pow(y, 3) + Math.pow(x, 3),
            eq2: (x, y) => Math.pow(x, 2) + y,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y^9+x^7=x^5+y^3', title);
        return calculate_equation(canvas, context, {
            dims: [-2, -2, 2, 2],
            eq1: (x, y) => Math.pow(y, 9) + Math.pow(x, 7),
            eq2: (x, y) => Math.pow(x, 5) + Math.pow(y, 3),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=cos(x^x)', title);
        return calculate_equation(canvas, context, {
            dims: [0, -10, 20, 50],
            eq1: (x, y) => Math.cos(Math.pow(x, x)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=sin(x^{cos(y)})', title);
        return calculate_equation(canvas, context, {
            dims: [0, -10, 50, 10],
            eq1: (x, y) => Math.sin(Math.pow(x, Math.cos(y))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('4^{ln(sin(y))}=tan|x|', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 17],
            eq1: (x, y) => Math.pow(4, Math.log(Math.sin(y))),
            eq2: (x, y) => Math.tan(Math.abs(x)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y< ln(sin(x))', title);
        return calculate_equation(canvas, context, {
            dims: [-1, -20, 61, 1],
            eq1: (x, y) => Math.log(Math.sin(x)),
            stroke_color: color,
            inequality: true,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('sin(log(x^y))>0', title);
        return calculate_equation(canvas, context, {
            dims: [1, -20, 50, 20],
            eq1: (x, y) => Math.sin(Math.log(Math.pow(x, y)) / Math.log(10)),
            eq2: (x, y) => 0,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('ln(x^y)+cos(y^x)=1', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 10, 10],
            eq1: (x, y) => Math.log(Math.pow(x, y)) + Math.cos(Math.pow(y, x)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y^{16}=\\frac{y^{x^2+y^2}}{ln(2^{x^2-y^2})}', title);
        return calculate_equation(canvas, context, {
            dims: [-6, -6, 6, 6],
            eq1: (x, y) => Math.pow(y, 16),
            eq2: (x, y) => Math.pow(y, Math.pow(x, 2) + Math.pow(y, 2)) / Math.log(Math.pow(2, Math.pow(x, 2) - Math.pow(y, 2))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=e^{cos(xy)}', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.pow(Math.E, Math.cos(y * x)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('7^{xsin(x)}+x^{7sin(y)}=yx^2+2^{xy^2}', title);
        return calculate_equation(canvas, context, {
            dims: [-1, -20, 70, 20],
            eq1: (x, y) => Math.pow(7, x * Math.sin(x)) + Math.pow(x, 7 * Math.sin(y)),
            eq2: (x, y) => y * Math.pow(x, 2) + Math.pow(2, x * Math.pow(y, 2)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x^2+y^2=tan(e^x)+\\frac{|4^x|}{sin(y)}', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.tan(Math.pow(Math.E, x)) + Math.abs(Math.pow(4, x) / Math.sin(y)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=|sin(xcos(x))|', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.abs(Math.sin(x * Math.cos(x))),
            eq2: (x, y) => y,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=sin(x)^x+cos(y)^y', title);
        return calculate_equation(canvas, context, {
            dims: [-50, -10, 50, 50],
            eq1: (x, y) => Math.pow(Math.sin(x), x) + Math.pow(Math.cos(y), y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=cos(x^2)^{cos(x^x)}', title);
        return calculate_equation(canvas, context, {
            dims: [-10, 0, 100, 65],
            eq1: (x, y) => Math.pow(Math.cos(Math.pow(x, 2)), Math.cos(Math.pow(x, x))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=sec(x^2)+csc(x)', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.pow(Math.cos(Math.pow(x, 2)), -1) + Math.pow(Math.sin(x), -1),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x=\\sqrt{\\frac{tan(xy)}{4^y+x^4}}', title);
        return calculate_equation(canvas, context, {
            dims: [0, -3, 10, 3],
            eq2: (x, y) => Math.sqrt(Math.tan(x * y) / (Math.pow(4, y) + Math.pow(x, 4))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=cos(4^x+y^4)', title);
        return calculate_equation(canvas, context, {
            dims: [0, -3, 10, 3],
            eq1: (x, y) => Math.cos(Math.pow(4, x) + Math.pow(y, 4)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('tan(x^y)=sin(x^{cos(y)})', title);
        return calculate_equation(canvas, context, {
            dims: [0, -20, 100, 20],
            eq1: (x, y) => Math.tan(Math.pow(x, y)),
            eq2: (x, y) => Math.sin(Math.pow(x, Math.cos(y))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('sin(x^e)+cos(y^e)=1', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 15, 15],
            eq1: (x, y) => Math.sin(Math.pow(x, Math.E)) + Math.cos(Math.pow(y, Math.E)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('tan(x^2+y^2)=1', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 15, 15],
            eq1: (x, y) => Math.tan(Math.pow(x, 2) + Math.pow(y, 2)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x=tan(y^2)', title);
        return calculate_equation(canvas, context, {
            dims: [-30, -30, 30, 30],
            eq2: (x, y) => Math.tan(Math.pow(y, 2)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x^2\\leq265cos^{4}(y^3)ex\\mod(2)', title);
        return calculate_equation(canvas, context, {
            dims: [-5, -5, 5, 5],
            eq1: (x, y) => desmos_mod(256 * Math.pow(Math.cos(Math.pow(y, 3)), 4) * Math.E * x, 2),
            eq2: (x, y) => Math.pow(x, 2),
            stroke_color: color,
            inequality: true,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=tan(cot(x))', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.tan(1 / Math.tan(x)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=\\frac{ln(cos(x))}{x}', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -5, 20, 5],
            eq1: (x, y) => Math.log(Math.cos(x)) / x,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('cos(x)=sin(y)', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.cos(x),
            eq2: (x, y) => Math.sin(y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('cos(x)=xy', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -3, 20, 3],
            eq1: (x, y) => Math.cos(x),
            eq2: (x, y) => x * y,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=xcos(x!)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -5, 10, 5],
            eq1: (x, y) => x * Math.cos(factorial(x)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('cos(x)=xsin(y)', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.cos(x),
            eq2: (x, y) => x * Math.sin(y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=cosh(sin(x^2))', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.cosh(Math.sin(Math.pow(x, 2))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=cosh(cot(xsin(x^2)))', title);
        return calculate_equation(canvas, context, {
            dims: [-10, 0, 10, 30],
            eq1: (x, y) => Math.cosh(1 / Math.tan(x * Math.sin(Math.pow(x, 2)))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x+y=sin(e^x)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => x + y,
            eq2: (x, y) => Math.sin(Math.pow(Math.E, x)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=x(x\\mod2)', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => x * desmos_mod(x, 2),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        let c = new Date().getFullYear();
        katex.render('x^2+y^2=cos(x)+sin(y^{' + c + '})', title);
        return calculate_equation(canvas, context, {
            dims: [-2, -2, 2, 2],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.cos(x) + Math.sin(Math.pow(y, c)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        let c = 100 * (new Date().getMonth() + 1) + (new Date().getDate());
        katex.render('x^2+y^2=cos(x)+sin(y^{' + c + '})', title);
        return calculate_equation(canvas, context, {
            dims: [-2, -2, 2, 2],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.cos(x) + Math.sin(Math.pow(y, c)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('xcos(x!+y)=1', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -5, 20, 10],
            eq1: (x, y) => x * Math.cos(factorial(x) + y),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('\\frac{1}{x^2}=x \\mod y', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -5, 20, 10],
            eq1: (x, y) => 1 / Math.pow(x, 2),
            eq2: (x, y) => desmos_mod(x, y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x^{sin(y^2)}+y^{cos(x)}=1', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 50, 40],
            eq1: (x, y) => Math.pow(x, Math.sin(Math.pow(y, 2))) + Math.pow(y, Math.cos(x)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=tan(tan(tan(sin(x)))', title);
        return calculate_equation(canvas, context, {
            dims: [-50, -50, 50, 50],
            eq1: (x, y) => Math.tan(Math.tan(Math.tan(Math.sin(x)))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('|tan(cos(y)+sin(x^4))|=1', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.abs(Math.tan(Math.cos(y) + Math.sin(Math.pow(x, 4)))),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('cos^4(xy(+cos(4^y))+sin(y)=\\frac{2}{5}x+\\frac{1}{10}y^2', title);
        return calculate_equation(canvas, context, {
            dims: [-50, -20, 5, 20],
            eq1: (x, y) => Math.pow(Math.cos(x * y * Math.cos(Math.pow(4, y))), 2) + Math.sin(y),
            eq2: (x, y) => 2 / 5 * x + y ^ 2 / 10,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('xcos(tan(y)+x!)=1', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -10, 20, 10],
            eq1: (x, y) => x * Math.cos(Math.tan(y) + factorial(x)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('tan(x*y!)=1', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.tan(x * factorial(y)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('sin^2(xy)=tan^2(xy)*cos^2(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.pow(Math.sin(x * y), 2),
            eq2: (x, y) => Math.pow(Math.tan(x * y), 2) * Math.pow(Math.cos(x * y), 2),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('\\log(x,y)=\\log(y,x)', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 10, 10],
            eq1: (x, y) => Math.log(x) / Math.log(y),
            eq2: (x, y) => Math.log(y) / Math.log(x),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=sin(x)+cos(x)+tan(x)', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.sin(x) + Math.cos(x) + Math.tan(x),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('tan(x)=cos(y)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -5, 10, 5],
            eq1: (x, y) => Math.tan(x),
            eq2: (x, y) => Math.cos(y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('|y|=sin|x|+log^2|x|', title);
        return calculate_equation(canvas, context, {
            dims: [-40, -20, 40, 20],
            eq1: (x, y) => Math.abs(y),
            eq2: (x, y) => Math.sin(Math.abs(x)) + Math.pow(Math.log(Math.abs(x)), 2),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x^2+y^2=2^x+2^y', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -10, 20, 10],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.pow(2, x) + Math.pow(2, y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x^4+y^4>4^x+4^y', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -10, 20, 10],
            eq1: (x, y) => Math.pow(x, 4) + Math.pow(y, 4),
            eq2: (x, y) => Math.pow(4, x) + Math.pow(4, y),
            stroke_color: color,
            inequality: true,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x^2+y^2=\\frac{1}{2}^y+cos^2(y)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 5],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.pow(1 / 2, y) + Math.pow(Math.cos(y), 2),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('\\log(x,y)=sin(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 100, 100],
            eq1: (x, y) => Math.log(y) / Math.log(x),
            eq2: (x, y) => Math.sin(x * y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x^y=cos(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [-100, -100, 100, 100],
            eq1: (x, y) => Math.pow(x, y),
            eq2: (x, y) => Math.cos(x * y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('xcos(y)=ycos(x)', title);
        return calculate_equation(canvas, context, {
            dims: [-40, -40, 40, 40],
            eq1: (x, y) => x * Math.cos(y),
            eq2: (x, y) => y * Math.cos(x),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=tan(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [-40, -40, 40, 40],
            eq1: (x, y) => Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=tan(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('tan(x^2)+tan(2^y)=1', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.tan(Math.pow(x, 2)) + Math.tan(Math.pow(2, y)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('\\frac{1}{x}+\\frac{1}{y}=sin(e^{-xy})', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => 1 / x + 1 / y,
            eq2: (x, y) => Math.sin(Math.pow(Math.E, -x * y)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('cos(x\\oplus y)+sin(x)=1', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.cos(x ^ y) + Math.sin(x),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('cos(x^y)+sin(x)=1', title);
        return calculate_equation(canvas, context, {
            dims: [0, -1, 20, 20],
            eq1: (x, y) => Math.cos(Math.pow(x, y)) + Math.sin(x),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('log(x^y)+log(x^{cos(2y)})=tan(3x)+sin(y^{log(x)})', title);
        return calculate_equation(canvas, context, {
            dims: [0, -1, 20, 20],
            eq1: (x, y) => (Math.log(Math.pow(x, y)) + Math.log(Math.pow(x, Math.cos(2 * y)))) / Math.log(10),
            eq2: (x, y) => Math.tan(3 * x) + Math.sin(Math.pow(y, Math.log(x) / Math.log(10))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('7^x+y^{2x}=tan(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -0, 10, 20],
            eq1: (x, y) => Math.pow(7, x) + Math.pow(y, 2 * x),
            eq2: (x, y) => Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('7^x+y^{2x}=cos(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [-20, 0, 0, 10],
            eq1: (x, y) => Math.pow(7, x) + Math.pow(y, 2 * x),
            eq2: (x, y) => Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('|sin(y)|=|log|x-y||', title);
        return calculate_equation(canvas, context, {
            dims: [-50, -50, 50, 50],
            eq1: (x, y) => Math.abs(Math.sin(y)),
            eq2: (x, y) => Math.abs(Math.log10(Math.abs(x - y))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        let yr = new Date().getFullYear() / 100;
        katex.render('x^2+y^2=' + yr + '(1+sin(xy))^2', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => yr * Math.pow(1 + Math.sin(x * y), 2),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('log(|x-y|+sin(xy))=sin(xy+log|x-y|)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.log10(Math.abs(x - y) + Math.sin(x * y)),
            eq2: (x, y) => Math.sin(x * y + Math.log10(Math.abs(x - y))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('\\sqrt{x}-\\sqrt{y}=sin(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 20, 20],
            eq1: (x, y) => Math.sqrt(x) - Math.sqrt(y),
            eq2: (x, y) => Math.sin(x * y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('cos(xy-2^{xy})=sin(x+y)-tan(\\sqrt{xy})', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 20, 20],
            eq1: (x, y) => Math.cos(x * y - Math.pow(2, x * y)),
            eq2: (x, y) => Math.sin(x + y) - Math.tan(Math.sqrt(x * y)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('(cos(y))^{sin(x)}=\\sqrt{x-y}', title);
        return calculate_equation(canvas, context, {
            dims: [-20, -20, 20, 20],
            eq1: (x, y) => Math.pow(Math.cos(y), Math.sin(x)),
            eq2: (x, y) => Math.sqrt(x - y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('xsin(y)=cos(y^x)', title);
        return calculate_equation(canvas, context, {
            dims: [-20, 0, 20, 20],
            eq1: (x, y) => x * Math.sin(y),
            eq2: (x, y) => Math.cos(Math.pow(y, x)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('\\sqrt{xy}=8\\sqrt{sin(xy)}', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 20, 20],
            eq1: (x, y) => Math.sqrt(x * y),
            eq2: (x, y) => 8 * Math.sqrt(Math.sin(x * y)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x^2-y^2=10sin(\\frac{x}{y})', title);
        return calculate_equation(canvas, context, {
            dims: [-4, -4, 4, 4],
            eq1: (x, y) => Math.pow(x, 2) - Math.pow(y, 2),
            eq2: (x, y) => 10 * Math.sin(x / y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('\\sqrt{x^4-y^4}=100sin(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [-30, -30, 30, 30],
            eq1: (x, y) => Math.sqrt(Math.pow(x, 4) - Math.pow(y, 4)),
            eq2: (x, y) => 100 * Math.sin(x * y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('5cos(5x)-5sin(5y)=xy', title);
        return calculate_equation(canvas, context, {
            dims: [-30, -30, 30, 30],
            eq1: (x, y) => 5 * Math.cos(5 * x) - 5 * Math.sin(5 * y),
            eq2: (x, y) => x * y,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('300^{sin(x)}+300^{cos(y)}=xy', title);
        return calculate_equation(canvas, context, {
            dims: [-30, -30, 30, 30],
            eq1: (x, y) => Math.pow(300, Math.sin(x)) + Math.pow(300, Math.cos(y)),
            eq2: (x, y) => x * y,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('sin(\\frac{x}{4})-cos(\\frac{y}{4})=sin(cos(\\frac{xy}{4}))', title);
        return calculate_equation(canvas, context, {
            dims: [-30, -30, 30, 30],
            eq1: (x, y) => Math.sin(0.25 * x) - Math.cos(0.25 * y),
            eq2: (x, y) => Math.sin(Math.cos(0.25 * x * y)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=sin(\\frac{1}{x})', title);
        return calculate_equation(canvas, context, {
            dims: [-2, -2, 2, 2],
            eq1: (x, y) => Math.sin(1 / x),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=tan(x^x)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.tan(Math.pow(x, x)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x+y=sin(cos(tan(cot(y)))', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 40],
            eq1: (x, y) => x + y,
            eq2: (x, y) => Math.sin(Math.cos(Math.tan(1 / Math.tan(y)))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=sin(e^{tan(ln(x))})', title);
        return calculate_equation(canvas, context, {
            dims: [0, -10, 100, 10],
            eq1: (x, y) => Math.sin(Math.pow(Math.E, Math.tan(Math.log(x)))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('yx-2=sinh(x)*\\mod(y,2)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 40],
            eq1: (x, y) => y * x - 2,
            eq2: (x, y) => Math.sinh(x) * desmos_mod(y, 2),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('sin(x^2+y^2)=(x+y)^2', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.sin(Math.pow(x, 2) + Math.pow(y, 2)),
            eq2: (x, y) => Math.pow(x + y, 2),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('-y^x<x^{|x^2|}', title);
        return calculate_equation(canvas, context, {
            dims: [-100000000, -50000000, 100000000, 100000000],
            eq1: (x, y) => Math.pow(x, Math.abs(Math.pow(x, 2))),
            eq2: (x, y) => -Math.pow(y, x),
            stroke_color: color,
            inequality: true,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('x!=y!tan(xy)', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => factorial(x),
            eq2: (x, y) => factorial(y) * Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('(x^2+cos(tan(y)))!=1', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => factorial(Math.pow(x, 2) + Math.cos(Math.tan(y))),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('\\frac{cos(x^{tan(y)})}{sin(y^{tan(x)})}=\\frac{1}{2}', title);
        return calculate_equation(canvas, context, {
            dims: [0, 0, 10, 5],
            eq1: (x, y) => Math.cos(Math.pow(x, Math.tan(y))) / Math.sin(Math.pow(y, Math.tan(x))),
            eq2: (x, y) => 1 / 2,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('y=-ln(cos(x!))', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 100, 50],
            eq1: (x, y) => -Math.log(Math.cos(factorial(x))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('tan(xy)=69', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 100, 50],
            eq1: (x, y) => Math.tan(x * y),
            eq2: (x, y) => 69,
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('tan(e^y)=cos(e^x)', title);
        return calculate_equation(canvas, context, {
            dims: [-2000, -2000, 2000, 1500],
            eq1: (x, y) => Math.tan(Math.pow(Math.E, y)),
            eq2: (x, y) => Math.cos(Math.pow(Math.E, x)),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('tan(xos(\\frac{x}{y}))=cot(ln(y^2))', title);
        return calculate_equation(canvas, context, {
            dims: [-100, -100, 100, 100],
            eq1: (x, y) => Math.tan(Math.cos(x / y)),
            eq2: (x, y) => 1 / Math.tan(Math.log(Math.pow(y, 2))),
            stroke_color: color,
        });
    },
    (canvas, context, title, color = currentColors.stroke_color) => {
        katex.render('(x-sin(20x))^2+\\frac{fy^2}{7}=20', title);
        return calculate_equation(canvas, context, {
            dims: [-10, -10, 10, 10],
            eq1: (x, y) => Math.pow(x + Math.sin(20 * x), 2) + 5 * Math.pow(y, 2) / 7,
            eq2: (x, y) => 20,
            stroke_color: color,
        });
    },
];