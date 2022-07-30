// Constants
let phi = (1 + Math.sqrt(5)) / 2;

// Helper functions
let range = n => [...Array(n).keys()]

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

let deconstruct_color = (color) => {
    return {
        r: parseInt(color.substring(1, 3), 16),
        g: parseInt(color.substring(3, 5), 16),
        b: parseInt(color.substring(5, 7), 16),
        a: parseInt(color.substring(7, 9), 16),
    }
}

let desmos_mod = (n, m) => (n >= 0) ? n % m : m + n % m;

let factorial = (n) => gamma(n + 1);

let greatest_common_denominator = (x, y) => x ? greatest_common_denominator(Math.abs(y), Math.abs(x) % Math.abs(y)) : x;

let calculate_equation = (canvas, { eq1 = (x, y) => x, eq2 = (x, y) => y, bounds = [-1, -1, 1, 1], inequality = false } = {}) => {
    // Define number of horizontal and vertical samples to use
    let x_samples = canvas.width,
        y_samples = canvas.height;

    // Define min and max x and y values
    let [x_min, y_min, x_max, y_max] = bounds;

    // Define scaling factors
    let sample_width = (x_max - x_min) / x_samples,
        sample_height = (y_max - y_min) / y_samples;

    // Define arrays for pixels and points surrounding the pixels
    let pixel_array = [],
        point_array = [];

    // Calculate boundary values
    let points_width = x_samples + 1;
    let points_height = y_samples + 1;
    for (let point_index = 0; point_index < points_width * points_height; point_index++) {
        let i = point_index % points_width,
            j = points_height - Math.floor(point_index / points_width);
        let x = x_min + i * sample_width,
            y = y_min + j * sample_height;
        point_array.push(eq1(x, y) - eq2(x, y));
    };

    // Calculate pixel values
    for (let pixel_index = 0; pixel_index < x_samples * y_samples; pixel_index++) {
        let i = pixel_index % x_samples,
            j = Math.floor(pixel_index / x_samples);
        // get value 0-1
        let value = [
            point_array[points_width * j + i],
            point_array[points_width * j + (i + 1)],
            point_array[points_width * (j + 1) + i],
            point_array[points_width * (j + 1) + (i + 1)]
        ].filter(x => x >= 0).length;
        if (value > 0) pixel_array.push({ pixel_index, value });
    };

    return {
        pixels: pixel_array,
        inequality: inequality,
    };
};

let draw_pixels = (canvas, context, { pixels, inequality = false }, { stroke_color = deconstruct_color(currentColors.stroke_color), fill_color = deconstruct_color(currentColors.fill_color) } = {}) => {
    let imgdata = context.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < pixels.length; i++) {
        let { pixel_index, value } = pixels[i];
        if (inequality) {
            imgdata.data[4 * Math.floor(pixel_index)] += fill_color.r;
            imgdata.data[4 * Math.floor(pixel_index) + 1] += fill_color.g;
            imgdata.data[4 * Math.floor(pixel_index) + 2] += fill_color.b;
            imgdata.data[4 * Math.floor(pixel_index) + 3] += fill_color.a * (value == 2 ? 1 : 0.4);
        } else if (value != 0 && value != 4) {
            imgdata.data[4 * Math.floor(pixel_index)] += stroke_color.r;
            imgdata.data[4 * Math.floor(pixel_index) + 1] += stroke_color.g;
            imgdata.data[4 * Math.floor(pixel_index) + 2] += stroke_color.b;
            imgdata.data[4 * Math.floor(pixel_index) + 3] += stroke_color.a * (value == 2 ? 1 : 0.4);
        }
    }
    context.putImageData(imgdata, 0, 0);
};

let update_title = async (title, base, extra) => {
    let latex = extra != null ? base + extra : base;
    katex.render(latex, title, {
        throwOnError: false
    });
    title.setAttribute("label", base);
}

// Math graphs
let equations = [
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x^y=y^x');
        return calculate_equation(canvas, {
            bounds: [0, 0, 10, 10],
            eq1: (x, y) => Math.pow(x, y),
            eq2: (x, y) => Math.pow(y, x),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=e^{\\sin{(x)}}+x');
        let pixels = [];
        for (let i = -11; i <= 11; i++) {
            let t = calculate_equation(canvas, {
                bounds: [-50, -50, 50, 50],
                eq1: (x, y) => Math.pow(Math.E, Math.sin(x + i)) + x + i + i * phi,
                stroke_color: color
            });
            pixels = pixels.concat(t.pixels);
        }
        return { pixels: pixels, inequality: false };
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y^3+x^3=x^2+y');
        return calculate_equation(canvas, {
            bounds: [-2, -2, 2, 2],
            eq1: (x, y) => Math.pow(y, 3) + Math.pow(x, 3),
            eq2: (x, y) => Math.pow(x, 2) + y,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y^9+x^7=x^5+y^3');
        return calculate_equation(canvas, {
            bounds: [-2, -2, 2, 2],
            eq1: (x, y) => Math.pow(y, 9) + Math.pow(x, 7),
            eq2: (x, y) => Math.pow(x, 5) + Math.pow(y, 3),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\cos{(x^x)}');
        return calculate_equation(canvas, {
            bounds: [0, -10, 20, 50],
            eq1: (x, y) => Math.cos(Math.pow(x, x)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\sin{(x^{\\cos{(y)}})}');
        return calculate_equation(canvas, {
            bounds: [0, -10, 50, 10],
            eq1: (x, y) => Math.sin(Math.pow(x, Math.cos(y))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '4^{\\ln{(\\sin{(y)}})}=\\tan{(\\left|x\\right|)}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 17],
            eq1: (x, y) => Math.pow(4, Math.log(Math.sin(y))),
            eq2: (x, y) => Math.tan(Math.abs(x)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y\\lt \\ln{(\\sin{(x)})}');
        return calculate_equation(canvas, {
            bounds: [-1, -20, 61, 1],
            eq1: (x, y) => Math.log(Math.sin(x)),
            stroke_color: color,
            inequality: true,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\sin{(\\log{(x^y)})}\\gt 0');
        return calculate_equation(canvas, {
            bounds: [1, -20, 50, 20],
            eq1: (x, y) => Math.sin(Math.log(Math.pow(x, y)) / Math.log(10)),
            eq2: (x, y) => 0,
            stroke_color: color,
            inequality: true,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\ln{(x^y)}+\\cos{(y^x)}=1');
        return calculate_equation(canvas, {
            bounds: [0, 0, 10, 10],
            eq1: (x, y) => Math.log(Math.pow(x, y)) + Math.cos(Math.pow(y, x)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y^{16}=\\frac{y^{x^2+y^2}}{\\ln{2^{x^2-y^2}}}');
        return calculate_equation(canvas, {
            bounds: [-6, -6, 6, 6],
            eq1: (x, y) => Math.pow(y, 16),
            eq2: (x, y) => Math.pow(y, Math.pow(x, 2) + Math.pow(y, 2)) / Math.log(Math.pow(2, Math.pow(x, 2) - Math.pow(y, 2))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=e^{\\cos{(xy)}}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.pow(Math.E, Math.cos(y * x)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '7^{x\\sin{(x)}}+x^{7\\sin{(y)}}=yx^2+2^{xy^2}');
        return calculate_equation(canvas, {
            bounds: [-1, -20, 70, 20],
            eq1: (x, y) => Math.pow(7, x * Math.sin(x)) + Math.pow(x, 7 * Math.sin(y)),
            eq2: (x, y) => y * Math.pow(x, 2) + Math.pow(2, x * Math.pow(y, 2)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x^2+y^2=\\tan{e^x}+\\frac{\\left|4^x\\right|}{\\sin{y}}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.tan(Math.pow(Math.E, x)) + Math.abs(Math.pow(4, x) / Math.sin(y)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\left|\\sin{(x\\cos{x})}\\right|');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.abs(Math.sin(x * Math.cos(x))),
            eq2: (x, y) => y,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=(\\sin{x})^x+(\\cos{y})^y');
        return calculate_equation(canvas, {
            bounds: [-50, -10, 50, 50],
            eq1: (x, y) => Math.pow(Math.sin(x), x) + Math.pow(Math.cos(y), y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\cos{(x^2)}^{\\cos{(x^x)}}');
        return calculate_equation(canvas, {
            bounds: [-10, 0, 100, 65],
            eq1: (x, y) => Math.pow(Math.cos(Math.pow(x, 2)), Math.cos(Math.pow(x, x))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\sec{x^2}+\\csc{x}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.pow(Math.cos(Math.pow(x, 2)), -1) + Math.pow(Math.sin(x), -1),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x=\\sqrt{\\frac{\\tan{xy}}{4^y+x^4}}');
        return calculate_equation(canvas, {
            bounds: [0, -3, 10, 3],
            eq2: (x, y) => Math.sqrt(Math.tan(x * y) / (Math.pow(4, y) + Math.pow(x, 4))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\cos{(4^x+y^4)}');
        return calculate_equation(canvas, {
            bounds: [0, -3, 10, 3],
            eq1: (x, y) => Math.cos(Math.pow(4, x) + Math.pow(y, 4)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\tan{(x^y)}=\\sin{(x^{\\cos{(y)}})}');
        return calculate_equation(canvas, {
            bounds: [0, -20, 100, 20],
            eq1: (x, y) => Math.tan(Math.pow(x, y)),
            eq2: (x, y) => Math.sin(Math.pow(x, Math.cos(y))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\sin{(x^e)}+\\cos{(y^e)}=1');
        return calculate_equation(canvas, {
            bounds: [0, 0, 15, 15],
            eq1: (x, y) => Math.sin(Math.pow(x, Math.E)) + Math.cos(Math.pow(y, Math.E)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\tan{(x^2+y^2)}=1');
        return calculate_equation(canvas, {
            bounds: [0, 0, 15, 15],
            eq1: (x, y) => Math.tan(Math.pow(x, 2) + Math.pow(y, 2)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x=\\tan{(y^2)}');
        return calculate_equation(canvas, {
            bounds: [-30, -30, 30, 30],
            eq2: (x, y) => Math.tan(Math.pow(y, 2)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x^2\\leq \\operatorname{mod}(265ex(\\cos{(y^3)})^4,2) ');
        return calculate_equation(canvas, {
            bounds: [-5, -5, 5, 5],
            eq1: (x, y) => desmos_mod(256 * Math.pow(Math.cos(Math.pow(y, 3)), 4) * Math.E * x, 2),
            eq2: (x, y) => Math.pow(x, 2),
            stroke_color: color,
            inequality: true,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\tan{(\\cot{x})}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.tan(1 / Math.tan(x)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\frac{\\ln{(\\cos{(x)}})}{x}');
        return calculate_equation(canvas, {
            bounds: [-20, -5, 20, 5],
            eq1: (x, y) => Math.log(Math.cos(x)) / x,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\cos{(x)}=\\sin{(y)}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.cos(x),
            eq2: (x, y) => Math.sin(y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\cos{(x)}=xy');
        return calculate_equation(canvas, {
            bounds: [-20, -3, 20, 3],
            eq1: (x, y) => Math.cos(x),
            eq2: (x, y) => x * y,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=x\\cos{(x!)}');
        return calculate_equation(canvas, {
            bounds: [-10, -5, 10, 5],
            eq1: (x, y) => x * Math.cos(factorial(x)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\cos{(x)}=x\\sin{(y)}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.cos(x),
            eq2: (x, y) => x * Math.sin(y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\cosh{(\\sin{(x^2)})}');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.cosh(Math.sin(Math.pow(x, 2))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\cosh{(\\cot{(x\\sin{(x^2)})})}');
        return calculate_equation(canvas, {
            bounds: [-10, 0, 10, 30],
            eq1: (x, y) => Math.cosh(1 / Math.tan(x * Math.sin(Math.pow(x, 2)))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x+y=\\sin{(e^x)}');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => x + y,
            eq2: (x, y) => Math.sin(Math.pow(Math.E, x)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=x\\operatorname{mod}(x, 2)');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => x * desmos_mod(x, 2),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        let c = new Date().getFullYear();
        update_title(title, 'x^2+y^2=\\cos{(x)}+\\sin{(y^{y^c})}', ', c=' + c);
        return calculate_equation(canvas, {
            bounds: [-2, -2, 2, 2],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.cos(x) + Math.sin(Math.pow(y, c)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        let c = 100 * (new Date().getMonth() + 1) + (new Date().getDate());
        update_title(title, 'x^2+y^2=\\cos{(x)}+\\sin{(y^c)}', ', c=' + c);
        return calculate_equation(canvas, {
            bounds: [-2, -2, 2, 2],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.cos(x) + Math.sin(Math.pow(y, c)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x\\cos{(x!+y)}=1');
        return calculate_equation(canvas, {
            bounds: [-20, -5, 20, 10],
            eq1: (x, y) => x * Math.cos(factorial(x) + y),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\frac{1}{(x^2)}=\\operatorname{mod}(x,y)');
        return calculate_equation(canvas, {
            bounds: [-20, -5, 20, 10],
            eq1: (x, y) => 1 / Math.pow(x, 2),
            eq2: (x, y) => desmos_mod(x, y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x^{\\sin{(y^2)}}+y^{\\cos{(x)}}=1');
        return calculate_equation(canvas, {
            bounds: [0, 0, 50, 40],
            eq1: (x, y) => Math.pow(x, Math.sin(Math.pow(y, 2))) + Math.pow(y, Math.cos(x)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\tan{(\\tan{(\\tan{(\\sin{(x)})})})}');
        return calculate_equation(canvas, {
            bounds: [-50, -50, 50, 50],
            eq1: (x, y) => Math.tan(Math.tan(Math.tan(Math.sin(x)))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\left|\\tan{(\\cos{(y))}+\\sin{(x^4)}}\\right|=1');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.abs(Math.tan(Math.cos(y) + Math.sin(Math.pow(x, 4)))),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '(\\cos{(xy+\\cos{(4^y)})})^2+\\sin{(y)}=\\frac{2}{5}x+\\frac{1}{10}y^2');
        return calculate_equation(canvas, {
            bounds: [-50, -20, 5, 20],
            eq1: (x, y) => Math.pow(Math.cos(x * y * Math.cos(Math.pow(4, y))), 2) + Math.sin(y),
            eq2: (x, y) => 2 / 5 * x + y ^ 2 / 10,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x\\cos{(\\tan{(y)}+x!)}=1');
        return calculate_equation(canvas, {
            bounds: [-20, -10, 20, 10],
            eq1: (x, y) => x * Math.cos(Math.tan(y) + factorial(x)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\tan{(x*y!)}=1');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.tan(x * factorial(y)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '(\\sin{(xy)})^2=(\\tan{(xy)})^2*(\\cos{(xy)})^2');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.pow(Math.sin(x * y), 2),
            eq2: (x, y) => Math.pow(Math.tan(x * y), 2) * Math.pow(Math.cos(x * y), 2),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\log_{x} y=\\log_{y} x');
        return calculate_equation(canvas, {
            bounds: [0, 0, 10, 10],
            eq1: (x, y) => Math.log(x) / Math.log(y),
            eq2: (x, y) => Math.log(y) / Math.log(x),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\sin{(x)}+\\cos{(x)}+\\tan{(x)}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.sin(x) + Math.cos(x) + Math.tan(x),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\tan{(x)}=\\cos{(y)}');
        return calculate_equation(canvas, {
            bounds: [-10, -5, 10, 5],
            eq1: (x, y) => Math.tan(x),
            eq2: (x, y) => Math.cos(y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\left|  y \\right| =\\sin{(\\left|  x\\right| )}+\\log(\\left|  x|  \\right)^2');
        return calculate_equation(canvas, {
            bounds: [-40, -20, 40, 20],
            eq1: (x, y) => Math.abs(y),
            eq2: (x, y) => Math.sin(Math.abs(x)) + Math.pow(Math.log(Math.abs(x)), 2),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x^2+y^2=2^x+2^y');
        return calculate_equation(canvas, {
            bounds: [-20, -10, 20, 10],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.pow(2, x) + Math.pow(2, y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x^4+y^4>4^x+4^y');
        return calculate_equation(canvas, {
            bounds: [-20, -10, 20, 10],
            eq1: (x, y) => Math.pow(x, 4) + Math.pow(y, 4),
            eq2: (x, y) => Math.pow(4, x) + Math.pow(4, y),
            stroke_color: color,
            inequality: true,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x^2+y^2=\\frac{1}{2}^y+\\cos{(y)}^2');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 5],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => Math.pow(1 / 2, y) + Math.pow(Math.cos(y), 2),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\log_{(x)} y=\\sin{(xy)}');
        return calculate_equation(canvas, {
            bounds: [0, 0, 100, 100],
            eq1: (x, y) => Math.log(y) / Math.log(x),
            eq2: (x, y) => Math.sin(x * y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x^y=\\cos{(xy)}');
        return calculate_equation(canvas, {
            bounds: [-100, -100, 100, 100],
            eq1: (x, y) => Math.pow(x, y),
            eq2: (x, y) => Math.cos(x * y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x\\cos{(y)}=y\\cos{(x)}');
        return calculate_equation(canvas, {
            bounds: [-40, -40, 40, 40],
            eq1: (x, y) => x * Math.cos(y),
            eq2: (x, y) => y * Math.cos(x),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\tan{(xy)}');
        return calculate_equation(canvas, {
            bounds: [-40, -40, 40, 40],
            eq1: (x, y) => Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\tan{(xy)}');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\tan{(x^2)}+\\tan{(2^y)}=1');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.tan(Math.pow(x, 2)) + Math.tan(Math.pow(2, y)),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\frac{1}{x}+\\frac{1}{y}=\\sin{(e^{-xy})}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => 1 / x + 1 / y,
            eq2: (x, y) => Math.sin(Math.pow(Math.E, -x * y)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\cos{(x\\oplus y)}+\\sin{(x)}=1');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.cos(x ^ y) + Math.sin(x),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\cos{(x^y)}+\\sin{(x)}=1');
        return calculate_equation(canvas, {
            bounds: [0, -1, 20, 20],
            eq1: (x, y) => Math.cos(Math.pow(x, y)) + Math.sin(x),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\log{(x^y)}+\\log{(x^{\\cos{(2y)}})}=\\tan{(3x)}+\\sin{(y^{\\log{(x)}})}');
        return calculate_equation(canvas, {
            bounds: [0, -1, 20, 20],
            eq1: (x, y) => (Math.log(Math.pow(x, y)) + Math.log(Math.pow(x, Math.cos(2 * y)))) / Math.log(10),
            eq2: (x, y) => Math.tan(3 * x) + Math.sin(Math.pow(y, Math.log(x) / Math.log(10))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '7^x+y^{2x}=\\tan{(x)}');
        return calculate_equation(canvas, {
            bounds: [-20, -0, 10, 20],
            eq1: (x, y) => Math.pow(7, x) + Math.pow(y, 2 * x),
            eq2: (x, y) => Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '7^x+y^{2x}=\\cos{(xy)}');
        return calculate_equation(canvas, {
            bounds: [-20, 0, 0, 10],
            eq1: (x, y) => Math.pow(7, x) + Math.pow(y, 2 * x),
            eq2: (x, y) => Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\left| \\sin{(y)}\\right| =\\left|  log(\\left|  x-y\\right| )\\right| ');
        return calculate_equation(canvas, {
            bounds: [-50, -50, 50, 50],
            eq1: (x, y) => Math.abs(Math.sin(y)),
            eq2: (x, y) => Math.abs(Math.log10(Math.abs(x - y))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        let yr = new Date().getFullYear() / 100;
        update_title(title, 'x^2+y^2=c(1+\\sin{(xy)})^2', ', c=' + yr);
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.pow(x, 2) + Math.pow(y, 2),
            eq2: (x, y) => yr * Math.pow(1 + Math.sin(x * y), 2),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\log{\\left| (x-y)\\right| +\\sin{(xy)}}=\\sin{(xy+\\log{\\left| (x-y)\\right| })}');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.log10(Math.abs(x - y) + Math.sin(x * y)),
            eq2: (x, y) => Math.sin(x * y + Math.log10(Math.abs(x - y))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\sqrt{x}-\\sqrt{y}=\\sin{(xy)}');
        return calculate_equation(canvas, {
            bounds: [0, 0, 20, 20],
            eq1: (x, y) => Math.sqrt(x) - Math.sqrt(y),
            eq2: (x, y) => Math.sin(x * y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\cos{(xy-2^{xy})}=\\sin{(x+y)}-\\tan{(\\sqrt{xy})}');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 20, 20],
            eq1: (x, y) => Math.cos(x * y - Math.pow(2, x * y)),
            eq2: (x, y) => Math.sin(x + y) - Math.tan(Math.sqrt(x * y)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '(\\cos{(y)})^{\\sin{(x)}}=\\sqrt{x-y}');
        return calculate_equation(canvas, {
            bounds: [-20, -20, 20, 20],
            eq1: (x, y) => Math.pow(Math.cos(y), Math.sin(x)),
            eq2: (x, y) => Math.sqrt(x - y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x\\sin{(y)}=\\cos{(y^x)}');
        return calculate_equation(canvas, {
            bounds: [-20, 0, 20, 20],
            eq1: (x, y) => x * Math.sin(y),
            eq2: (x, y) => Math.cos(Math.pow(y, x)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\sqrt{xy}=8\\sqrt{\\sin{(xy)}}');
        return calculate_equation(canvas, {
            bounds: [0, 0, 20, 20],
            eq1: (x, y) => Math.sqrt(x * y),
            eq2: (x, y) => 8 * Math.sqrt(Math.sin(x * y)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x^2-y^2=10\\sin{(\\frac{x}{y})}');
        return calculate_equation(canvas, {
            bounds: [-4, -4, 4, 4],
            eq1: (x, y) => Math.pow(x, 2) - Math.pow(y, 2),
            eq2: (x, y) => 10 * Math.sin(x / y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\sqrt{x^4-y^4}=100\\sin{(xy)}');
        return calculate_equation(canvas, {
            bounds: [-30, -30, 30, 30],
            eq1: (x, y) => Math.sqrt(Math.pow(x, 4) - Math.pow(y, 4)),
            eq2: (x, y) => 100 * Math.sin(x * y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '5\\cos{(5x)}-5\\sin{(5y)}=xy');
        return calculate_equation(canvas, {
            bounds: [-30, -30, 30, 30],
            eq1: (x, y) => 5 * Math.cos(5 * x) - 5 * Math.sin(5 * y),
            eq2: (x, y) => x * y,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '300^{\\sin{(x)}}+300^{\\cos{(y)}}=xy');
        return calculate_equation(canvas, {
            bounds: [-30, -30, 30, 30],
            eq1: (x, y) => Math.pow(300, Math.sin(x)) + Math.pow(300, Math.cos(y)),
            eq2: (x, y) => x * y,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\sin{(\\frac{x}{4})}-\\cos{(\\frac{y}{4})}=\\sin{(\\cos{(\\frac{xy}{4})})}');
        return calculate_equation(canvas, {
            bounds: [-30, -30, 30, 30],
            eq1: (x, y) => Math.sin(0.25 * x) - Math.cos(0.25 * y),
            eq2: (x, y) => Math.sin(Math.cos(0.25 * x * y)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\sin{(\\frac{1}{x})}');
        return calculate_equation(canvas, {
            bounds: [-2, -2, 2, 2],
            eq1: (x, y) => Math.sin(1 / x),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\tan{(x^x)}');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.tan(Math.pow(x, x)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x+y=\\sin{(\\cos{(\\tan{(\\cot{(y)})})})}');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => x + y,
            eq2: (x, y) => Math.sin(Math.cos(Math.tan(1 / Math.tan(y)))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=\\sin{(e^{\\tan{(\\ln{(x)})}})}');
        return calculate_equation(canvas, {
            bounds: [0, -10, 100, 10],
            eq1: (x, y) => Math.sin(Math.pow(Math.E, Math.tan(Math.log(x)))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'yx-2=\\sinh{(x)}\\operatorname{mod}(y,2)');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 40],
            eq1: (x, y) => y * x - 2,
            eq2: (x, y) => Math.sinh(x) * desmos_mod(y, 2),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\sin{(x^2+y^2)}=(x+y)^2');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.sin(Math.pow(x, 2) + Math.pow(y, 2)),
            eq2: (x, y) => Math.pow(x + y, 2),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '-y^x<x^{\\left|  x^2\\right|  }');
        return calculate_equation(canvas, {
            bounds: [-100000000, -50000000, 100000000, 100000000],
            eq1: (x, y) => Math.pow(x, Math.abs(Math.pow(x, 2))),
            eq2: (x, y) => -Math.pow(y, x),
            stroke_color: color,
            inequality: true,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'x!=y!\\tan{(xy)}');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => factorial(x),
            eq2: (x, y) => factorial(y) * Math.tan(x * y),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '(x^2+\\cos{(\\tan{(y)})})!=1');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => factorial(Math.pow(x, 2) + Math.cos(Math.tan(y))),
            eq2: (x, y) => 1,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\frac{\\cos{(x^{\\tan{(y)}})}}{\\sin{(y^{\\tan{(x)}})}}=\\frac{1}{2}');
        return calculate_equation(canvas, {
            bounds: [0, 0, 10, 5],
            eq1: (x, y) => Math.cos(Math.pow(x, Math.tan(y))) / Math.sin(Math.pow(y, Math.tan(x))),
            eq2: (x, y) => 1 / 2,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, 'y=-\\ln{(\\cos{(x!)})}');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 100, 50],
            eq1: (x, y) => -Math.log(Math.cos(factorial(x))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\tan{xy}=69');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 100, 50],
            eq1: (x, y) => Math.tan(x * y),
            eq2: (x, y) => 69,
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\tan{(e^y)}=\\cos{(e^x)}');
        return calculate_equation(canvas, {
            bounds: [-2000, -2000, 2000, 1500],
            eq1: (x, y) => Math.tan(Math.pow(Math.E, y)),
            eq2: (x, y) => Math.cos(Math.pow(Math.E, x)),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '\\tan{(\\cos{(\\frac{x}{y})})}=\\cot{(\\ln{(y^2)})}');
        return calculate_equation(canvas, {
            bounds: [-100, -100, 100, 100],
            eq1: (x, y) => Math.tan(Math.cos(x / y)),
            eq2: (x, y) => 1 / Math.tan(Math.log(Math.pow(y, 2))),
            stroke_color: color,
        });
    },
    (canvas, title, color = currentColors.stroke_color) => {
        update_title(title, '(x-\\sin{(20x)})^2+\\frac{(y^2)}{7}=20');
        return calculate_equation(canvas, {
            bounds: [-10, -10, 10, 10],
            eq1: (x, y) => Math.pow(x + Math.sin(20 * x), 2) + 5 * Math.pow(y, 2) / 7,
            eq2: (x, y) => 20,
            stroke_color: color,
        });
    },
];