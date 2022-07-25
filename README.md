# wallpaperengine_equations

This is a simple webpage intended for use as a wallpaper using (wallpaperengine)[https://www.wallpaperengine.io/en].

## Overview of files:
- index.html: The homepage displayed as the wallpaper. Also contains the major javascript execution during runtime.
- styles/style.css: Stylesheet controlling the look and layout of the div and heading on the page.
- scripts/canvas_scene.js: JS file containing layout, theming, and content arrangement control. Affects the overall layout and display.
- scripts/math.js: JS file containing various scripts for plotting different equations within the HTML canvas.
- scripts/mathjax.js: Localized external library for rendering LaTeX equations in the heading element.
- assets/fonts/*: Fonts used by the MathJax library.

## Running:
For viewing in a browser, open the index.html file and use f2 and f1 for next and previous equations respectively.

To use as a desktop background, open wallpaperengine or a similar software which allows for HTML files as a background. For wallpaperengine, download the repository contents into some permanent folder on your PC. Next, drag the file index.html onto the lower half of the main wallpaperengine window so that the text "Import Offline Wallpaper" appears.