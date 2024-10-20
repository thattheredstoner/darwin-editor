const previewCanvas = $('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const previewWidth = previewCanvas.width;
const previewHeight = previewCanvas.height;

previewCtx.imageSmoothingEnabled = false;

let images = {
    arms: {
        huge: [23, 8],
        large: [17, 4],
        normal: [9, 3],
        tiny: [4, 2],
    },
    body: {
        huge: [27, 19],
        large: [20, 15],
        normal: [11, 9],
        tiny: [6, 5],
    },
    exoskeleton: {
        huge: [38, 19],
        large: [28, 15],
        normal: [16, 9],
        tiny: [10, 7],
    },
    eyes: {
        huge: [17, 19],
        large: [12, 15],
        normal: [8, 9],
        tiny: [5, 7],
    },
    mouth: {
        huge: [11, 19],
        large: [8, 15],
        normal: [5, 9],
        tiny: [4, 7],
    },
}

let sizes = ["tiny", "normal", "large", "huge"];
let parts = ["arms", "body", "exoskeleton", "eyes", "mouth"];

async function drawBibite() {
    previewCtx.clearRect(0, 0, previewWidth, previewHeight);

    for (let i = 0; i < parts.length; i++) {
        let size = sizes[1];
        let x = previewWidth/4;
        let y = previewHeight/2;
        let sprite = await generateSprite(`./assets/body/${size}_${parts[i]}.png`, images[parts[i]][size][0], images[parts[i]][size][1], 0, 0);
        if (parts[i] === "mouth") {
            x = previewWidth/4 + images["body"][size][0];
        } else if (parts[i] === "arms") {
            y = previewHeight/2 - images["body"][size][1] + 1;
            previewCtx.save();
            previewCtx.translate(0, previewHeight - 1);
            previewCtx.scale(1, -1);
            previewCtx.drawImage(sprite, x, y, images[parts[i]][size][0], images[parts[i]][size][1]);
            previewCtx.restore();
            previewCtx.drawImage(sprite, x, y, images[parts[i]][size][0], images[parts[i]][size][1]);
            previewCtx.restore();
            continue
        } else if (parts[i] === "eyes") {
            x = previewWidth/4 + images["body"][size][0] - images["eyes"][size][0];
        } else if (parts[i] === "exoskeleton") {
            y = previewHeight/2 - images["body"][size][1] + 1;
        }
        previewCtx.drawImage(sprite, x, y - (images[parts[i]][size][1]/2), images[parts[i]][size][0], images[parts[i]][size][1]);
    }

    // Draw pellet
    let x = previewWidth * 3/4;
    
    let plantSprite = await loadImage(`./assets/misc/medium_plant.png`);
    previewCtx.drawImage(plantSprite, x, previewHeight/2 - plantSprite.height * 2, 10, 10);

    // Draw meat
    let meatSprite = await loadImage(`./assets/misc/medium_meat.png`);
    previewCtx.drawImage(meatSprite, x, previewHeight/2 + meatSprite.height, 10, 10);
}