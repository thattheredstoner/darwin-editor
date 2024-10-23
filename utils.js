/*
* Gives the reference to the element with the given id
* @param {string} id - The id of the element
* @returns {Element} The element with the given id
*/
function $(id) {
    return document.getElementById(id);
}

/*
* Shows a popup with the given message
* @param {string} title - The title of the message
* @param {string} text - The message to be displayed
*/
function msg(title, text) {
    $('message').style.display = 'flex';
    $('messageTitle').innerText = title;
    $('messageText').innerText = text;
}

/* 
* Closes the message popup
*/
function closeMessage() {
    $('message').style.display = 'none';
    $('messageText').innerText = '';
}

/*
* Parse the given file and fill the editor with the data
* @param {File} file - The file to be parsed
*/
function fileUpload(file, fileInput = null) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        const bibite = JSON.parse(reader.result);
        if (bibite.version !== "0.6" && bibite.version !== "0.6.0.1") {
            msg('Error', 'The file you are trying to upload is not compatible with this version of the editor.');
            if (fileInput !== null) {
                fileInput.value = '';
            }
            return;
        }
        document.getElementById('name').value = bibite.name;
        document.getElementById('speciesName').value = bibite.speciesName;
        document.getElementById('description').value = bibite.description.replace(/\u000b/g, '\r\n');
        changeHeight(document.getElementById('description'));
        document.getElementById('version').value = bibite.version;

        let nodes = document.getElementById('nodes');
        nodes.querySelector('#outputNodes').innerHTML = '';
        nodes.querySelector('#hiddenNodes').innerHTML = '';

        let bibiteNodes = bibite.nodes.filter(node => !Object.values(inputMapping).includes(node.Index));
        let outputNodes = bibiteNodes.filter(node => Object.values(outputMapping).map(x => x[0]).includes(node.Index));

        for (let i = 0; i < outputNodes.length; i++) {
            generateOutputNodeElement(outputNodes[i].Index, Math.floor(outputNodes[i].baseActivation * 10000000000) / 10000000000);
        }

        let hiddenNodes = bibiteNodes.filter(node => !Object.values(outputMapping).map(x => x[0]).includes(node.Index));

        for (let i = 0; i < hiddenNodes.length; i++) {
            generateHiddenNodeElement(hiddenNodes[i].Index, hiddenNodes[i].Type, Math.floor(hiddenNodes[i].baseActivation * 10000000000) / 10000000000);
        }

        $('synapses').innerHTML = '';
        for (let i = 0; i < bibite.synapses.length; i++) {
            let input = hiddenNodes.find(node => node.Index === bibite.synapses[i].NodeIn) !== undefined;
            let output = hiddenNodes.find(node => node.Index === bibite.synapses[i].NodeOut) !== undefined;
            generateSynapseElement(bibite.synapses[i].NodeIn, bibite.synapses[i].NodeOut, Math.floor(bibite.synapses[i].Weight * 10000000000) / 10000000000, bibite.synapses[i].En, input, output);
        }

        let genes = document.getElementById('genes').children;
        for (let gene of genes) {
            let geneName = gene.querySelector('label').innerText;
            let tempVal = bibite.genes[geneName.replace(/\s/g, '')];
            let precision = 1 / parseFloat(gene.querySelector('.slider-container input[type="range"]').step);
            console.log(parseFloat(gene.querySelector('.slider-container input[type="range"]').step))
            tempVal = Math.floor(tempVal * precision) / precision;
            gene.querySelector('.slider-container input[type="number"]').value = tempVal;
            gene.querySelector('.slider-container input[type="range"]').value = tempVal;
        }
    };
}

/*
* Generate a new node element
* @param {number} outputNode - The output node id
* @param {number} weight - The weight of the node
*/
function generateOutputNodeElement(outputNode = 32, weight = 0) {
    let node = document.createElement('div');
    node.classList.add('node');
    node.innerHTML = `
        <label>${Object.keys(outputMapping).find(key => outputMapping[key][0] === outputNode)}</label>
        <div class="slider-container">
          <input type="range" min="-10" max="10" step="0.00000000001" value="${weight}" id="baseActivationSlider" class="slider">
          <input type="number" id="baseActivation" step="0.00000000001" value="${weight}" class="slider-number">
        </div>
    `;
    node.querySelector('#baseActivationSlider').addEventListener('input', function() {
        node.querySelector('#baseActivation').value = this.value;
    });
    node.querySelector('#baseActivation').addEventListener('input', function() {
        node.querySelector('#baseActivationSlider').value = this.value;
    });
    $("outputNodes").appendChild(node);
}

/*
* Generate a new hidden node element
* @param {number} id - The hidden node id
* @param {number} hiddenNode - The hidden node type
* @param {number} baseActivation - The weight of the node
*/
function generateHiddenNodeElement(id = 47, hiddenNode = 1, baseActivation = 0) {
    let tempHiddenNodes = $("hiddenNodes").querySelectorAll('.node');
    for (let i = 0; i < tempHiddenNodes.length; i++) {
        if (tempHiddenNodes[i].querySelector('#nodeIndex').innerText === id.toString()) id++;
    }
    hiddenNodes.push([id, "Hidden" + (id - 47),]);
    updateSynapseOptions();
    const nodes = $('hiddenNodes');
    let node = document.createElement('div');
    node.classList.add('node');
    node.innerHTML = `
        <label>Hidden Node Function</label>
        <label style"display: inline-block">Index: <span id="nodeIndex">${id}</span></label>
        <select name="type" id="options"></select>
        <label>Hidden Node Name</label>
        <div class="slider-container">
            <input type="text" style="text-align: center;" id="description" value="Hidden${id - 47}">
        </div>
        <label>Base Activation</label>
        <div class="slider-container">
            <input type="range" min="-1" max="1" step="0.00000000001" value="${baseActivation}" id="baseActivationSlider" class="slider">
            <input type="number" id="baseActivation" step="0.00000000001" value="${baseActivation}" class="slider-number">
        </div>
        <button id="removeNode" class="removeItem">Delete Hidden Node</button>
    `;
    for (functionMap in functionMapping) {
        let option = document.createElement('option');
        option.value = functionMapping[functionMap];
        option.innerText = functionMap;
        node.querySelector('#options').appendChild(option);
    }
    node.querySelector('#options').value = hiddenNode;
    node.querySelector('#description').addEventListener('input', function() {
        this.value = this.value.replace(/\s/g, '');
        hiddenNodes.find(node => node[0] === id)[1] = this.value;
        updateSynapseOptions();
    });
    node.querySelector('#baseActivationSlider').addEventListener('input', function() {
        node.querySelector('#baseActivation').value = this.value;
    });
    node.querySelector('#baseActivation').addEventListener('input', function() {
        node.querySelector('#baseActivationSlider').value = this.value;
    });
    node.querySelector('#removeNode').addEventListener('click', function() {
        node.remove();
        if (nodes.children.length === 0) {
            nodes.style.display = 'none';
        }
        hiddenNodes = hiddenNodes.filter(node => node[0] !== id);
        updateSynapseOptions();
    });
    nodes.appendChild(node);

    if (nodes.style.display === 'none') {
        nodes.style.display = 'block';
    }
}

/*
* Generate a new synapse element
* @param {bool} input - Whether the input node is hidden
* @param {number} inputId - The input node id
* @param {bool} output - The output node name
* @param {number} outputId - Whether the output node is hidden
* @param {number} outPutWeight - The weight of the synapse
* @param {boolean} synapseEnabled - The state of the synapse
*/
function generateSynapseElement(inputId = 0, outputId = 32, outPutWeight = 0, synapseEnabled = true, input = false, output = false) {
    let synapse = document.createElement('div');
    synapse.classList.add('synapse');
    synapse.innerHTML = `
        <label>Input</label>
        <div class="switch-container">
            <label class="switch-text">Input/Hidden</label>
            <label class="switch">
                <input id="input-switch" type="checkbox" ${input ? 'checked' : ''}>
                <span class="switch-circle"></span>
            </label>
        </div>
        <select name="nodeIn" id="nodeIn"></select>
        <label>Output</label>
        <div class="switch-container">
            <label class="switch-text">Output/Hidden</label>
            <label class="switch">
                <input id="output-switch" type="checkbox" ${output ? 'checked' : ''}>
                <span class="switch-circle"></span>
            </label>
        </div>
        <select name="nodeOut" id="nodeOut"></select>
        <label>Weight</label>
        <div class="slider-container">
            <input type="range" min="-10" max="10" step="0.00000000001" value="${outPutWeight}" id="weightSlider" class="slider">
            <input type="number" id="weight" step="0.00000000001" value="${outPutWeight}" class="slider-number">
        </div>
        <div>
            <label>Enabled</label>&nbsp;&nbsp;
            <input type="checkbox" name="enabled" ${synapseEnabled ? 'checked' : ''}>
        </div>
        <button id="removeSynapse" class="removeItem">Remove Synapse</button>
    `;
    synapse.querySelector("#input-switch").addEventListener('click', function(event) {
        synapse.querySelector("#nodeIn").innerHTML = '';
        if (event.target.checked) {
            for (map in hiddenNodes) {
                let option = document.createElement('option');
                option.value = hiddenNodes[map][0];
                option.innerText = hiddenNodes[map][1];
                synapse.querySelector("#nodeIn").appendChild(option);
            }
        } else {
            for (map in inputMapping) {
                let option = document.createElement('option');
                option.value = inputMapping[map];
                option.innerText = map;
                synapse.querySelector("#nodeIn").appendChild(option);
            }
        }
    });
    synapse.querySelector("#output-switch").addEventListener('click', function(event) {
        synapse.querySelector("#nodeOut").innerHTML = '';
        if (event.target.checked) {
            for (map in hiddenNodes) {
                let option = document.createElement('option');
                option.value = hiddenNodes[map][0];
                option.innerText = hiddenNodes[map][1];
                synapse.querySelector("#nodeOut").appendChild(option);
            }
        } else {
            for (map in outputMapping) {
                let option = document.createElement('option');
                option.value = outputMapping[map][0];
                option.innerText = map;
                synapse.querySelector("#nodeOut").appendChild(option);
            }
        }
    });
    if (input) {
        for (map in hiddenNodes) {
            let option = document.createElement('option');
            option.value = hiddenNodes[map][0];
            option.innerText = hiddenNodes[map][1];
            synapse.querySelector("#nodeIn").appendChild(option);
        }
    } else {
        for (inputMap in inputMapping) {
            let option = document.createElement('option');
            option.value = inputMapping[inputMap];
            option.innerText = inputMap;
            synapse.querySelector("#nodeIn").appendChild(option);
        }
    }
    if (output) {
        for (map in hiddenNodes) {
            let option = document.createElement('option');
            option.value = hiddenNodes[map][0];
            option.innerText = hiddenNodes[map][1];
            synapse.querySelector("#nodeOut").appendChild(option);
        }
    } else {
        for (outputMap in outputMapping) {
            let option = document.createElement('option');
            option.value = outputMapping[outputMap][0];
            option.innerText = outputMap;
            synapse.querySelector("#nodeOut").appendChild(option);
        }
    }
    synapse.querySelector('#nodeIn').value = inputId;
    synapse.querySelector('#nodeOut').value = outputId;
    synapse.querySelector('#weightSlider').addEventListener('input', function() {
        synapse.querySelector('#weight').value = this.value;
    });
    synapse.querySelector('#weight').addEventListener('input', function() {
        synapse.querySelector('#weightSlider').value = this.value;
    });
    synapse.querySelector('#removeSynapse').addEventListener('click', function() {
        synapse.remove();
    });
    $("synapses").appendChild(synapse);
}

function generateGeneElement() {} // TODO

/*
* Update the options of the synapse elements based on the hidden nodes
*/
function updateSynapseOptions() {
    let synapses = document.getElementById('synapses').querySelectorAll('.synapse');
    for (let i = 0; i < synapses.length; i++) {
        let inputSwitch = synapses[i].querySelector('#input-switch');
        let outputSwitch = synapses[i].querySelector('#output-switch');
        let nodeIn = synapses[i].querySelector('#nodeIn');
        let nodeOut = synapses[i].querySelector('#nodeOut');
        if (inputSwitch.checked) {
            nodeIn.innerHTML = '';
            for (map in hiddenNodes) {
                let option = document.createElement('option');
                option.value = hiddenNodes[map][0];
                option.innerText = hiddenNodes[map][1];
                nodeIn.appendChild(option);
            }
        }

        if (outputSwitch.checked) {
            nodeOut.innerHTML = '';
            for (map in hiddenNodes) {
                let option = document.createElement('option');
                option.value = hiddenNodes[map][0];
                option.innerText = hiddenNodes[map][1];
                nodeOut.appendChild(option);
            }
        }
    }
}

async function generateSprite(spritesheet_url, sprite_width, sprite_height, x, y) {
    let spritesheet = await loadImage(spritesheet_url);
    let canvas = document.createElement('canvas');
    canvas.width = sprite_width;
    canvas.height = sprite_height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(spritesheet, x * sprite_width, y * sprite_height, sprite_width, sprite_height, 0, 0, sprite_width, sprite_height);
    return canvas;
}

async function loadImage(url) {
    var img = new Image();
    await new Promise((res, rej) => {
        img.onload = (e) => res(img);
        img.onerror = rej;
        img.src = url;
    } );
    return img;
}

function changeColour(image, r, g, b) {
    let ctx = image.getContext('2d');
    ctx.globalAlpha=0.62;
    ctx.globalCompositeOperation="source-atop";
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, image.width, image.height);
    return image;
}

function geneToColor(r, g, b) {
    const num1 = Math.min(r, g, b);
    
    const num2 = 1 + r - Math.max(g, b);
    const num4 = 1 + g - Math.max(r, b);
    const num6 = 1 + b - Math.max(r, g);
    
    const num3 = Math.max(0, Math.min(num2, 1));
    const num5 = Math.max(0, Math.min(num4, 1));
    const num7 = Math.max(0, Math.min(num6, 1));

    return [(num3 - num1) * 255, (num5 - num1) * 255, (num7 - num1) * 255];
}

function geneToEyeColor(bodyColor, offset) {
    let H;
    let bodyColorHSV = RGBToHSV(bodyColor);
    H = bodyColorHSV[0];
    return HSVToRGB(H - offset, 1, 1);
}

function RGBToHSV(color) {
    let r = color[0];
    let g = color[1];
    let b = color[2];
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, v];
}

function HSVToRGB(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [r, g, b];
}

/*
      this.template = bibiteTemplate;

      this.size = this.template.genes[3] * Mathf.Sqrt(BibiteGenes.GrowthAtMature(this.template.genes));
      this.sizeIndex = ProceduralSpriteManager.Instance.ClosestSizeIndex(this.size);

      this.BodyImage.sprite = ProceduralSpriteManager.Instance.RequestBodySprite(this.sizeIndex, 0);

      this.Bibite.transform.localScale = Vector3.one * Mathf.Clamp(this.baseScale * (this.sqrtSizing ? Mathf.Sqrt(this.size) : this.size), 0.05f, this.maxScale);
      this.FoodPreviewHolder.transform.localScale = Vector3.one / (this.sqrtSizing ? Mathf.Sqrt(this.size) : 1f);

      this.r = this.template.genes[5];
      this.g = this.template.genes[6];
      this.b = this.template.genes[7];

      Color color = BibiteGenes.GenesToColor(this.r, this.g, this.b);
      this.BibiteMaterial.SetColor(BibiteTemplateGenePreviewer.Color1, color);
      this.EyeMaterial.SetColor(BibiteTemplateGenePreviewer.Color1, color);

      Material eyeMaterial = this.EyeMaterial;
      int hueShift = BibiteTemplateGenePreviewer.HueShift;

      BibiteTemplate template = this.template;
      double num2 = template.genes[25];
      eyeMaterial.SetFloat(hueShift, (float) num2);
      float num3 = BibiteGenes.TotalOrganWAG(this.template.genes);
      this.carn = this.template.genes[16];
      this.herb = 1f - this.carn;
      float f = this.template.genes[31] / num3;
      this.MouthImage.sprite = ProceduralSpriteManager.Instance.RequestMouthSprite(this.sizeIndex, this.carn, Mathf.Sqrt(f));

      this.Bibite.transform.rotation = Quaternion.Euler(0.0f, 0.0f, (float) (-90.0 - 2.0 * ((double) this.carn - 0.5) * 57.295780181884766 * (double) Mathf.Atan((float) (40.0 / (112.0 * (double) Mathf.Sqrt(this.size))))));
      
      this.PlantImage.color = new Color(1f, 1f, 1f, 4f * this.herb * this.herb);
      this.PlantImage.rectTransform.localScale = Mathf.Sqrt(this.herb + 0.5f) * Vector3.one;
      this.MeatImage.color = new Color(1f, 1f, 1f, 4f * this.carn * this.carn);
      this.MeatImage.rectTransform.localScale = Mathf.Sqrt(this.carn + 0.5f) * Vector3.one;

      float defenceProportion = this.template.genes[29] / num3;
      this.ExoskeletonImage.sprite = ProceduralSpriteManager.Instance.RequestExoskeletonSprite(this.sizeIndex, 0, defenceProportion);
      float radiusGene = this.template.genes[13];
      float angleGene = this.template.genes[12];
      this.EyesImage.sprite = ProceduralSpriteManager.Instance.RequestEyeSprite(this.sizeIndex, radiusGene, angleGene);
      float speedGene = this.template.genes[4];
      this.Arm1Image.sprite = ProceduralSpriteManager.Instance.RequestArmSprite(this.sizeIndex, speedGene);
      this.Arm2Image.sprite = this.Arm1Image.sprite;*/