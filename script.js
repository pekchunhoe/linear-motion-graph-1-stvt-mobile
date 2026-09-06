/* =========================================================
   POSITION-TIME MOTION SIMULATION
   FINAL FIXED VERSION

   Responsive:
   - Mobile phone
   - iPad / tablet
   - Laptop / desktop

   Controls:
   - PLAY
   - STOP
   - RESET
   - Touch / mouse dragging
   - Keyboard control
   ========================================================= */


/* =========================================================
   GET HTML ELEMENTS
   ========================================================= */

const posCanvas = document.getElementById("positionCanvas");
const velCanvas = document.getElementById("velocityCanvas");

const pctx = posCanvas.getContext("2d");
const vctx = velCanvas.getContext("2d");

const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

const carContainer = document.getElementById("carContainer");
const carSVG = document.getElementById("carSVG");
const road = document.querySelector(".road");


/* =========================================================
   SIMULATION VARIABLES
   ========================================================= */

let playing = false;

let currentT = 0;

let animationId = null;

const totalTime = 30;


/* =========================================================
   RESPONSIVE SETTINGS
   ========================================================= */

function getGraphMargin(canvas) {

    const width = canvas.getBoundingClientRect().width;

    if (width <= 360) {
        return 38;
    }

    if (width <= 480) {
        return 45;
    }

    return 60;
}


function getVerticalMargin(canvas) {

    const width = canvas.getBoundingClientRect().width;

    if (width <= 480) {
        return 25;
    }

    return 40;
}


function getFontSize(canvas) {

    const width = canvas.getBoundingClientRect().width;

    if (width <= 360) {
        return 9;
    }

    if (width <= 480) {
        return 10;
    }

    if (width <= 768) {
        return 12;
    }

    return 14;
}


function getParticleSize(canvas) {

    const width = canvas.getBoundingClientRect().width;

    if (width <= 360) {
        return 5;
    }

    if (width <= 480) {
        return 6;
    }

    if (width <= 768) {
        return 7;
    }

    return 8;
}


/* =========================================================
   CANVAS RESIZE
   ========================================================= */

function resizeCanvas() {

    const posRect =
        posCanvas.getBoundingClientRect();

    const velRect =
        velCanvas.getBoundingClientRect();


    /*
       Use the actual CSS display size.

       Device pixel ratio is deliberately kept simple
       to avoid drawing/scaling conflicts.
    */

    posCanvas.width =
        Math.max(1, Math.round(posRect.width));

    posCanvas.height =
        Math.max(1, Math.round(posRect.height));


    velCanvas.width =
        Math.max(1, Math.round(velRect.width));

    velCanvas.height =
        Math.max(1, Math.round(velRect.height));


    /*
       Reset canvas transformations.
    */

    pctx.setTransform(
        1, 0, 0, 1, 0, 0
    );

    vctx.setTransform(
        1, 0, 0, 1, 0, 0
    );


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
   X MAPPING
   ========================================================= */

function mapX(t, canvas) {

    const width =
        canvas.getBoundingClientRect().width;

    const margin =
        getGraphMargin(canvas);

    const rightMargin = 20;

    const usableWidth =
        width -
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

    const height =
        posCanvas.getBoundingClientRect().height;

    const margin =
        getVerticalMargin(posCanvas);

    const usableHeight =
        height -
        2 * margin;


    return height -
        margin -
        ((value + 120) / 240) *
        usableHeight;
}


/* =========================================================
   VELOCITY Y MAPPING
   ========================================================= */

function mapYvel(value) {

    const height =
        velCanvas.getBoundingClientRect().height;

    const margin =
        getVerticalMargin(velCanvas);

    const usableHeight =
        height -
        2 * margin;


    return height -
        margin -
        ((value + 25) / 50) *
        usableHeight;
}


/* =========================================================
   POSITION-TIME GRAPH
   ========================================================= */

function drawPositionGraph() {

    const width =
        posCanvas.getBoundingClientRect().width;

    const height =
        posCanvas.getBoundingClientRect().height;


    pctx.clearRect(
        0,
        0,
        width,
        height
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
       Axis positions
       ----------------------------------------- */

    const xAxisY =
        mapYpos(0);

    const yAxisX =
        margin;


    /* -----------------------------------------
       Text
       ----------------------------------------- */

    pctx.font =
        `${fontSize}px Arial`;

    pctx.fillStyle =
        "black";

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
        width - 20,
        xAxisY
    );

    pctx.moveTo(
        yAxisX,
        verticalMargin
    );

    pctx.lineTo(
        yAxisX,
        height - verticalMargin
    );

    pctx.stroke();


    /* -----------------------------------------
       Axis labels
       ----------------------------------------- */

    pctx.fillText(
        "t (s)",
        width - 42,
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
        Math.max(3, margin - 38),
        mapYpos(100) + 4
    );

    pctx.fillText(
        "50",
        Math.max(5, margin - 30),
        mapYpos(50) + 4
    );

    pctx.fillText(
        "0",
        Math.max(8, margin - 25),
        mapYpos(0) + 4
    );

    pctx.fillText(
        "-100",
        Math.max(1, margin - 40),
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
       Moving red point
       ----------------------------------------- */

    const pointX =
        mapX(
            currentT,
            posCanvas
        );

    const pointY =
        mapYpos(
            s(currentT)
        );


    pctx.fillStyle =
        "red";

    pctx.beginPath();

    pctx.arc(
        pointX,
        pointY,
        particleSize,
        0,
        Math.PI * 2
    );

    pctx.fill();


    /* -----------------------------------------
       Tangent line
       ----------------------------------------- */

    const deltaT = 0.1;


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


        let extension = 150;


        if (width <= 480) {
            extension = 80;
        }

        if (width <= 360) {
            extension = 60;
        }


        const startX =
            pointX -
            unitX * extension;

        const startY =
            pointY -
            unitY * extension;


        const endX =
            pointX +
            unitX * extension;

        const endY =
            pointY +
            unitY * extension;


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

    const width =
        velCanvas.getBoundingClientRect().width;

    const height =
        velCanvas.getBoundingClientRect().height;


    vctx.clearRect(
        0,
        0,
        width,
        height
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
       Axis positions
       ----------------------------------------- */

    const xAxisY =
        mapYvel(0);

    const yAxisX =
        margin;


    /* -----------------------------------------
       Text
       ----------------------------------------- */

    vctx.font =
        `${fontSize}px Arial`;

    vctx.fillStyle =
        "black";

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
        width - 20,
        xAxisY
    );

    vctx.moveTo(
        yAxisX,
        verticalMargin
    );

    vctx.lineTo(
        yAxisX,
        height - verticalMargin
    );

    vctx.stroke();


    /* -----------------------------------------
       Axis labels
       ----------------------------------------- */

    vctx.fillText(
        "t (s)",
        width - 42,
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
        Math.max(3, margin - 35),
        mapYvel(20) + 4
    );

    vctx.fillText(
        "0",
        Math.max(8, margin - 25),
        mapYvel(0) + 4
    );

    vctx.fillText(
        "-20",
        Math.max(1, margin - 40),
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
       Moving red point
       ----------------------------------------- */

    const pointX =
        mapX(
            currentT,
            velCanvas
        );

    const pointY =
        mapYvel(
            v(currentT)
        );


    vctx.fillStyle =
        "red";

    vctx.beginPath();

    vctx.arc(
        pointX,
        pointY,
        particleSize,
        0,
        Math.PI * 2
    );

    vctx.fill();
}


/* =========================================================
   UPDATE CAR
   ========================================================= */

function updateCar() {

    if (!road || !carContainer || !carSVG) {
        return;
    }


    const position =
        s(currentT);

    const roadWidth =
        road.getBoundingClientRect().width;


    /* -----------------------------------------
       Responsive road margins
       ----------------------------------------- */

    let margin = 40;


    if (roadWidth <= 480) {
        margin = 25;
    }

    if (roadWidth <= 360) {
        margin = 20;
    }


    /* -----------------------------------------
       Position → road coordinate
       ----------------------------------------- */

    const x =
        margin +
        ((position + 100) / 200) *
        (roadWidth - 2 * margin);


    carContainer.style.left =
        `${x}px`;


    /* -----------------------------------------
       Direction
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
   PLAY / ANIMATION
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

playBtn.addEventListener(
    "click",
    () => {

        if (playing) {
            return;
        }


        /*
           If simulation has reached the end,
           start again from the beginning.
        */

        if (currentT >= totalTime) {
            currentT = 0;
        }


        playing = true;

        animate();
    }
);


/* =========================================================
   STOP BUTTON
   ========================================================= */

stopBtn.addEventListener(
    "click",
    () => {

        playing = false;


        if (animationId !== null) {

            cancelAnimationFrame(
                animationId
            );

            animationId = null;
        }


        drawAll();
    }
);


/* =========================================================
   RESET BUTTON
   ========================================================= */

resetBtn.addEventListener(
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
   TOUCH / MOUSE / STYLUS CONTROL
   ========================================================= */

let dragging = false;


/* -----------------------------------------
   Convert pointer position to time
   ----------------------------------------- */

function setTimeFromPointer(event) {

    const rect =
        posCanvas.getBoundingClientRect();


    const x =
        event.clientX -
        rect.left;


    const margin =
        getGraphMargin(posCanvas);


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


    currentT = t;


    /*
       Dragging manually pauses the animation.
    */

    if (dragging) {
        playing = false;

        if (animationId !== null) {

            cancelAnimationFrame(
                animationId
            );

            animationId = null;
        }
    }


    drawAll();
}


/* -----------------------------------------
   Pointer down
   ----------------------------------------- */

posCanvas.addEventListener(
    "pointerdown",
    (event) => {

        dragging = true;


        try {

            posCanvas.setPointerCapture(
                event.pointerId
            );

        } catch (error) {
            // Pointer capture unavailable.
        }


        setTimeFromPointer(event);
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


        setTimeFromPointer(event);
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
            // Pointer already released.
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


/* =========================================================
   KEYBOARD CONTROL
   ========================================================= */

posCanvas.addEventListener(
    "keydown",
    (event) => {

        let changed = false;


        switch (event.key) {

            case "ArrowLeft":

                currentT =
                    Math.max(
                        0,
                        currentT - 0.1
                    );

                changed = true;

                break;


            case "ArrowRight":

                currentT =
                    Math.min(
                        totalTime,
                        currentT + 0.1
                    );

                changed = true;

                break;


            case "Home":

                currentT = 0;

                changed = true;

                break;


            case "End":

                currentT =
                    totalTime;

                changed = true;

                break;
        }


        if (changed) {

            event.preventDefault();

            playing = false;


            if (animationId !== null) {

                cancelAnimationFrame(
                    animationId
                );

                animationId = null;
            }


            drawAll();
        }
    }
);


/* =========================================================
   PREVENT CONTEXT MENU ON GRAPH
   ========================================================= */

posCanvas.addEventListener(
    "contextmenu",
    (event) => {

        event.preventDefault();
    }
);


/* =========================================================
   INITIALIZE SIMULATION
   ========================================================= */

/*
   Wait until the page layout has been calculated
   before determining canvas dimensions.
*/

window.requestAnimationFrame(
    () => {
        resizeCanvas();
    }
);
