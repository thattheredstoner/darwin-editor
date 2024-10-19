/*
* Gives the reference to the element with the given id
* @param {string} id - The id of the element
* @returns {Element} The element with the given id
*/
function $(id) {
    return document.getElementById(id);
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
* @param {number} hiddenNode - The hidden node type
* @param {number} baseActivation - The weight of the node
*/
function generateHiddenNodeElement(hiddenNode = 47, baseActivation = 0) {
    const nodes = $('hiddenNodes');
    let node = document.createElement('div');
    node.classList.add('node');
    node.innerHTML = `
        <label>Hidden Node Type</label>
        <select name="type" id="options"></select>
        <label>Weight</label>
        <div class="slider-container">
          <input type="range" min="-10" max="10" step="0.00000000001" value="${baseActivation}" id="weightSlider" class="slider">
          <input type="number" id="weight" step="0.00000000001" value="${baseActivation}" class="slider-number">
        </div>
        <button id="removeNode" class="removeItem">Remove Node</button>
    `;
    for (hiddenMap in hiddenMapping) {
        let option = document.createElement('option');
        option.value = hiddenMapping[hiddenMap];
        option.innerText = hiddenMap;
        node.querySelector('#options').appendChild(option);
    }
    node.querySelector('#options').value = hiddenNode;
    node.querySelector('#weightSlider').addEventListener('input', function() {
        node.querySelector('#weight').value = this.value;
    });
    node.querySelector('#weight').addEventListener('input', function() {
        node.querySelector('#weightSlider').value = this.value;
    });
    node.querySelector('#removeNode').addEventListener('click', function() {
        node.remove();
        if (nodes.children.length === 0) {
            nodes.style.display = 'none';
        }
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
function generateSynapseElement(input = false, inputId = 0, output = false, outputId = 32, outPutWeight = 0, synapseEnabled = true) {
    let synapse = document.createElement('div');
    synapse.classList.add('synapse');
    synapse.innerHTML = `
        <label>Input</label>
        <div class="switch-container">
            <label class="switch-text">Input/Hidden</label>
            <label class="switch">
                <input id="input-switch" type="checkbox">
                <span class="switch-circle"></span>
            </label>
        </div>
        <select name="nodeIn" id="nodeIn"></select>
        <label>Output</label>
        <div class="switch-container">
            <label class="switch-text">Output/Hidden</label>
            <label class="switch">
                <input id="output-switch" type="checkbox">
                <span class="switch-circle"></span>
            </label>
        </div>
        <select name="nodeOut" id="nodeOut"></select>
        <label>Weight</label>
        <div class="slider-container">
          <input type="range" min="-10" max="10" step="0.00000000001" value="${outPutWeight}" id="weightSlider" class="slider">
          <input type="number" id="weight" step="0.00000000001" value="${outPutWeight}" class="slider-number">
        </div>
        <label>Enabled</label>
        <input type="checkbox" name="enabled" ${synapseEnabled ? 'checked' : ''}>
        <button id="removeSynapse" class="removeItem">Remove Synapse</button>
    `;
    synapse.querySelector("#input-switch").addEventListener('click', function(event) {
        synapse.querySelector("#nodeIn").innerHTML = '';
        let tempMapping = event.target.checked ? hiddenMapping : inputMapping;
        for (map in tempMapping) {
            let option = document.createElement('option');
            option.value = tempMapping[map];
            option.innerText = map;
            synapse.querySelector("#nodeIn").appendChild(option);
        }
    });
    synapse.querySelector("#output-switch").addEventListener('click', function(event) {
        synapse.querySelector("#nodeOut").innerHTML = '';
        let tempMapping = event.target.checked ? hiddenMapping : outputMapping;
        for (map in tempMapping) {
            let option = document.createElement('option');
            option.value = tempMapping[map][0];
            option.innerText = map;
            synapse.querySelector("#nodeOut").appendChild(option);
        }
    });
    for (inputMap in inputMapping) {
        let option = document.createElement('option');
        option.value = inputMapping[inputMap];
        option.innerText = inputMap;
        synapse.querySelector("#nodeIn").appendChild(option);
    }
    for (outputMap in outputMapping) {
        let option = document.createElement('option');
        option.value = outputMapping[outputMap][0];
        option.innerText = outputMap;
        synapse.querySelector("#nodeOut").appendChild(option);
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

async function generateSprite(spritesheet_url, sprite_width, sprite_height, x, y) {
    let spritesheet = await loadImage(spritesheet_url);
    return await createImageBitmap(spritesheet, x * sprite_width, y * sprite_height, sprite_width, sprite_height);
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