// Constants
let phi = (1 + Math.sqrt(5)) / 2;

// Helper functions
let desmos_mod = (n, m) => { return (n >= 0) ? n % m : m + n % m };

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

let factorial = (n) => gamma(n + 1);

let greatest_common_denominator = (x, y) => {
    while (Math.abs(y)) {
        let t = Math.abs(y);
        y = Math.abs(x) % Math.abs(y);
        x = t;
    }
    return x;
}

// Graphing functions
let drawEquation = (canvas, context, equation, dims, color, radius = 0.5) => {
    // Save the context
    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineWidth = 2 * radius;
    context.save();
    // Define min and max x and y values
    let [xmin, ymin, xmax, ymax] = dims
    // Define scaling factors
    let scaleFactorX = canvas.width / (xmax - xmin)
    let scaleFactorY = canvas.height / (ymax - ymin)
    // Flip the x axis
    context.translate(0, canvas.height);
    context.scale(1, -1);
    // Translate the canvas to the given boundaries
    context.translate(-xmin * scaleFactorX, -ymin * scaleFactorY);
    // Draw the function
    context.moveTo(xmin * scaleFactorX, equation(xmin * scaleFactorX));
    context.beginPath()
    for (let x = (xmin - 1); x <= (xmax + 1); x += 1 / scaleFactorX) {
        context.lineTo(x * scaleFactorX, equation(x) * scaleFactorY);
    }
    context.stroke();
    context.restore();
};

let drawEquationComplex = (canvas, context, leq, req, dims, color, radius = 0.5) => {
    // Save the context
    context.save();
    // Define min and max x and y values
    let [xmin, ymin, xmax, ymax] = dims
    // Define scaling factors
    let scaleFactorX = canvas.width / (xmax - xmin)
    let scaleFactorY = canvas.height / (ymax - ymin)
    // Flip the x axis
    context.translate(0, canvas.height);
    context.scale(1, -1);
    // Translate the canvas to the given boundaries
    context.translate(-xmin * scaleFactorX, -ymin * scaleFactorY);
    // Draw the function
    for (let x = (xmin - 1) * scaleFactorX; x <= (xmax + 1) * scaleFactorX; x++) {
        for (let y = (ymin - 1) * scaleFactorY; y <= (ymax + 1) * scaleFactorY; y++) {
            let arr = [];
            for (let i = 0; i <= 1; i++) {
                for (let j = 0; j <= 1; j++) {
                    let sample = leq((x + i) / scaleFactorX, (y + j) / scaleFactorY) - req((x + i) / scaleFactorX, (y + j) / scaleFactorY);
                    for (let k = 0; k < arr.length; k++) {
                        if ((sample >= 0 && arr[k] <= 0) || (sample <= 0 && arr[k] >= 0)) {
                            context.beginPath()
                            context.fillStyle = color;
                            context.arc(x - (radius / 2), y - (radius / 2), radius, 0, 2 * Math.PI);
                            context.fill();
                            k = arr.length;
                        }
                    }
                    arr.push(sample);
                }
            }
        }
    }
    // Restore the context
    context.restore();
};

let drawEquationInequality = (canvas, context, geq, leq, dims, color, radius = 0.5) => {
    // Save the context
    context.fillStyle = color;
    context.save();
    // Define min and max x and y values
    let [xmin, ymin, xmax, ymax] = dims
    // Define scaling factors
    let scaleFactorX = canvas.width / (xmax - xmin)
    let scaleFactorY = canvas.height / (ymax - ymin)
    // Flip the x axis
    context.translate(0, canvas.height);
    context.scale(1, -1);
    // Translate the canvas to the given boundaries
    context.translate(-xmin * scaleFactorX, -ymin * scaleFactorY);
    // Draw the function
    for (let x = (xmin - 1) * scaleFactorX; x <= (xmax + 1) * scaleFactorX; x++) {
        for (let y = (ymin - 1) * scaleFactorY; y <= (ymax + 1) * scaleFactorY; y++) {
            if (geq(x / scaleFactorX, y / scaleFactorY) > leq(x / scaleFactorX, y / scaleFactorY)) {
                context.beginPath()
                context.arc(x - (radius / 2), y - (radius / 2), radius, 0, 2 * Math.PI);
                context.fill();
            }
        }
    }
    context.restore();
};

// Math graphs
let equations = [
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$x^y=y^x$$';
        MathJax.typeset()
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, y);
            },
            (x, y) => {
                return Math.pow(y, x);
            },
            [0, 0, 10, 10],
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=e^{sin(x)}+x$$';
        MathJax.typeset()
        for (let i = -11; i <= 11; i++) {
            drawEquation(
                canvas,
                context,
                (x) => {
                    return Math.pow(Math.E, Math.sin(x + i)) + x + i + i * phi;
                },
                [-50, -50, 50, 50]
            );
        }
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y^3+x^3=x^2+y$$';
        MathJax.typeset()
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(y, 3) + Math.pow(x, 3);
            },
            (x, y) => {
                return Math.pow(x, 2) + y;
            },
            [-2, -2, 2, 2],
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y^9+x^7=x^5+y^3$$';
        MathJax.typeset()
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(y, 9) + Math.pow(x, 7);
            },
            (x, y) => {
                return Math.pow(x, 5) + Math.pow(y, 3);
            },
            [-2, -2, 2, 2],
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=cos(x^x)$$';
        MathJax.typeset()
        drawEquation(
            canvas,
            context,
            (x) => {
                return Math.cos(Math.pow(x, x));
            },
            [0, -10, 20, 50],
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=sin(x^{cos(y)})$$';
        MathJax.typeset()
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y;
            },
            (x, y) => {
                return Math.sin(Math.pow(x, Math.cos(y)));
            },
            [0, -10, 50, 10],
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$4^{ln(sin(y))}=tan|x|$$';
        MathJax.typeset()
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(4, Math.log(Math.sin(y)));
            },
            (x, y) => {
                return Math.tan(Math.abs(x));
            },
            [-20, -20, 20, 17],
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y< ln(sin(x))$$ ';
        MathJax.typeset()
        let dims = [-1, -20, 61, 1]
        drawEquationInequality(
            canvas,
            context,
            (x, y) => {
                return Math.log(Math.sin(x));
            },
            (x, y) => {
                return y;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$sin(log(x^y))>0$$';
        MathJax.typeset()
        let dims = [1, -20, 50, 20]
        drawEquationInequality(
            canvas,
            context,
            (x, y) => {
                return Math.sin(Math.log(Math.pow(x, y)) / Math.log(10));
            },
            (x, y) => {
                return 0;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$ln(x^y)+cos(y^x)=1$$';
        MathJax.typeset()
        let dims = [0, 0, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.log(Math.pow(x, y)) + Math.cos(Math.pow(y, x));
            },
            (x, y) => {
                return 1;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y^{16}=\\frac{y^{x^2+y^2}}{ln(2^{x^2-y^2})}$$';
        MathJax.typeset()
        let dims = [-6, -6, 6, 6]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(y, 16);
            },
            (x, y) => {
                return Math.pow(y, Math.pow(x, 2) + Math.pow(y, 2)) / Math.log(Math.pow(2, Math.pow(x, 2) - Math.pow(y, 2)));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=e^{cos(xy)}$$';
        MathJax.typeset()
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y;
            },
            (x, y) => {
                return Math.pow(Math.E, Math.cos(y * x));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$7^{xsin(x)}+x^{7sin(y)}=yx^2+2^{xy^2}$$';
        MathJax.typeset()
        let dims = [-1, -20, 70, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(7, x * Math.sin(x)) + Math.pow(x, 7 * Math.sin(y));
            },
            (x, y) => {
                return y * Math.pow(x, 2) + Math.pow(2, x * Math.pow(y, 2));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$x^2+y^2=tan(e^x)+\\frac{|4^x|}{sin(y)}$$';
        MathJax.typeset()
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, 2) + Math.pow(y, 2);
            },
            (x, y) => {
                return Math.tan(Math.pow(Math.E, x)) + Math.abs(Math.pow(4, x) / Math.sin(y));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=|sin(xcos(x))|$$';
        MathJax.typeset()
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.abs(Math.sin(x * Math.cos(x)));
            },
            (x, y) => {
                return 0.1;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=sin(x)^x+cos(y)^y$$';
        MathJax.typeset()
        let dims = [-50, -10, 50, 50]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y;
            },
            (x, y) => {
                return Math.pow(Math.sin(x), x) + Math.pow(Math.cos(y), y);
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=cos(x^2)^{cos(x^x)}$$';
        MathJax.typeset()
        let dims = [-10, 0, 100, 65]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y;
            },
            (x, y) => {
                return Math.pow(Math.cos(Math.pow(x, 2)), Math.cos(Math.pow(x, x)));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=sec(x^2)+csc(x)$$';
        MathJax.typeset()
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y;
            },
            (x, y) => {
                return Math.pow(Math.cos(Math.pow(x, 2)), -1) + Math.pow(Math.sin(x), -1);
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$x=\\sqrt{\\frac{tan(xy)}{4^y+x^4}}$$';
        MathJax.typeset()
        let dims = [0, -3, 10, 3]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return x;
            },
            (x, y) => {
                return Math.sqrt(Math.tan(x * y) / (Math.pow(4, y) + Math.pow(x, 4)));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=cos(4^x+y^4)$$';
        MathJax.typeset()
        let dims = [0, -3, 10, 3]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y;
            },
            (x, y) => {
                return Math.cos(Math.pow(4, x) + Math.pow(y, 4));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$tan(x^y)=sin(x^{cos(y)})$$';
        MathJax.typeset()
        let dims = [0, -20, 100, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.tan(Math.pow(x, y));
            },
            (x, y) => {
                return Math.sin(Math.pow(x, Math.cos(y)));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$sin(x^e)+cos(y^e)=1$$';
        MathJax.typeset()
        let dims = [0, 0, 15, 15]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.sin(Math.pow(x, Math.E)) + Math.cos(Math.pow(y, Math.E));
            },
            (x, y) => {
                return 1;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$tan(x^2+y^2)=1$$';
        MathJax.typeset()
        let dims = [0, 0, 15, 15]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.tan(Math.pow(x, 2) + Math.pow(y, 2));
            },
            (x, y) => {
                return 1;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$x=tan(y^2)$$';
        MathJax.typeset()
        let dims = [-30, -30, 30, 30]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.tan(Math.pow(y, 2));
            },
            (x, y) => {
                return x;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$x^2\\leq265cos^{4}(y^3)ex\\mod(2)$$';
        MathJax.typeset()
        let dims = [-5, -5, 5, 5]
        drawEquationInequality(
            canvas,
            context,
            (x, y) => {
                return desmos_mod(256 * Math.pow(Math.cos(Math.pow(y, 3)), 4) * Math.E * x, 2);
            },
            (x, y) => {
                return Math.pow(x, 2);
            },
            dims,
            color,
            radius,
        );
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return desmos_mod(256 * Math.pow(Math.cos(Math.pow(y, 3)), 4) * Math.E * x, 2);
            },
            (x, y) => {
                return Math.pow(x, 2);
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$tan(cot(x))$$';
        MathJax.typeset()
        let dims = [-20, -20, 20, 20]
        drawEquation(
            canvas,
            context,
            (x) => {
                return Math.tan(1 / Math.tan(x));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$\\frac{ln(cos(x))}{x}$$';
        MathJax.typeset()
        let dims = [-20, -5, 20, 5]
        drawEquation(
            canvas,
            context,
            (x) => {
                return Math.log(Math.cos(x)) / x;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$cos(x)=sin(y)$$';
        MathJax.typeset()
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.cos(x);
            },
            (x, y) => {
                return Math.sin(y);
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$cos(x)=xy$$';
        MathJax.typeset()
        let dims = [-20, -3, 20, 3]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.cos(x);
            },
            (x, y) => {
                return x * y;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=xcos(x!)$$';
        MathJax.typeset()
        let dims = [-10, -5, 10, 5]
        drawEquation(
            canvas,
            context,
            (x) => {
                return x * Math.cos(factorial(x));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$cos(x)=xsin(y)$$';
        MathJax.typeset()
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.cos(x);
            },
            (x, y) => {
                return x * Math.sin(y);
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=cosh(sin(x^2))$$';
        MathJax.typeset()
        let dims = [-10, -10, 10, 10]
        drawEquation(
            canvas,
            context,
            (x) => {
                return Math.cosh(Math.sin(Math.pow(x, 2)));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=cosh(cot(xsin(x^2)))$$';
        MathJax.typeset()
        let dims = [-10, 0, 10, 30]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.cosh(1 / Math.tan(x * Math.sin(Math.pow(x, 2))));
            },
            (x, y) => {
                return y;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$x+y=sin(e^x)$$';
        MathJax.typeset()
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return x + y;
            },
            (x, y) => {
                return Math.sin(Math.pow(Math.E, x));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=x(x\\mod2)$$';
        MathJax.typeset()
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return x * desmos_mod(x, 2);
            },
            (x, y) => {
                return y;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        let c = new Date().getFullYear();
        title.innerHTML = '$$x^2+y^2=cos(x)+sin(y^{' + c + '})$$';
        MathJax.typeset()
        let dims = [-2, -2, 2, 2]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, 2) + Math.pow(y, 2);
            },
            (x, y) => {
                return Math.cos(x) + Math.sin(Math.pow(y, c));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        let c = 100 * (new Date().getMonth() + 1) + (new Date().getDate());
        title.innerHTML = '$$x^2+y^2=cos(x)+sin(y^{' + c + '})$$';
        MathJax.typeset()
        let dims = [-2, -2, 2, 2]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, 2) + Math.pow(y, 2);
            },
            (x, y) => {
                return Math.cos(x) + Math.sin(Math.pow(y, c));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$xcos(x!+y)=1$$';
        MathJax.typeset()
        let dims = [-20, -5, 20, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return x * Math.cos(factorial(x) + y);
            },
            (x, y) => {
                return 1;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$\\frac{1}{x^2}=x \\mod y$$';
        MathJax.typeset()
        let dims = [-20, -5, 20, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return 1 / Math.pow(x, 2);
            },
            (x, y) => {
                return desmos_mod(x, y);
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$x^{sin(y^2)}+y^{cos(x)}=1$$';
        MathJax.typeset()
        let dims = [0, 0, 50, 40]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, Math.sin(Math.pow(y, 2))) + Math.pow(y, Math.cos(x));
            },
            (x, y) => {
                return 1;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$y=tan(tan(tan(sin(x)))$$';
        MathJax.typeset()
        let dims = [-50, -50, 50, 50]
        drawEquation(
            canvas,
            context,
            (x) => {
                return Math.tan(Math.tan(Math.tan(Math.sin(x))));
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$|tan(cos(y)+sin(x^4))|=1$$';
        MathJax.typeset()
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.abs(Math.tan(Math.cos(y) + Math.sin(Math.pow(x, 4))));
            },
            (x, y) => {
                return 1;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$cos^4(xy(+cos(4^y))+sin(y)=\\frac{2}{5}x+\\frac{1}{10}y^2$$';
        MathJax.typeset()
        let dims = [-50, -20, 5, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(Math.cos(x * y * Math.cos(Math.pow(4, y))), 2) + Math.sin(y);
            },
            (x, y) => {
                return 2 / 5 * x + y ^ 2 / 10;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$xcos(tan(y)+x!)=1$$';
        MathJax.typeset()
        let dims = [-20, -10, 20, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return x * Math.cos(Math.tan(y) + factorial(x));
            },
            (x, y) => {
                return 1;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$tan(x*y!)=1$$';
        MathJax.typeset()
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.tan(x * factorial(y));
            },
            (x, y) => {
                return 1;
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$sin^2(xy)=tan^2(xy)*cos^2(xy)$$';
        MathJax.typeset()
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(Math.sin(x * y), 2);
            },
            (x, y) => {
                return Math.pow(Math.tan(x * y), 2) * Math.pow(Math.cos(x * y), 2);
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$\\log(x,y)=\\log(y,x)$$';
        MathJax.typeset()
        let dims = [0, 0, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.log(x) / Math.log(y);
            },
            (x, y) => {
                return Math.log(y) / Math.log(x);
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$sin(x)+cos(x)+tan(x)$$';
        MathJax.typeset()
        let dims = [-20, -20, 20, 20]
        drawEquation(
            canvas,
            context,
            (x) => {
                return Math.sin(x) + Math.cos(x) + Math.tan(x);
            },
            dims,
            color,
            radius,
        );
    },
    (canvas, context, color, radius = 0.5) => {
        title.innerHTML = '$$tan(x)=cos(y)$$';
        MathJax.typeset()
        let dims = [-10, -5, 10, 5]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.tan(x);
            },
            (x, y) => {
                return Math.cos(y);
            },
            dims,
        );
    }
];