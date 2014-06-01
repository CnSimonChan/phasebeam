"use strict";

(function () {
    var requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkieRequestAnimationFrame ||
        window.msRequestAnimationFrame;
    if (!requestAnimationFrame) {
        alert("Your browser doesn't support requestAnimationFrame().");
        return;
    }

    var config = {
        circle: {
            amount: 20,
            rgba: [157, 97, 207, 0.3],
            rgbaDelta: 5,
            shadow: [46, 30, 105, 0.9],
            shadowDelta: 3,
            blur: 0.2,
            speed: 0.3,
        },
        line: {
            amount: 20,
            rgba: [255, 255, 255, 0.5],
            rgbaDelta: 5,
            shadow: [255, 255, 255, 0.8],
            shadowDelta: 3,
            blur: 0.1,
            speed: 0.5,
        },
        angle: 20
    };

    var background = document.getElementById("background"),
        foreground = document.getElementById("foreground"),
        foregroundContext = foreground.getContext("2d");

    var degree = config.angle / 180 * Math.PI,
        sina = Math.sin(degree),
        cosa = Math.cos(degree);

    var foregroundWidth, foregroundHeight;

    function setSize() {
        background.width = innerWidth;
        background.height = innerHeight;

        foregroundWidth = innerWidth * cosa + innerHeight * sina;
        foreground.style.left = '-' + (foregroundWidth - innerWidth) / 2 + 'px';
        foreground.width = foregroundWidth;

        foregroundHeight = innerWidth * sina + innerHeight * cosa;
        foreground.style.top = '-' + (foregroundHeight - innerHeight) / 2 + 'px';
        foreground.height = foregroundHeight;

        foregroundContext.translate(foregroundWidth / 2, foregroundHeight / 2);
        foregroundContext.rotate(degree);
        foregroundContext.translate(-foregroundWidth / 2, -foregroundHeight / 2);
    }

    var items = {};
    function createItems() {
        function randomizeRgba(colors, delta) {
            var rgba = [], value;
            var alpha = colors.splice(3, 1);
            colors.forEach(function (color) {
                value = color + Math.round((Math.random() - 0.5) * delta);
                if (value < 0)
                    rgba.push(0);
                else if (value > 255)
                    rgba.push(255);
                else
                    rgba.push(value);
            });
            rgba.push(Math.random() * 0.5 + alpha * 0.5);
            return rgba;
        }

        function toCssColor(rgba) {
            return 'rgba(' + rgba.join(',') + ')';
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
            context.shadowColor = toCssColor(randomizeRgba(config.circle.shadow, config.circle.shadowDelta * 2));

            var gradient = context.createRadialGradient(length, length, radius, length, length, 0),
                rgba = randomizeRgba(config.circle.rgba, config.circle.rgbaDelta * 2);
            gradient.addColorStop(0, toCssColor(rgba));
            rgba[3] -= 0.1;
            gradient.addColorStop(1, toCssColor(rgba));
            context.fillStyle = gradient;
            context.fill();

            return result;
        }

        var circles = [], radius;
        for (var i = config.circle.amount; i--;) {
            radius = (Math.random() + 1) * (20 + i * 3);
            circles.push({
                x: Math.random() * foregroundWidth,
                y: Math.random() * foregroundHeight,
                radius: radius,
                graphic: drawCircle(radius),
                speed: config.circle.speed * (0.8 + i * 0.5)
            });
        }
        items.circles = circles;

        function drawLine(length) {
            var result = document.createElement("canvas"),
                context = result.getContext("2d"),
                blur = Math.random() * length * config.line.blur,
                sx = blur + 1.5,
                sy = length + blur;

            result.height = length + blur * 2;
            result.width = 3 + blur * 2;

            context.beginPath();
            context.moveTo(sx, sy);
            context.lineTo(sx, blur);
            context.lineWidth = 3;
            context.lineCap = 'round';
            context.shadowBlur = blur;
            context.shadowColor = "rgba(" + randomizeRgba(config.line.shadow, config.line.shadowDelta * 2).join(",") + ")";
            var gradient = context.createLinearGradient(sx, sy, sx, blur),
                rgba = randomizeRgba(config.line.rgba, config.line.rgbaDelta * 2);
            gradient.addColorStop(0, 'rgba(' + rgba.join(',') + ')');
            rgba[3] -= 0.1;
            gradient.addColorStop(1, 'rgba(' + rgba.join(',') + ')');
            context.strokeStyle = gradient;
            context.stroke();

            return result;
        }

        var lines = [], length;
        for (i = config.line.amount; i--;) {
            length = Math.random() * (20 + i * 5) + (20 + i * 5);
            lines.push({
                x: Math.random() * foregroundWidth,
                y: Math.random() * foregroundHeight,
                length: length,
                graphic: drawLine(length),
                speed: config.line.speed * (0.8 + i * 0.5)
            });
        }
        items.lines = lines;
    }

    function drawBackground() {
        var backgroundContext = background.getContext("2d");

        backgroundContext.clearRect(0, 0, innerWidth, innerHeight);

        backgroundContext.fillStyle = "#000";
        backgroundContext.fillRect(0, 0, innerWidth, innerHeight);

        var gradient;

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

    var lastTime = new Date().getTime();
    function drawFrame() {
        foregroundContext.clearRect(0, 0, foregroundWidth, foregroundHeight);

        var time = new Date().getTime(),
            timeDelta = time - lastTime;

        var x, y, speed;

        var radius;
        items.circles.forEach(function (item, index) {
            x = item.x;
            y = item.y;
            radius = item.radius;
            speed = item.speed * timeDelta / 100;

            if (y < -radius * 2) {
                y = foregroundHeight;
                x = Math.random() * foregroundWidth;
            }
            else
                y -= speed;

            item.x = x;
            item.y = y;

            foregroundContext.drawImage(item.graphic, x, y);
        });

        var length;
        items.lines.forEach(function (item, index) {
            x = item.x;
            y = item.y;
            length = item.length;
            speed = item.speed * timeDelta / 100;

            if (y < -length) {
                y = foregroundHeight;
                x = Math.random() * foregroundWidth;
            }
            else
                y -= speed;

            item.x = x;
            item.y = y;

            foregroundContext.drawImage(item.graphic, x, y);
        });

        lastTime = time;
        requestAnimationFrame(drawFrame);
    }

    setSize();
    drawBackground();
    createItems();
    drawFrame();

    var resizeTimeoutId;
    window.addEventListener("resize", function () {
        if (resizeTimeoutId)
            clearTimeout(resizeTimeoutId);
        resizeTimeoutId = setTimeout(function () {
            setSize();
            drawBackground();
            createItems();
            resizeTimeoutId = 0;
        }, 300);
    });
})();