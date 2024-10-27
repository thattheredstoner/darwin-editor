const canvas = $('fullScreenCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const previewWidth = canvas.width;
const previewHeight = canvas.height;

ctx.imageSmoothingEnabled = false;

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

    let sizeIndex = 1//closestSizeIndex(size);
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
    */
    
    let tempColor = geneToColor(genes[5], genes[6], genes[7]);
    console.log(tempColor);

    let color = geneToBodyColor(tempColor[0], tempColor[1], tempColor[2]);
    console.log(color);

    let eyeColor = geneToEyeColor(tempColor, genes[25]);
    console.log(eyeColor);

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

    mouthSprite = changeColour(mouthSprite, color[0], color[1], color[2]);
    exoskeletonSprite = changeColour(exoskeletonSprite, color[0], color[1], color[2]);
    eyesSprite = changeColour(eyesSprite, eyeColor[0], eyeColor[1], eyeColor[2]);
    armsSprite = changeColour(armsSprite, color[0], color[1], color[2]);
    bodySprite = changeColour(bodySprite, color[0], color[1], color[2]);

    let bibiteWidth = mouthHeight + bodyHeight + eyesHeight + exoskeletonHeight;
    let bibiteHeight = Math.max(mouthWidth, bodyWidth, eyesWidth, exoskeletonWidth);

    ctx.clearRect(0, 0, previewWidth, previewHeight);

    let bibiteX = Math.floor(previewWidth/2);
    let bibiteY = Math.floor(previewHeight/2);
    
    console.log(
        "previewWidth: " + previewWidth,
        "\npreviewHeight: " + previewHeight,
        "\nBibite X: " + bibiteX,
        "\nBibite Y: " + bibiteY,
        "\nBibite Width: " + bibiteWidth,
        "\nBibite Height: " + bibiteHeight,
        "\nBody Width: " + bodyWidth,
        "\nBody Height: " + bodyHeight,
        "\nMouth Width: " + mouthWidth,
        "\nMouth Height: " + mouthHeight,
        "\nEyes Width: " + eyesWidth,
        "\nEyes Height: " + eyesHeight,
        "\nExoskeleton Width: " + exoskeletonWidth,
        "\nExoskeleton Height: " + exoskeletonHeight,
        "\nArms Width: " + armsSprite.width,
        "\nArms Height: " + armsSprite.height
    )

    let offsetMouth = [0, 0];
    let offsetEyes = [0, 0];
    let offsetExoskeleton = [0, 0];
    let offsetArms = [0, 0];

    if (sizeIndex === 0) {
        offsetMouth = [0, -4];
        offsetEyes = [8, -4];
        offsetArms = [1, 4];
    } else if (sizeIndex === 1) {
        offsetMouth = [0, 0];
        offsetEyes = [4, 0];
        offsetExoskeleton = [0, 0];
        offsetArms = [-5, 0];
    } else if (sizeIndex === 2) {
        offsetMouth = [0, 0];
        offsetEyes = [4, 0];
        offsetExoskeleton = [0, 0];
        offsetArms = [-7, 0];
    }

    ctx.beginPath();
    ctx.moveTo(0, bibiteY);
    ctx.lineTo(previewWidth, bibiteY);
    ctx.moveTo(bibiteX, 0);
    ctx.lineTo(bibiteX, previewHeight);
    ctx.stroke();
    ctx.closePath();

    ctx.drawImage(bodySprite, bibiteX - bodyWidth * 4, bibiteY - bodyHeight * 2, bodyWidth * 4, bodyHeight * 4);
    ctx.drawImage(mouthSprite, bibiteX + offsetMouth[0], bibiteY - bodyHeight * 2 + offsetMouth[1], mouthWidth * 4, mouthHeight * 4);
    ctx.drawImage(eyesSprite, bibiteX - eyesWidth * 2 + offsetEyes[0], bibiteY - bodyHeight * 2 + offsetEyes[1], eyesWidth * 4, eyesHeight * 4);
    ctx.drawImage(exoskeletonSprite, bibiteX - exoskeletonWidth * 2 + offsetExoskeleton[0], bibiteY - bodyHeight * 2 + offsetExoskeleton[1], exoskeletonWidth * 4, exoskeletonHeight * 4);
    ctx.drawImage(armsSprite, bibiteX - armsSprite.width - bodyWidth * 2 + offsetArms[0], bibiteY - bodyHeight * 2 - armsSprite.height * 4 + offsetArms[1], armsSprite.width * 4, armsSprite.height * 4);

    ctx.save();
    ctx.translate(bibiteX, bibiteY);
    ctx.scale(1, -1);
    ctx.drawImage(armsSprite, - armsSprite.width - bodyWidth * 2 + offsetArms[0], - bodyHeight * 2 - armsSprite.height * 4 + offsetArms[1], armsSprite.width * 4, armsSprite.height * 4);
    ctx.restore();



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
}