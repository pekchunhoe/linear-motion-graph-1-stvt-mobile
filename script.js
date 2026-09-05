/* =========================================================
   POSITION-TIME MOTION SIMULATION
   FINAL RESPONSIVE + ACCESSIBLE VERSION
   Physics:
   Position s(t)
   Velocity v(t)
   Total simulation time = 30 s
   Responsive:
   - Mobile phone
   - Small phone
   - iPad / tablet
   - Laptop / desktop
   Interaction:
   - Touch
   - Mouse
   - Stylus
   - Pointer Events
   - Keyboard focus
   ========================================================= */
/* =========================================================
   CANVAS ELEMENTS
   ========================================================= */
const posCanvas = document.getElementById("positionCanvas");
const velCanvas = document.getElementById("velocityCanvas");
const pctx = posCanvas.getContext("2d");
const vctx = velCanvas.getContext("2d");
/* =========================================================
   SIMULATION VARIABLES
   ========================================================= */
let playing = false;
let currentT = 0;
let animationId = null;
const totalTime = 30;
/* =========================================================
   RESPONSIVE GRAPH SETTINGS
   ========================================================= */
function getGraphMargin(canvas) {
    if (canvas.clientWidth <= 360) {
        return 38;
    }
    if (canvas.clientWidth <= 480) {
        return 45;
    }
    return 60;
}
function getVerticalMargin(canvas) {
    if (canvas.clientWidth <= 480) {
        return 25;
    }
    return 40;
}
function getFontSize(canvas) {
    if (canvas.clientWidth <= 360) {
        return 9;
    }
    if (canvas.clientWidth <= 480) {
        return 10;
    }
    if (canvas.clientWidth <= 768) {
        return 12;
    }
    return 14;
}
function getParticleSize(canvas) {
    if (canvas.clientWidth <= 360) {
        return 5;
    }
    if (canvas.clientWidth <= 480) {
        return 6;
    }
    if (canvas.clientWidth <= 768) {
        return 7;
    }
    return 8;
}
/* =========================================================
   HIGH-DPI CANVAS SETUP
   ========================================================= */
function setupCanvas(canvas, ctx) {
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(1, rect.width);
    const cssHeight = Math.max(1, rect.height);
    const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );
    /*
       Physical canvas resolution.
    */
    canvas.width = Math.round(
        cssWidth * dpr
    );
    canvas.height = Math.round(
        cssHeight * dpr
    );
    /*
       Draw using CSS-pixel coordinates.
    */
    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}
/* =========================================================
   RESIZE CANVAS
   ========================================================= */
function resizeCanvas() {
    setupCanvas(posCanvas, pctx);
    setupCanvas(velCanvas, vctx);
    drawAll();
}
window.addEventListener(
    "resize",
    resizeCanvas
);
/* =========================================================
   POSITION FUNCTION
   ========================================================= */
function s(t) {
    if (t <= 5) {
        return 2 * t * t;
    }
    if (t <= 10) {
        return 100 -
               2 * Math.pow(10 - t, 2);
    }
    if (t <= 15) {
        return 100;
    }
    if (t <= 25) {
        return 100 -
               20 * (t - 15);
    }
    return -100 +
           20 * (t - 25);
}
/* =========================================================
   VELOCITY FUNCTION
   ========================================================= */
function v(t) {
    if (t <= 5) {
        return 4 * t;
    }
    if (t <= 10) {
        return 4 * (10 - t);
    }
    if (t <= 15) {
        return 0;
    }
    if (t <= 25) {
        return -20;
    }
    return 20;
}
/* =========================================================
   X-AXIS MAPPING
   ========================================================= */
function mapX(t, canvas) {
    const margin =
        getGraphMargin(canvas);
    const rightMargin = 20;
    const usableWidth =
        canvas.clientWidth -
        margin -
        rightMargin;
    return margin +
           (t / totalTime) *
           usableWidth;
}
/* =========================================================
   POSITION Y MAPPING
   ========================================================= */
function mapYpos(value) {
    const h =
        posCanvas.clientHeight;
    const margin =
        getVerticalMargin(posCanvas);
    const usableHeight =
        h - 2 * margin;
    return h -
           margin -
           ((value + 120) / 240) *
           usableHeight;
}
/* =========================================================
   VELOCITY Y MAPPING
   ========================================================= */
function mapYvel(value) {
    const h =
        velCanvas.clientHeight;
    const margin =
        getVerticalMargin(velCanvas);
    const usableHeight =
        h - 2 * margin;
    return h -
           margin -
           ((value + 25) / 50) *
           usableHeight;
}
/* =========================================================
   POSITION-TIME GRAPH
   ========================================================= */
function drawPositionGraph() {
    const w =
        posCanvas.clientWidth;
    const h =
        posCanvas.clientHeight;
    pctx.clearRect(
        0,
        0,
        w,
        h
    );
    const margin =
        getGraphMargin(posCanvas);
    const verticalMargin =
        getVerticalMargin(posCanvas);
    const fontSize =
        getFontSize(posCanvas);
    const particleSize =
        getParticleSize(posCanvas);
    /* -----------------------------------------
       Axis locations
       ----------------------------------------- */
    const xAxisY =
        mapYpos(0);
    const yAxisX =
        margin;
    /* -----------------------------------------
       Font
       ----------------------------------------- */
    pctx.font =
        `${fontSize}px Arial, Helvetica, sans-serif`;
    pctx.textBaseline =
        "alphabetic";
    /* -----------------------------------------
       Axes
       ----------------------------------------- */
    pctx.strokeStyle =
        "black";
    pctx.lineWidth =
        2;
    pctx.beginPath();
    pctx.moveTo(
        yAxisX,
        xAxisY
    );
    pctx.lineTo(
        w - 20,
        xAxisY
    );
    pctx.moveTo(
        yAxisX,
        verticalMargin
    );
    pctx.lineTo(
        yAxisX,
        h - verticalMargin
    );
    pctx.stroke();
    /* -----------------------------------------
       Axis labels
       ----------------------------------------- */
    pctx.fillStyle =
        "black";
    pctx.fillText(
        "t (s)",
        Math.max(
            yAxisX + 5,
            w - 42
        ),
        xAxisY - 8
    );
    pctx.fillText(
        "s (m)",
        5,
        verticalMargin - 5
    );
    /* -----------------------------------------
       Position labels
       ----------------------------------------- */
    pctx.fillText(
        "100",
        Math.max(
            3,
            margin - 38
        ),
        mapYpos(100) + 4
    );
    pctx.fillText(
        "50",
        Math.max(
            5,
            margin - 30
        ),
        mapYpos(50) + 4
    );
    pctx.fillText(
        "0",
        Math.max(
            8,
            margin - 25
        ),
        mapYpos(0) + 4
    );
    pctx.fillText(
        "-100",
        Math.max(
            1,
            margin - 40
        ),
        mapYpos(-100) + 4
    );
    /* -----------------------------------------
       Position curve
       ----------------------------------------- */
    pctx.strokeStyle =
        "blue";
    pctx.lineWidth =
        3;
    pctx.beginPath();
    for (
        let t = 0;
        t <= totalTime;
        t += 0.05
    ) {
        const x =
            mapX(t, posCanvas);
        const y =
            mapYpos(s(t));
        if (t === 0) {
            pctx.moveTo(
                x,
                y
            );
        } else {
            pctx.lineTo(
                x,
                y
            );
        }
    }
    pctx.stroke();
    /* -----------------------------------------
       Moving point
       ----------------------------------------- */
    const x =
        mapX(
            currentT,
            posCanvas
        );
    const y =
        mapYpos(
            s(currentT)
        );
    pctx.fillStyle =
        "red";
    pctx.beginPath();
    pctx.arc(
        x,
        y,
        particleSize,
        0,
        Math.PI * 2
    );
    pctx.fill();
    /* -----------------------------------------
       Tangent line
       ----------------------------------------- */
    const deltaT =
        0.1;
    const t1 =
        Math.max(
            0,
            currentT - deltaT
        );
    const t2 =
        Math.min(
            totalTime,
            currentT + deltaT
        );
    const x1 =
        mapX(
            t1,
            posCanvas
        );
    const y1 =
        mapYpos(
            s(t1)
        );
    const x2 =
        mapX(
            t2,
            posCanvas
        );
    const y2 =
        mapYpos(
            s(t2)
        );
    const dx =
        x2 - x1;
    const dy =
        y2 - y1;
    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );
    if (length > 0) {
        const unitX =
            dx / length;
        const unitY =
            dy / length;
        let extend = 150;
        if (w <= 480) {
            extend = 80;
        }
        if (w <= 360) {
            extend = 60;
        }
        const startX =
            x - unitX * extend;
        const startY =
            y - unitY * extend;
        const endX =
            x + unitX * extend;
        const endY =
            y + unitY * extend;
        pctx.setLineDash([
            6,
            6
        ]);
        pctx.strokeStyle =
            "red";
        pctx.lineWidth =
            2;
        pctx.beginPath();
        pctx.moveTo(
            startX,
            startY
        );
        pctx.lineTo(
            endX,
            endY
        );
        pctx.stroke();
        pctx.setLineDash([]);
    }
}
/* =========================================================
   VELOCITY-TIME GRAPH
   ========================================================= */
function drawVelocityGraph() {
    const w =
        velCanvas.clientWidth;
    const h =
        velCanvas.clientHeight;
    vctx.clearRect(
        0,
        0,
        w,
        h
    );
    const margin =
        getGraphMargin(velCanvas);
    const verticalMargin =
        getVerticalMargin(velCanvas);
    const fontSize =
        getFontSize(velCanvas);
    const particleSize =
        getParticleSize(velCanvas);
    /* -----------------------------------------
       Axis locations
       ----------------------------------------- */
    const xAxisY =
        mapYvel(0);
    const yAxisX =
        margin;
    /* -----------------------------------------
       Font
       ----------------------------------------- */
    vctx.font =
        `${fontSize}px Arial, Helvetica, sans-serif`;
    vctx.textBaseline =
        "alphabetic";
    /* -----------------------------------------
       Axes
       ----------------------------------------- */
    vctx.strokeStyle =
        "black";
    vctx.lineWidth =
        2;
    vctx.beginPath();
    vctx.moveTo(
        yAxisX,
        xAxisY
    );
    vctx.lineTo(
        w - 20,
        xAxisY
    );
    vctx.moveTo(
        yAxisX,
        verticalMargin
    );
    vctx.lineTo(
        yAxisX,
        h - verticalMargin
    );
    vctx.stroke();
    /* -----------------------------------------
       Axis labels
       ----------------------------------------- */
    vctx.fillStyle =
        "black";
    vctx.fillText(
        "t (s)",
        Math.max(
            yAxisX + 5,
            w - 42
        ),
        xAxisY - 8
    );
    vctx.fillText(
        "v (m/s)",
        5,
        verticalMargin - 5
    );
    /* -----------------------------------------
       Velocity labels
       ----------------------------------------- */
    vctx.fillText(
        "20",
        Math.max(
            3,
            margin - 35
        ),
        mapYvel(20) + 4
    );
    vctx.fillText(
        "0",
        Math.max(
            8,
            margin - 25
        ),
        mapYvel(0) + 4
    );
    vctx.fillText(
        "-20",
        Math.max(
            1,
            margin - 40
        ),
        mapYvel(-20) + 4
    );
    /* -----------------------------------------
       Velocity curve
       ----------------------------------------- */
    vctx.strokeStyle =
        "green";
    vctx.lineWidth =
        3;
    vctx.beginPath();
    for (
        let t = 0;
        t <= totalTime;
        t += 0.05
    ) {
        const x =
            mapX(
                t,
                velCanvas
            );
        const y =
            mapYvel(
                v(t)
            );
        if (t === 0) {
            vctx.moveTo(
                x,
                y
            );
        } else {
            vctx.lineTo(
                x,
                y
            );
        }
    }
    vctx.stroke();
    /* -----------------------------------------
       Moving point
       ----------------------------------------- */
    const x =
        mapX(
            currentT,
            velCanvas
        );
    const y =
        mapYvel(
            v(currentT)
        );
    vctx.fillStyle =
        "red";
    vctx.beginPath();
    vctx.arc(
        x,
        y,
        particleSize,
        0,
        Math.PI * 2
    );
    vctx.fill();
}
/* =========================================================
   CAR UPDATE
   ========================================================= */
function updateCar() {
    const position =
        s(currentT);
    const road =
        document.querySelector(".road");
    const carContainer =
        document.getElementById(
            "carContainer"
        );
    const carSVG =
        document.getElementById(
            "carSVG"
        );
    if (
        !road ||
        !carContainer ||
        !carSVG
    ) {
        return;
    }
    const width =
        road.clientWidth;
    /* -----------------------------------------
       Responsive road margin
       ----------------------------------------- */
    let margin = 40;
    if (width <= 480) {
        margin = 25;
    }
    if (width <= 360) {
        margin = 20;
    }
    /* -----------------------------------------
       Convert position → road coordinate
       ----------------------------------------- */
    const x =
        margin +
        ((position + 100) / 200) *
        (width - 2 * margin);
    carContainer.style.left =
        `${x}px`;
    /* -----------------------------------------
       Car direction
       ----------------------------------------- */
    const velocity =
        v(currentT);
    if (velocity < -0.1) {
        carSVG.style.transform =
            "scaleX(-1)";
    } else {
        carSVG.style.transform =
            "scaleX(1)";
    }
}
/* =========================================================
   DRAW EVERYTHING
   ========================================================= */
function drawAll() {
    drawPositionGraph();
    drawVelocityGraph();
    updateCar();
}
/* =========================================================
   ANIMATION
   ========================================================= */
function animate() {
    if (!playing) {
        return;
    }
    currentT += 0.03;
    if (currentT >= totalTime) {
        currentT =
            totalTime;
        playing =
            false;
        animationId =
            null;
        drawAll();
        return;
    }
    drawAll();
    animationId =
        requestAnimationFrame(
            animate
        );
}
/* =========================================================
   PLAY BUTTON
   ========================================================= */
document
    .getElementById("playBtn")
    .addEventListener(
        "click",
        () => {
            if (!playing) {
                playing = true;
                animate();
            }
        }
    );
/* =========================================================
   STOP BUTTON
   ========================================================= */
document
    .getElementById("stopBtn")
    .addEventListener(
        "click",
        () => {
            playing = false;
            if (animationId !== null) {
                cancelAnimationFrame(
                    animationId
                );
                animationId = null;
            }
        }
    );
/* =========================================================
   RESET BUTTON
   ========================================================= */
document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        () => {
            playing = false;
            if (animationId !== null) {
                cancelAnimationFrame(
                    animationId
                );
                animationId = null;
            }
            currentT = 0;
            drawAll();
        }
    );
/* =========================================================
   POINTER / TOUCH GRAPH CONTROL
   ========================================================= */
let dragging = false;
/* -----------------------------------------
   Convert pointer X → simulation time
   ----------------------------------------- */
function updateTimeFromPointer(event) {
    const rect =
        posCanvas.getBoundingClientRect();
    const clientX =
        event.clientX;
    const x =
        clientX -
        rect.left;
    const margin =
        getGraphMargin(
            posCanvas
        );
    const usableWidth =
        rect.width -
        margin -
        20;
    let t =
        ((x - margin) /
        usableWidth) *
        totalTime;
    t =
        Math.max(
            0,
            Math.min(
                totalTime,
                t
            )
        );
    currentT =
        t;
    drawAll();
}
/* -----------------------------------------
   Pointer down
   ----------------------------------------- */
posCanvas.addEventListener(
    "pointerdown",
    (event) => {
        dragging = true;
        /*
           Capture the pointer so that
           dragging continues smoothly.
        */
        try {
            posCanvas.setPointerCapture(
                event.pointerId
            );
        } catch (error) {
            // Pointer capture unavailable.
        }
        updateTimeFromPointer(event);
    }
);
/* -----------------------------------------
   Pointer move
   ----------------------------------------- */
posCanvas.addEventListener(
    "pointermove",
    (event) => {
        if (!dragging) {
            return;
        }
        updateTimeFromPointer(event);
    }
);
/* -----------------------------------------
   Pointer up
   ----------------------------------------- */
posCanvas.addEventListener(
    "pointerup",
    (event) => {
        dragging = false;
        try {
            posCanvas.releasePointerCapture(
                event.pointerId
            );
        } catch (error) {
            // Pointer capture already released.
        }
    }
);
/* -----------------------------------------
   Pointer cancel
   ----------------------------------------- */
posCanvas.addEventListener(
    "pointercancel",
    () => {
        dragging = false;
    }
);
/* -----------------------------------------
   Pointer leaves canvas
   ----------------------------------------- */
posCanvas.addEventListener(
    "pointerleave",
    (event) => {
        /*
           Do not immediately stop dragging.
           Pointer capture keeps the interaction
           alive while the user is dragging.
        */
        if (
            event.pointerType === "mouse" &&
            !posCanvas.hasPointerCapture(
                event.pointerId
            )
        ) {
            dragging = false;
        }
    }
);
/* =========================================================
   KEYBOARD ACCESSIBILITY
   ========================================================= */
/*
   The Position-Time graph can also be
   controlled with the keyboard.
   Arrow Left  → move backward
   Arrow Right → move forward
   Home        → t = 0
   End         → t = 30 s
*/
posCanvas.addEventListener(
    "keydown",
    (event) => {
        const step = 0.1;
        let handled = true;
        switch (event.key) {
            case "ArrowLeft":
                currentT =
                    Math.max(
                        0,
                        currentT - step
                    );
                break;
            case "ArrowRight":
                currentT =
                    Math.min(
                        totalTime,
                        currentT + step
                    );
                break;
            case "Home":
                currentT = 0;
                break;
            case "End":
                currentT =
                    totalTime;
                break;
            default:
                handled = false;
        }
        if (handled) {
            event.preventDefault();
            drawAll();
        }
    }
);
/* =========================================================
   CONTEXT MENU
   ========================================================= */
posCanvas.addEventListener(
    "contextmenu",
    (event) => {
        event.preventDefault();
    }
);
/* =========================================================
   INITIALIZE
   ========================================================= */
resizeCanvas();

This is the version I recommend keeping as your master script.js. It is compatible with the latest index.html and style.css, including the focus/contrast accessibility additions.
