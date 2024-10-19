let inputMapping = {
    "Energy Ratio": 0,
    "Maturity": 1,
    "Life Ratio": 2,
    "Fullness": 3,
    "Speed": 4,
    "Is Grabbing": 5,
    "Attacked Damage": 6,
    "Egg Stored": 7,
    "Bibite Closeness": 8,
    "Bibite Angle": 9,
    "N Bibites": 10,
    "Plant Closeness": 11,
    "Plant Angle": 12,
    "N Plants": 13,
    "Meat Closeness": 14,
    "Meat Angle": 15,
    "N Meats": 16,
    "Red Bibite": 17,
    "Green Bibite": 18,
    "Blue Bibite": 19,
    "Tic": 20,
    "Minute": 21,
    "Time Alive": 22,
    "Phero Sense 1": 23,
    "Phero Sense 2": 24,
    "Phero Sense 3": 25,
    "Phero 1 Angle": 26,
    "Phero 2 Angle": 27,
    "Phero 3 Angle": 28,
    "Phero 1 Heading": 29,
    "Phero 2 Heading": 30,
    "Phero 3 Heading": 31
};

let outputMapping = {
    "Accelerate": [32, 0.5, 3], // Id, default value, function/type
    "Rotate": [33, 0, 3],
    "Herding": [34, 0, 3],
    "Egg Production": [35, 0.2, 3],
    "Want 2 Lay": [36, 0, 1],
    "Want 2 Eat": [37, 1, 3],
    "Digestion": [38, -2, 1],
    "Grab": [39, 0, 3],
    "Clk Reset": [40, 0, 1],
    "Phere Out 1": [41, 0, 5],
    "Phere Out 2": [42, 0, 5],
    "Phere Out 3": [43, 0, 5],
    "Want 2 Grow": [44, 0, 1],
    "Want 2 Heal": [45, 0, 1],
    "Want 2 Attack": [46, 0, 1]
};

let hiddenMapping = {
    "Hidden0": 47,
    "Hidden1": 48,
    "Hidden2": 49,
    "Hidden3": 50,
    "Hidden4": 51,
    "Hidden5": 52,
    "Hidden7": 53,
    "Hidden8": 54,
    "Hidden9": 55,
    "Hidden10": 56,
    "Hidden12": 57,
    "Hidden13": 58
};

let nodeType = {
    "Sigmoid": 1,
    "Linear": 2,
    "TanH": 3,
    "Sine": 4,
    "ReLu": 5,
    "Gaussian": 6,
    "Latch": 7,
    "Differential": 8,
    "Abs": 9,
    "Mult": 10,
    "Integrator": 11,
    "Inhibitory": 12
}

let bibiteDropZone = document.getElementById('bibiteDropZone');

bibiteDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

bibiteDropZone.addEventListener("dragenter", () => {
    bibiteDropZone.classList.add("dragover");
});

bibiteDropZone.addEventListener("dragleave", () => {
    bibiteDropZone.classList.remove("dragover");
});

bibiteDropZone.addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    document.getElementById('bibiteInput').files = dt.files;
    fileUpload(dt.files[0]);
})

document.getElementById('bibiteInput').addEventListener('change', () => {
    const files = document.getElementById('bibiteInput').files;
    fileUpload(files[0]);
}, false);

function fileUpload(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        const bibite = JSON.parse(reader.result);
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
            generateOutputNodeElement(outputNodes[i].Index, outputNodes[i].baseActivation);
        }

        let hiddenNodes = bibiteNodes.filter(node => !Object.values(outputMapping).map(x => x[0]).includes(node.Index));

        for (let i = 0; i < hiddenNodes.length; i++) {
            generateHiddenNodeElement(hiddenNodes[i].Index, hiddenNodes[i].baseActivation);
        }

        $('synapses').innerHTML = '';
        for (let i = 0; i < bibite.synapses.length; i++) {
            generateSynapseElement(false, bibite.synapses[i].NodeIn, false, bibite.synapses[i].NodeOut, bibite.synapses[i].Weight, bibite.synapses[i].En);
        }

        let genes = document.getElementById('genes').children;
        for (let gene of genes) {
            let geneName = gene.querySelector('label').innerText;
            gene.querySelector('.slider-container input[type="number"]').value = bibite.genes[geneName.replace(/\s/g, '')];
            gene.querySelector('.slider-container input[type="range"]').value = bibite.genes[geneName.replace(/\s/g, '')];
        }
    };
}

let outputNodes = document.querySelectorAll('#outputNodes')[0];
outputNodes.classList.add('separator-container');
for (let outputNode in outputMapping) {
    generateOutputNodeElement(outputMapping[outputNode][0], outputMapping[outputNode][1]);
}

let genes = document.querySelectorAll('#genes')[0].children;
for (let gene of genes) {
    gene.querySelector('.slider-container input[type="range"]').addEventListener('input', function() {
        gene.querySelector('.slider-container input[type="number"]').value = this.value;
    });
    gene.querySelector('.slider-container input[type="number"]').addEventListener('input', function() {
        let geneSlider = gene.querySelector('.slider-container input[type="range"]');
        if (this.value > geneSlider.max) {
            this.value = geneSlider.max;
        } else if (this.value < geneSlider.min) {
            this.value = geneSlider.min;
        }
        geneSlider.value = this.value;
    });
};

function generateBibite() {
    if (document.querySelector('#bibitesForm').checkValidity() === false) {
        console.log(document.querySelector('#bibitesForm').checkValidity());
        alert('Please fill all the fields');
        return;
    }
    
    const name = document.getElementById('name').value;
    const speciesName = document.getElementById('speciesName').value;
    const description = document.getElementById('description').value;
    const version = document.getElementById('version').value;
    const generation = document.getElementById('generation').value;

    const outputNodes = document.getElementById('outputNodes').querySelectorAll('.node');
    const hiddenNodes = document.getElementById('hiddenNodes').querySelectorAll('.node');
    const nodesArray = [];

    for (let i = 0; i < Object.keys(inputMapping).length; i++) {
        nodesArray.push({
            "Type": 0,
            "Index": inputMapping[Object.keys(inputMapping)[i]],
            "Inov": i + 1,
            "Desc": Object.keys(inputMapping).find(key => inputMapping[key] === i).replace(/\s/g, ''),
            "baseActivation": 0,
        });
    }

    let tempTotal = Object.keys(inputMapping).length;

    for (let i = 0; i < outputNodes.length; i++) {
        const baseActivation = outputNodes[i].querySelector('#baseActivation').value;
        nodesArray.push({
            "Type": outputMapping[outputNodes[i].querySelector('label').innerText][2],
            "Index": outputMapping[outputNodes[i].querySelector('label').innerText][0],
            "Inov": i + tempTotal + 1,
            "Desc": outputNodes[i].querySelector('label').innerText.replace(/\s/g, ''),
            "baseActivation": parseFloat(baseActivation),
        });
    }

    tempTotal += Object.keys(outputMapping).length;

    for (let i = 0; i < hiddenNodes.length; i++) {
        const type = hiddenNodes[i].querySelector('select[name="type"]').value;
        const baseActivation = hiddenNodes[i].querySelector('#weight').value;
        nodesArray.push({
            "Type": type,
            "Index": i + tempTotal,
            "Inov": 0,
            "Desc": Object.keys(hiddenMapping).find(key => hiddenMapping[key] === type).replace(/\s/g, ''),
            "baseActivation": parseFloat(baseActivation),
        });
    }

    const synapses = document.getElementById('synapses').querySelectorAll('.synapse');
    const synapsesArray = [];
    for (let i = 0; i < synapses.length; i++) {
        const nodeIn = synapses[i].querySelector('select#nodeIn').value;
        const nodeOut = synapses[i].querySelector('select#nodeOut').value;
        const weight = synapses[i].querySelector('input#weight').value;
        const enabled = synapses[i].querySelector('input[name="enabled"]').checked;
        synapsesArray.push({
            "Inov": 0,
            "NodeIn": nodeIn,
            "NodeOut": nodeOut,
            "Weight": weight,
            "En": enabled,
        });
    }

    const genes = document.querySelectorAll('#genes')[0].children;
    const genesArray = {};
    for (let gene of genes) {
        const geneName = gene.querySelector('label').innerText.replace(/\s/g, '');
        const value = gene.querySelector('.slider-container input[type="number"]').value;
        genesArray[geneName] = parseFloat(value);
    }

    let bibite = {
        "name": name,
        "speciesName": speciesName,
        "description": description,
        "generation": generation,
        "version": version,
        "nodes": nodesArray,
        "synapses": synapsesArray,
        "genes": genesArray,
    };

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bibite, null, '\t'));
    var tempDownloadAnchor = document.createElement('a');
    tempDownloadAnchor.setAttribute("href",     dataStr);
    tempDownloadAnchor.setAttribute("download", name + ".bb8template");
    document.body.appendChild(tempDownloadAnchor);
    tempDownloadAnchor.click();
    tempDownloadAnchor.remove();
}

function addNode(e) {
    e.preventDefault();
    generateHiddenNodeElement();
}

function addSynapse(e) {
    e.preventDefault();
    generateSynapseElement();
}

function changeHeight(e) {
    e.style.height = 'auto';
    e.style.height = e.scrollHeight - 20 + 'px';
}