const previewCanvas = $('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const previewWidth = previewCanvas.width;
const previewHeight = previewCanvas.height;

previewCtx.imageSmoothingEnabled = false;

let sizes = {
    "tiny": 5,
    "normal": 9,
    "large": 15,
    "huge": 19
}

let partsInfo = {
    "tiny_mouth": [4, 7],
    "normal_mouth": [5, 9],
    "large_mouth": [8, 15],
    "huge_mouth": [11, 19],
    "tiny_body": [6, 5],
    "normal_body": [11, 9],
    "large_body": [20, 15],
    "huge_body": [27, 19],
    "tiny_eyes": [5, 7],
    "normal_eyes": [8, 9],
    "large_eyes": [12, 15],
    "huge_eyes": [17, 19],
    "tiny_arms": [5, 3],
    "normal_arms": [9, 3],
    "large_arms": [17, 4],
    "huge_arms": [23, 8],
    "tiny_exoskeleton": [10, 7],
    "normal_exoskeleton": [16, 9],
    "large_exoskeleton": [28, 15],
    "huge_exoskeleton": [38, 19]
}

let allParts = {
    "mouth": {},
    "body": {},
    "arms": {},
    "eyes": {},
    "exoskeleton": {}
}

async function createSprites() {
    for (let part in allParts) {
        let parts = [];
        let sizeList = Object.keys(sizes);
        for (let size in sizeList) {
            let partName = sizeList[size] + "_" + part;
            let partWidth = partsInfo[partName][0];
            let partHeight = partsInfo[partName][1];

            let image = await loadImage(`./assets/body/${partName}.png`);
            let col = [];
            for (let x = 0; x < image.width; x += partWidth) {
                let row = [];
                for (let y = 0; y < image.height; y += partHeight) {
                    let spriteCanvas = document.createElement("canvas");
                    spriteCanvas.width = partWidth;
                    spriteCanvas.height = partHeight;
                    let spriteCtx = spriteCanvas.getContext("2d");
                    spriteCtx.drawImage(image, x, y, partWidth, partHeight, 0, 0, partWidth, partHeight);
                    row.push(spriteCanvas);
                }
                col.push(row);
            }
            parts.push(col);
        }
        allParts[part] = parts;
    }
}

function closestSizeIndex(size) {
    let num1 = 0;
    let num2 = Number.MAX_VALUE;
    for (let i = 0; i < Object.keys(sizes).length; i++) {
        let num3 = Math.abs((size - sizes[Object.keys(sizes)[i]]) / sizes["tiny"]);
        if (num3 < num2) {
            num1 = i;
            num2 = num3;
        }
    }
    return num1;
}

function findRepartitionIndex(v, min, max, n) {
    return Math.max(Math.min(Math.floor(n * (v - min) / (max - min)), n - 1), 0);
}

async function drawBibite() {
    if (Object.keys(allParts["body"]).length === 0) await createSprites();
    let genes = [];
    let geneElements = $("genes").children;
    for (let i = 0; i < geneElements.length; i++) {
        let gene = geneElements[i].querySelector("input").value;
        genes.push(parseFloat(gene));
    }

    let totalOrganWAG = Math.max(0, genes[26]) + Math.max(0, genes[27]) + Math.max(0, genes[28]) + Math.max(0, genes[29]) + Math.max(0, genes[30]) + Math.max(0, genes[31]) + Math.max(0, genes[32]);
    let wombAreaPortion = Math.max(0, genes[27]) / totalOrganWAG;
    let growthAtBirth = Math.pow(genes[2] / genes[1], 2);
    let growthAtMature = Math.max(1, growthAtBirth / wombAreaPortion);
    /*let size = genes[3] * Math.sqrt(
        Math.max(1,
            Math.pow(genes[2] / genes[1], 2) /
            (Math.max(0, genes[27]) /
            (Math.max(0, genes[26]) + Math.max(0, genes[27]) + Math.max(0, genes[28]) + Math.max(0, genes[29]) + Math.max(0, genes[30]) + Math.max(0, genes[31]) + Math.max(0, genes[32]))
            )
        )
    );*/
    let size = genes[3] * Math.sqrt(growthAtMature);
    console.log(size);

    let sizeIndex = closestSizeIndex(size);
    console.log(sizeIndex);

    /*
        this.Bibite.transform.localScale = Vector3.one * Mathf.Clamp(this.baseScale * Mathf.Sqrt(this.size), 0.05f, this.maxScale);
        this.FoodPreviewHolder.transform.localScale = Vector3.one / Mathf.Sqrt(this.size);

        Color color = BibiteGenes.GenesToColor(this.r, this.g, this.b);
        this.BibiteMaterial.SetColor(BibiteTemplateGenePreviewer.Color1, color);
        this.EyeMaterial.SetColor(BibiteTemplateGenePreviewer.Color1, color);

        Material eyeMaterial = this.EyeMaterial;
        int hueShift = BibiteTemplateGenePreviewer.HueShift;
        double num2 = (double) template.genes[25]
        eyeMaterial.SetFloat(hueShift, (float) num2);

        this.Bibite.transform.rotation = Quaternion.Euler(0.0f, 0.0f, (float) (-90.0 - 2.0 * ((double) this.carn - 0.5) * 57.295780181884766 * (double) Mathf.Atan((float) (40.0 / (112.0 * (double) Mathf.Sqrt(this.size))))));
*/
    
    let color = geneToColor(genes[5], genes[6], genes[7]);
    console.log(color);

    let num3 = Math.max(0, genes[26]) + Math.max(0, genes[27]) + Math.max(0, genes[28]) + Math.max(0, genes[29]) + Math.max(0, genes[30]) + Math.max(0, genes[31]) + Math.max(0, genes[32]);
    let carn = genes[16];
    let herb = 1 - carn;
    let f = genes[31] / num3;
    let mouthSprite = allParts["mouth"][sizeIndex][findRepartitionIndex(carn, 0, 1, allParts["mouth"][sizeIndex].length)][findRepartitionIndex(Math.sqrt(f), 0, 0.6, allParts["mouth"][sizeIndex][0].length)];
    let mouthWidth = partsInfo[`${Object.keys(sizes)[sizeIndex]}_mouth`][0];
    let mouthHeight = partsInfo[`${Object.keys(sizes)[sizeIndex]}_mouth`][1];

    let defenceProportion = genes[29] / num3;
    let exoskeletonSprite = allParts["exoskeleton"][sizeIndex][findRepartitionIndex(defenceProportion, 0, 0.3, allParts["exoskeleton"][sizeIndex].length)][0];
    let exoskeletonWidth = partsInfo[`${Object.keys(sizes)[sizeIndex]}_exoskeleton`][0];
    let exoskeletonHeight = partsInfo[`${Object.keys(sizes)[sizeIndex]}_exoskeleton`][1];

    let radiusGene = genes[13];
    let angleGene = genes[12];
    let eyesSprite = allParts["eyes"][sizeIndex][findRepartitionIndex(angleGene, 0, 360, allParts["eyes"][sizeIndex].length)][findRepartitionIndex(radiusGene, 0, 200, allParts["eyes"][sizeIndex][0].length)];
    let eyesWidth = partsInfo[`${Object.keys(sizes)[sizeIndex]}_eyes`][0];
    let eyesHeight = partsInfo[`${Object.keys(sizes)[sizeIndex]}_eyes`][1];

    let speedGene = genes[4];
    let armsSprite = allParts["arms"][sizeIndex][findRepartitionIndex(speedGene, 0.000006, 2.5, allParts["arms"][sizeIndex].length)][0];

    let bodySprite = changeColour(allParts["body"][sizeIndex][0][2], color[0], color[1], color[2]);
    let bodyWidth = partsInfo[`${Object.keys(sizes)[sizeIndex]}_body`][0];
    let bodyHeight = partsInfo[`${Object.keys(sizes)[sizeIndex]}_body`][1];

    let bibiteWidth = Math.max(mouthWidth, bodyWidth, eyesWidth, exoskeletonWidth);
    let bibiteHeight = mouthHeight + bodyHeight + eyesHeight + exoskeletonHeight;

    previewCtx.clearRect(0, 0, previewWidth, previewHeight);

    let bibiteX = previewWidth/2;
    let bibiteY = previewHeight/2;
    
    let angle = (-90 - (2 * ((carn - 0.5) * 57.295780181884766 * (Math.atan(40 / (112 * Math.sqrt(size))) * (180 / Math.PI)))));

    // Draw bibite on another canvas
    let canvas = document.createElement("canvas");
    canvas.width = previewCanvas.width;
    canvas.height =  previewCanvas.height;
    let ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(bodySprite, bibiteX - bodyWidth, bibiteY, bodyWidth * 4, bodyHeight * 4);
    ctx.drawImage(mouthSprite, bibiteX + bodyWidth/2 - mouthWidth/2 - 1, bibiteY - 1, mouthWidth, mouthHeight);
    ctx.drawImage(eyesSprite, bibiteX + bodyWidth/2 - eyesWidth/2 - 1, bibiteY - 1, eyesWidth, eyesHeight);
    ctx.drawImage(exoskeletonSprite, bibiteX, bibiteY, exoskeletonWidth, exoskeletonHeight);
    ctx.drawImage(armsSprite, bibiteX + bodyWidth/2 - armsSprite.width/2, bibiteY - 20, armsSprite.width, armsSprite.height);

    ctx.save();
    ctx.translate(bibiteX + bodyWidth/2, bibiteY + bodyHeight);
    ctx.scale(-1, 1);
    ctx.drawImage(armsSprite, -armsSprite.width/2, 0, armsSprite.width, armsSprite.height);
    ctx.restore();
    
    previewCtx.save();
    previewCtx.translate(bibiteX, bibiteY);
    //previewCtx.rotate(angle * Math.PI / 180);
    previewCtx.drawImage(canvas, -bibiteWidth * 2, -bibiteHeight * 2, bibiteWidth, bibiteHeight);
    previewCtx.translate(-bibiteX, -bibiteY);

    /*previewCtx.drawImage(bodySprite, bibiteX - bodyWidth, bibiteY, bodyWidth * 4, bodyHeight * 4);
    previewCtx.drawImage(mouthSprite, bibiteX + bodyWidth/2 - mouthWidth/2 - 1, bibiteY - 1, mouthWidth * 4, mouthHeight * 4);
    previewCtx.drawImage(eyesSprite, bibiteX + bodyWidth/2 - eyesWidth/2 - 1, bibiteY - 1, eyesWidth * 4, eyesHeight * 4);
    previewCtx.drawImage(exoskeletonSprite, bibiteX, bibiteY, exoskeletonWidth * 4, exoskeletonHeight * 4);
    previewCtx.drawImage(armsSprite, bibiteX + bodyWidth/2 - armsSprite.width/2, bibiteY - 20, armsSprite.width * 4, armsSprite.height * 4);

    previewCtx.translate(bibiteX + bodyWidth/2, bibiteY + bodyHeight); 
    previewCtx.scale(-1, 1);
    previewCtx.drawImage(armsSprite, -armsSprite.width/2, 0, armsSprite.width * 4, armsSprite.height * 4);
    previewCtx.restore();*/

    //previewCtx.drawImage(canvas, bibiteX - bibiteWidth * 2, bibiteY - bibiteHeight * 2, bibiteWidth, bibiteHeight);


    // Draw pellet
    let x = previewWidth * 3/4 - 5;
    
    previewCtx.globalAlpha = herb * herb * 4;
    let plantSprite = await loadImage(`./assets/misc/medium_plant.png`);
    previewCtx.drawImage(plantSprite, x, previewHeight/2 - 25 - 20, 40, 40);
    previewCtx.globalAlpha = 1;

    // Draw meat
    previewCtx.globalAlpha = carn * carn * 4;
    let meatSprite = await loadImage(`./assets/misc/medium_meat.png`);
    previewCtx.drawImage(meatSprite, x, previewHeight/2 + 25 - 20, 40, 40);
    previewCtx.globalAlpha = 1;
}

// Hide and show pip window when scrolling
document.onscroll = () => {
    let triggerOffset = $("genes").offsetTop - window.innerHeight + 100;
    if (window.scrollY >= triggerOffset && window.scrollY <= $("genes").offsetTop + $("genes").offsetHeight) {
        let leftOffset = 0;
        if ($("genePipContainer").offsetLeft <= window.innerWidth/2) {
            leftOffset = "25px";
        } else if ($("genePipContainer").offsetLeft >= window.innerWidth/2) {
            leftOffset = window.innerWidth - $("genePipContainer").offsetWidth - 25 + "px";
        }
        if (leftOffset !== $("genePipContainer").style.left) {
            $("genePipContainer").style.transition = "left 0.3s; opacity 0.4s";
            $("genePipContainer").style.left = leftOffset;
            setTimeout(() => {
                $("genePipContainer").style.transition = "opacity 0.4s";
            }, 300);
        }
    } else if (window.scrollY < triggerOffset || window.scrollY > $("genes").offsetTop + $("genes").offsetHeight) {
        let leftOffset = 0;
        if ($("genePipContainer").offsetLeft <= window.innerWidth/2) {
            leftOffset = $("genePipContainer").offsetWidth * -1.25 + "px";
        } else if ($("genePipContainer").offsetLeft >= window.innerWidth/2) {
            leftOffset = window.innerWidth + $("genePipContainer").offsetWidth * 0.25 + "px";
        }
        if (leftOffset !== $("genePipContainer").style.left) {
            $("genePipContainer").style.transition = "left 0.3s; opacity 0.4s";
            $("genePipContainer").style.left = leftOffset;
            setTimeout(() => {
                $("genePipContainer").style.transition = "opacity 0.4s";
            }, 300);
        }
    }
}

// Move pip window when dragged
let previewPipDragging = false;
let previewPipOffsetX = 0;
let previewPipOffsetY = 0;
let previewPipX = 0;
let previewPipY = 0;

$("genePipContainer").addEventListener('mousedown', (e) => {
    previewPipDragging = true;
    previewPipOffsetX = e.offsetX;
    previewPipOffsetY = e.offsetY;
});

$("genePipContainer").addEventListener('mouseup', () => {
    previewPipDragging = false;
    
    let previewPipCenterX = previewPipX + $("genePipContainer").offsetWidth/2;
    if (previewPipCenterX <= window.innerWidth/2) {
        previewPipX = 25;
    } else if (previewPipCenterX > window.innerWidth/2) {
        previewPipX = window.innerWidth - $("genePipContainer").offsetWidth - 25;
    }

    let previewPipCenterY = previewPipY + $("genePipContainer").offsetHeight/2;
    if (previewPipCenterY <= window.innerHeight/2) {
        previewPipY = 25;
    } else if (previewPipCenterY > window.innerHeight/2) {
        previewPipY = window.innerHeight - $("genePipContainer").offsetHeight - 25;
    }

    if (previewPipCenterX > window.innerWidth/2 && previewPipCenterY > window.innerHeight/2) {
        previewPipY = window.innerHeight - $("genePipContainer").offsetHeight - 150
    }

    $("genePipContainer").style.transition = "left 0.3s, top 0.3s, opacity 0.4s";
    $("genePipContainer").style.left = `${previewPipX}px`;
    $("genePipContainer").style.top = `${previewPipY}px`;
    setTimeout(() => {
        $("genePipContainer").style.transition = "opacity 0.4s";
    }, 300);
});

document.addEventListener('mousemove', (e) => {
    if (previewPipDragging) {
        previewPipX = e.clientX - previewPipOffsetX;
        previewPipY = e.clientY - previewPipOffsetY;

        $("genePipContainer").style.left = `${previewPipX}px`;
        $("genePipContainer").style.top = `${previewPipY}px`;
    }
});