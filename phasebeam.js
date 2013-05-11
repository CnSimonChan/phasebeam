"use strict";

var config = {
    circle: {
        amount: 20,
        rgba: [157, 97, 207, 0.3],
        rgba_delta: 5,
        shadow: [46, 30, 105, 0.9],
        shadow_delta: 3,
        blur: 0.2,
        speed: 0.3,
    },
    line: {
        amount: 20,
        rgba: [255, 255, 255, 0.5],
        rgba_delta: 5,
        shadow: [255, 255, 255, 0.8],
        shadow_delta: 3,
        blur: 0.1,
        speed: 0.5,
    },
    angle: 20
};

var background = document.getElementById("background"),
    foreground = document.getElementById("foreground");
function setSize() {
    background.width = foreground.width = innerWidth;
    background.height = foreground.height = innerHeight;
}

var items = {};
function createItems() {
    function delta_colors(colors, delta) {
        var results = [], result;
        var alpha = colors.splice(3, 1);
        colors.forEach(function (color) {
            result = color + Math.round((Math.random() - 0.5) * delta);
            if (result < 0)
                results.push(0);
            else if (result > 255)
                results.push(255);
            else
                results.push(result);
        });
        results.push(Math.random() * 0.5 + alpha * 0.5);
        return results;
    }

    function drawCircle(radius) {
        var result = document.createElement("canvas"),
            context = result.getContext("2d"),
            blur = Math.random() * radius * config.circle.blur,
            length = radius + blur;

        result.width = result.height = length * 2;

        context.beginPath();
        context.arc(length, length, radius, 0, Math.PI * 2, true);
        context.shadowBlur = blur;
        context.shadowColor = "rgba(" + delta_colors(config.circle.shadow, config.circle.shadow_delta * 2).join(",") + ")";

        var gradient = context.createRadialGradient(length, length, radius, length, length, 0),
            rgba = delta_colors(config.circle.rgba, config.circle.rgba_delta * 2);
        gradient.addColorStop(0, 'rgba(' + rgba.join(',') + ')');
        rgba[3] -= 0.1;
        gradient.addColorStop(1, 'rgba(' + rgba.join(',') + ')');
        context.fillStyle = gradient;
        context.fill();

        return result;
    }

    var circles = [], radius;
    for (var i = config.circle.amount; i--;) {
        radius = (Math.random() + 1) * (20 + i * 5);
        circles.push({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            radius: radius,
            graphic: drawCircle(radius),
            speed: config.circle.speed * (0.8 + i * 0.5),
            lastTime: new Date().getTime()
        });
    }
    items.circles = circles;

    var degree = config.angle / 180 * Math.PI,
        sina = Math.sin(degree),
        cosa = Math.cos(degree),
        sinaAbs = Math.abs(sina),
        cosaAbs = Math.abs(cosa);
    function drawLine(width) {
        var result = document.createElement("canvas"),
            context = result.getContext("2d"),
            blur = Math.random() * width * config.line.blur,
            sx = blur + 1.5,
            sy = width + blur;

        result.width = width * sinaAbs + blur * 4;
        result.height = width * cosaAbs + blur * 4;

        context.translate(sx, sy + blur);
        context.rotate(degree);
        context.translate(-sx, -(sy + blur));

        context.beginPath();
        context.moveTo(sx, sy);
        context.lineTo(sx, blur);
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.shadowBlur = blur;
        context.shadowColor = "rgba(" + delta_colors(config.line.shadow, config.line.shadow_delta * 2).join(",") + ")";
        var gradient = context.createLinearGradient(sx, sy, sx, blur),
            rgba = delta_colors(config.line.rgba, config.line.rgba_delta * 2);
        gradient.addColorStop(0, 'rgba(' + rgba.join(',') + ')');
        rgba[3] -= 0.1;
        gradient.addColorStop(1, 'rgba(' + rgba.join(',') + ')');
        context.strokeStyle = gradient;
        context.stroke();

        return result;
    }

    var lines = [], width;
    for (i = config.line.amount; i--;) {
        width = Math.random() * (20 + i * 5) + (20 + i * 5);
        lines.push({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            width: width,
            graphic: drawLine(width),
            speed: config.line.speed * (0.8 + i * 0.5),
            lastTime: new Date().getTime()
        });
    }
    items.lines = lines;
}

function drawBackground() {
    var backgroundContext = background.getContext("2d"),
        gradient;

    backgroundContext.clearRect(0, 0, innerWidth, innerHeight);

    backgroundContext.fillStyle = "#000";
    backgroundContext.fillRect(0, 0, innerWidth, innerHeight);

    gradient = backgroundContext.createRadialGradient(innerWidth * 0.3, innerHeight * 0.1, 0,
        innerWidth * 0.3, innerHeight * 0.1, innerWidth * 0.9);
    gradient.addColorStop(0, 'rgb(0, 26, 77)');
    gradient.addColorStop(1, 'transparent');
    backgroundContext.translate(innerWidth, 0);
    backgroundContext.scale(-1, 1);
    backgroundContext.fillStyle = gradient;
    backgroundContext.fillRect(0, 0, innerWidth, innerHeight);

    gradient = backgroundContext.createRadialGradient(innerWidth * 0.1, innerHeight * 0.1, 0,
        innerWidth * 0.3, innerHeight * 0.1, innerWidth);
    gradient.addColorStop(0, 'rgb(0, 150, 240)');
    gradient.addColorStop(0.8, 'transparent');
    backgroundContext.translate(innerWidth, 0);
    backgroundContext.scale(-1, 1);
    backgroundContext.fillStyle = gradient;
    backgroundContext.fillRect(0, 0, innerWidth, innerHeight);

    gradient = backgroundContext.createRadialGradient(innerWidth * 0.1, innerHeight * 0.5, 0,
        innerWidth * 0.1, innerHeight * 0.5, innerWidth * 0.5);
    gradient.addColorStop(0, 'rgb(40, 20, 105)');
    gradient.addColorStop(1, 'transparent');
    backgroundContext.fillStyle = gradient;
    backgroundContext.fillRect(0, 0, innerWidth, innerHeight);
}

var degree = config.angle / 180 * Math.PI,
    sina = Math.sin(degree),
    cosa = Math.cos(degree),
    sinaAbs = Math.abs(sina),
    cosaAbs = Math.abs(cosa),
    foregroundContext = foreground.getContext("2d");

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame;

function drawFrame() {
    foregroundContext.clearRect(0, 0, innerWidth, innerHeight);

    var x, y, radius, speed, time, rgba, gradient;
    items.circles.forEach(function (item, index) {
        time = new Date().getTime();
        x = item.x;
        y = item.y;
        radius = item.radius;
        speed = item.speed * (time - item.lastTime) / 100;
        if (x > innerWidth)
            x = -radius * 2;
        else if (x < -radius * 2)
            x = innerWidth;
        else
            x += sina * speed;

        if (y > innerHeight)
            y = -radius * 2;
        else if (y < -radius * 2)
            y = innerHeight;
        else
            y -= cosa * speed;

        item.x = x;
        item.y = y;
        item.lastTime = time;

        foregroundContext.drawImage(item.graphic, x, y);
    });

    var width, endX, endY;
    items.lines.forEach(function (item, index) {
        time = new Date().getTime();
        x = item.x;
        y = item.y;
        width = item.width;
        speed = item.speed * (time - item.lastTime) / 100;
        if (x > innerWidth + width * 1.2 * sina)
            x = -width * 1.2 * sina;
        else if (x < -width * 1.2 * sina)
            x = innerWidth + width * sina;
        else
            x += sina * speed;

        if (y > innerHeight + width * 1.2 * cosa)
            y = -width * 1.2 * cosa;
        else if (y < -width * 1.2 * cosa)
            y = innerHeight + width * 1.2 * cosa;
        else
            y -= cosa * speed;

        item.x = x;
        item.y = y;
        item.lastTime = time;

        foregroundContext.drawImage(item.graphic, x, y);
    });

    requestAnimationFrame(drawFrame);
}

setSize();
createItems();
drawBackground();
drawFrame();

var resizeTimeoutId;
window.addEventListener("resize", function () {
    setSize();
    drawBackground();
    foregroundContext.clearRect(0, 0, innerWidth, innerHeight);

    if (resizeTimeoutId)
        clearTimeout(resizeTimeoutId);
    resizeTimeoutId = setTimeout(function () {
        createItems();
        resizeTimeoutId = 0;
    }, 500);
});
