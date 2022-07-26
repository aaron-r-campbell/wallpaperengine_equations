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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x^y=y^x', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=e^{sin(x)}+x', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y^3+x^3=x^2+y', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y^9+x^7=x^5+y^3', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=cos(x^x)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=sin(x^{cos(y)})', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('4^{ln(sin(y))}=tan|x|', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y< ln(sin(x))', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('sin(log(x^y))>0', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('ln(x^y)+cos(y^x)=1', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y^{16}=\\frac{y^{x^2+y^2}}{ln(2^{x^2-y^2})}', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=e^{cos(xy)}', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('7^{xsin(x)}+x^{7sin(y)}=yx^2+2^{xy^2}', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x^2+y^2=tan(e^x)+\\frac{|4^x|}{sin(y)}', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=|sin(xcos(x))|', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=sin(x)^x+cos(y)^y', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=cos(x^2)^{cos(x^x)}', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=sec(x^2)+csc(x)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x=\\sqrt{\\frac{tan(xy)}{4^y+x^4}}', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=cos(4^x+y^4)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('tan(x^y)=sin(x^{cos(y)})', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('sin(x^e)+cos(y^e)=1', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('tan(x^2+y^2)=1', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x=tan(y^2)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x^2\\leq265cos^{4}(y^3)ex\\mod(2)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('tan(cot(x))', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('\\frac{ln(cos(x))}{x}', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('cos(x)=sin(y)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('cos(x)=xy', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=xcos(x!)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('cos(x)=xsin(y)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=cosh(sin(x^2))', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=cosh(cot(xsin(x^2)))', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x+y=sin(e^x)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=x(x\\mod2)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        let c = new Date().getFullYear();
        katex.render('x^2+y^2=cos(x)+sin(y^{' + c + '})', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        let c = 100 * (new Date().getMonth() + 1) + (new Date().getDate());
        katex.render('x^2+y^2=cos(x)+sin(y^{' + c + '})', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('xcos(x!+y)=1', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('\\frac{1}{x^2}=x \\mod y', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x^{sin(y^2)}+y^{cos(x)}=1', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=tan(tan(tan(sin(x)))', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('|tan(cos(y)+sin(x^4))|=1', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('cos^4(xy(+cos(4^y))+sin(y)=\\frac{2}{5}x+\\frac{1}{10}y^2', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('xcos(tan(y)+x!)=1', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('tan(x*y!)=1', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('sin^2(xy)=tan^2(xy)*cos^2(xy)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('\\log(x,y)=\\log(y,x)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('sin(x)+cos(x)+tan(x)', title, {
            throwOnError: false
        });
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
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('tan(x)=cos(y)', title, {
            throwOnError: false
        });
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
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('|y|=sin|x|+log^2|x|', title, {
            throwOnError: false
        });
        let dims = [-40, -20, 40, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.abs(y);
            },
            (x, y) => {
                return Math.sin(Math.abs(x)) + Math.pow(Math.log(Math.abs(x)), 2);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x^2+y^2=2^x+2^y', title, {
            throwOnError: false
        });
        let dims = [-20, -10, 20, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, 2) + Math.pow(y, 2);
            },
            (x, y) => {
                return Math.pow(2, x) + Math.pow(2, y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x^4+y^4>4^x+4^y', title, {
            throwOnError: false
        });
        let dims = [-20, -10, 20, 10]
        drawEquationInequality(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, 4) + Math.pow(y, 4);
            },
            (x, y) => {
                return Math.pow(4, x) + Math.pow(4, y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x^2+y^2=\\frac{1}{2}^y+cos^2(y)', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 5]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, 2) + Math.pow(y, 2);
            },
            (x, y) => {
                return Math.pow(1 / 2, y) + Math.pow(Math.cos(y), 2);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('\\log(x,y)=sin(xy)', title, {
            throwOnError: false
        });
        let dims = [0, 0, 100, 100]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.log(y) / Math.log(x);
            },
            (x, y) => {
                return Math.sin(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x^y=cos(xy)', title, {
            throwOnError: false
        });
        let dims = [-100, -100, 100, 100]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, y);
            },
            (x, y) => {
                return Math.cos(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('xcos(y)=ycos(x)', title, {
            throwOnError: false
        });
        let dims = [-40, -40, 40, 40]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return x * Math.cos(y);
            },
            (x, y) => {
                return y * Math.cos(x);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=tan(xy)', title, {
            throwOnError: false
        });
        let dims = [-40, -40, 40, 40]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y;
            },
            (x, y) => {
                return Math.tan(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=tan(xy)', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y;
            },
            (x, y) => {
                return Math.tan(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('tan(x^2)+tan(2^y)=1', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.tan(Math.pow(x, 2)) + Math.tan(Math.pow(2, y));
            },
            (x, y) => {
                return 1;
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('\\frac{1}{x}+\\frac{1}{y}=sin(e^{-xy})', title, {
            throwOnError: false
        });
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return 1 / x + 1 / y;
            },
            (x, y) => {
                return Math.sin(Math.pow(Math.E, -x * y));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('cos(x\\oplus y)+sin(x)=1', title, {
            throwOnError: false
        });
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.cos(x ^ y) + Math.sin(x);
            },
            (x, y) => {
                return 1;
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('cos(x^y)+sin(x)=1', title, {
            throwOnError: false
        });
        let dims = [0, -1, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.cos(Math.pow(x, y)) + Math.sin(x);
            },
            (x, y) => {
                return 1;
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('log(x^y)+log(x^{cos(2y)})=tan(3x)+sin(y^{log(x)})', title, {
            throwOnError: false
        });
        let dims = [0, -1, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return (Math.log(Math.pow(x, y)) + Math.log(Math.pow(x, Math.cos(2 * y)))) / Math.log(10);
            },
            (x, y) => {
                return Math.tan(3 * x) + Math.sin(Math.pow(y, Math.log(x) / Math.log(10)));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('7^x+y^{2x}=tan(xy)', title, {
            throwOnError: false
        });
        let dims = [-20, -0, 10, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(7, x) + Math.pow(y, 2 * x);
            },
            (x, y) => {
                return Math.tan(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('7^x+y^{2x}=cos(xy)', title, {
            throwOnError: false
        });
        let dims = [-20, 0, 0, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(7, x) + Math.pow(y, 2 * x);
            },
            (x, y) => {
                return Math.tan(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('|sin(y)|=|log|x-y||', title, {
            throwOnError: false
        });
        let dims = [-50, -50, 50, 50]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.abs(Math.sin(y));
            },
            (x, y) => {
                return Math.abs(Math.log10(Math.abs(x - y)));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        let yr = new Date().getFullYear() / 100;
        katex.render('x^2+y^2=' + yr + '(1+sin(xy))^2', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, 2) + Math.pow(y, 2);
            },
            (x, y) => {
                return yr * Math.pow(1 + Math.sin(x * y), 2);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('log(|x-y|+sin(xy))=sin(xy+log|x-y|)', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.log10(Math.abs(x - y) + Math.sin(x * y));
            },
            (x, y) => {
                return Math.sin(x * y + Math.log10(Math.abs(x - y)));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('\\sqrt{x}-\\sqrt{y}=sin(xy)', title, {
            throwOnError: false
        });
        let dims = [0, 0, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.sqrt(x) - Math.sqrt(y);
            },
            (x, y) => {
                return Math.sin(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('cos(xy-2^{xy})=sin(x+y)-tan(\\sqrt{xy})', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.cos(x * y - Math.pow(2, x * y));
            },
            (x, y) => {
                return Math.sin(x + y) - Math.tan(Math.sqrt(x * y));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('(cos(y))^{sin(x)}=\\sqrt{x-y}', title, {
            throwOnError: false
        });
        let dims = [-20, -20, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(Math.cos(y), Math.sin(x));
            },
            (x, y) => {
                return Math.sqrt(x - y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('xsin(y)=cos(y^x)', title, {
            throwOnError: false
        });
        let dims = [-20, 0, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return x * Math.sin(y);
            },
            (x, y) => {
                return Math.cos(Math.pow(y, x));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('\\sqrt{xy}=8\\sqrt{sin(xy)}', title, {
            throwOnError: false
        });
        let dims = [0, 0, 20, 20]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.sqrt(x * y);
            },
            (x, y) => {
                return 8 * Math.sqrt(Math.sin(x * y));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x^2-y^2=10sin(\\frac{x}{y})', title, {
            throwOnError: false
        });
        let dims = [-4, -4, 4, 4]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, 2) - Math.pow(y, 2);
            },
            (x, y) => {
                return 10 * Math.sin(x / y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('\\sqrt{x^4-y^4}=100sin(xy)', title, {
            throwOnError: false
        });
        let dims = [-30, -30, 30, 30]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.sqrt(Math.pow(x, 4) - Math.pow(y, 4));
            },
            (x, y) => {
                return 100 * Math.sin(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('5cos(5x)-5sin(5y)=xy', title, {
            throwOnError: false
        });
        let dims = [-30, -30, 30, 30]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return 5 * Math.cos(5 * x) - 5 * Math.sin(5 * y);
            },
            (x, y) => {
                return x * y;
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('300^{sin(x)}+300^{cos(y)}=xy', title, {
            throwOnError: false
        });
        let dims = [-30, -30, 30, 30]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(300, Math.sin(x)) + Math.pow(300, Math.cos(y));
            },
            (x, y) => {
                return x * y;
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('sin(\\frac{x}{4})-cos(\\frac{y}{4})=sin(cos(\\frac{xy}{4}))', title, {
            throwOnError: false
        });
        let dims = [-30, -30, 30, 30]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.sin(0.25 * x) - Math.cos(0.25 * y);
            },
            (x, y) => {
                return Math.sin(Math.cos(0.25 * x * y));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=sin(\\frac{1}{x})', title, {
            throwOnError: false
        });
        let dims = [-2, -2, 2, 2]
        drawEquation(
            canvas,
            context,
            (x) => {
                return Math.sin(1 / x);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=tan(x^x)', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquation(
            canvas,
            context,
            (x) => {
                return Math.tan(Math.pow(x, x));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x+y=sin(cos(tan(cot(y)))', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return x + y;
            },
            (x, y) => {
                return Math.sin(Math.cos(Math.tan(1 / Math.tan(y))));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=sin(e^{tan(ln(x))})', title, {
            throwOnError: false
        });
        let dims = [0, -10, 100, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y;
            },
            (x, y) => {
                return Math.sin(Math.pow(Math.E, Math.tan(Math.log(x))));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('yx-2=sinh(x)*\\mod(y,2)', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 40]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return y * x - 2;
            },
            (x, y) => {
                return Math.sinh(x) * desmos_mod(y, 2);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('sin(x^2+y^2)=(x+y)^2', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.sin(Math.pow(x, 2) + Math.pow(y, 2));
            },
            (x, y) => {
                return Math.pow(x + y, 2);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('-y^x<x^{|x^2|}', title, {
            throwOnError: false
        });
        let dims = [-100000000, -50000000, 100000000, 100000000]
        drawEquationInequality(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x, Math.abs(Math.pow(x, 2)));
            },
            (x, y) => {
                return -Math.pow(y, x);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('x!=y!tan(xy)', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return factorial(x);
            },
            (x, y) => {
                return factorial(y) * Math.tan(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('(x^2+cos(tan(y)))!=1', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return factorial(Math.pow(x, 2) + Math.cos(Math.tan(y)));
            },
            (x, y) => {
                return 1;
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('\\frac{cos(x^{tan(y)})}{sin(y^{tan(x)})}=\\frac{1}{2}', title, {
            throwOnError: false
        });
        let dims = [0, 0, 10, 5]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.cos(Math.pow(x, Math.tan(y))) / Math.sin(Math.pow(y, Math.tan(x)));
            },
            (x, y) => {
                return 1 / 2;
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('y=-ln(cos(x!))', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 100, 50]
        drawEquation(
            canvas,
            context,
            (x) => {
                return -Math.log(Math.cos(factorial(x)));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('tan(xy)=69', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 100, 50]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return 69;
            },
            (x, y) => {
                return Math.tan(x * y);
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('tan(e^y)=cos(e^x)', title, {
            throwOnError: false
        });
        let dims = [-2000, -2000, 2000, 1500]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.tan(Math.pow(Math.E, y));
            },
            (x, y) => {
                return Math.cos(Math.pow(Math.E, x));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('tan(xos(\\frac{x}{y}))=cot(ln(y^2))', title, {
            throwOnError: false
        });
        let dims = [-100, -100, 100, 100]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.tan(Math.cos(x / y));
            },
            (x, y) => {
                return 1 / Math.tan(Math.log(Math.pow(y, 2)));
            },
            dims,
        );
    },
    (canvas, context, title, color, radius = 0.5) => {
        katex.render('(x-sin(20x))^2+\\frac{fy^2}{7}=20', title, {
            throwOnError: false
        });
        let dims = [-10, -10, 10, 10]
        drawEquationComplex(
            canvas,
            context,
            (x, y) => {
                return Math.pow(x + Math.sin(20 * x), 2) + 5 * Math.pow(y, 2) / 7;
            },
            (x, y) => {
                return 20;
            },
            dims,
        );
    },
];