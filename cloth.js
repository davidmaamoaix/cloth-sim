const unit = Math.min(window.innerWidth, window.innerHeight) / 12.5;
const CONFIG = {
    dampen: 0.9,
    nodeCount: 11,
    nodeDist: unit,
    nodeSize: 5
};

class Node {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nodes = [];

function drawNode(node) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, CONFIG.nodeSize, 0, 2 * Math.PI);
    ctx.fill();
}

function updateCanvas() {
    ctx.fillStyle = '#FFF';
    for (var i = 0; i < CONFIG.nodeCount; i++) {
        for (var j = 0; j < CONFIG.nodeCount; j++) {
            const node = nodes[i][j];
            drawNode(node);
        }
    }
}

(function() {
    const updateCanvasGeometry = () => {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    };
    updateCanvasGeometry()
    window.addEventListener('resize', updateCanvasGeometry);

    const [midX, midY] =  [canvas.width / 2, canvas.height / 2];
    const top = midY - (CONFIG.nodeCount - 1) * CONFIG.nodeDist / 2;
    const left = midX - (CONFIG.nodeCount - 1) * CONFIG.nodeDist / 2;
    for (var i = 0; i < CONFIG.nodeCount; i++) {
        const row = [];
        for (var j = 0; j < CONFIG.nodeCount; j++) {
            const node = new Node(
                left + j * CONFIG.nodeDist,
                top + i * CONFIG.nodeDist
            );
            row.push(node);
        }
        nodes.push(row);
    }

    setInterval(updateCanvas, 100);
})();
