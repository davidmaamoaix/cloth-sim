const unit = Math.min(window.innerWidth, window.innerHeight) / 12.5;
const CONFIG = {
    dampen: 0.9,
    stiffness: 5,
    nodeCount: 11,
    nodeDist: unit,
    nodeSize: 5
};

class Node {

    constructor(x, y, locked=false) {
        this.x = x;
        this.y = y;
        this.locked = locked;
    }

    velocity(vx, vy) {
        if (!this.locked) {
            this.x += vx;
            this.y += vy;
        }
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nodes = [];

function norm(x, y) {
    return Math.sqrt(x * x + y * y);
}

function normalize(x, y) {
    const mag = norm(x, y);
    return [x / mag, y / mag];
}

function drawNode(node) {
    ctx.fillStyle = node.locked ? '#0078CE' : '#D4D4D4';
    ctx.beginPath();
    ctx.arc(node.x, node.y, CONFIG.nodeSize, 0, 2 * Math.PI);
    ctx.fill();
}

function drawLine(from, to) {
    ctx.strokeStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}

function mapNeighbor(i, j, func) {
    if (i !== 0) func(nodes[i - 1][j]);
    if (j !== 0) func(nodes[i][j - 1]);
    if (i !== CONFIG.nodeCount - 1) func(nodes[i + 1][j]);
    if (j !== CONFIG.nodeCount - 1) func(nodes[i][j + 1]);
}

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < CONFIG.nodeCount; i++) {
        for (var j = 0; j < CONFIG.nodeCount; j++) {
            const node = nodes[i][j];

            let [vx, vy] = [0, 0];
            vy += 5;
            mapNeighbor(i, j, other => {
                const [dx, dy] = [other.x - node.x, other.y - node.y];
                const magnitude = norm(dx, dy) - CONFIG.nodeDist;

                let [ux, uy] = normalize(dx, dy);
                ux *= magnitude;
                uy *= magnitude;

                vx += ux * CONFIG.stiffness;
                vy += uy * CONFIG.stiffness;
            });

            node.velocity(vx * 0.1, vy * 0.1);

            if (i !== CONFIG.nodeCount - 1) {
                drawLine(node, nodes[i + 1][j]);
            }

            if (j !== CONFIG.nodeCount - 1) {
                drawLine(node, nodes[i][j + 1]);
            }

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
                top + i * CONFIG.nodeDist,
                i === 0 && (j & 1) === 0
            );
            row.push(node);
        }
        nodes.push(row);
    }

    setInterval(updateCanvas, 10);
})();
