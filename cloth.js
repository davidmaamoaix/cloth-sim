const unit = Math.min(window.innerWidth, window.innerHeight) / 12.5;
const CONFIG = {
    mouseDragForce: 1,
    dragRadius: 100,
    dampen: 0.95,
    stiffness: 6.5,
    nodeCountX: 15,
    nodeCountY: 9,
    nodeDist: unit,
    nodeSize: 5,
    gravity: 9.81,
    nodeMass: 1,
    deltaTime: 0.1,
    yOffset: -50
};

class Node {

    constructor(x, y, locked=false) {
        this.x = x;
        this.y = y;
        this.locked = locked;

        this.vx = 0;
        this.vy = 0;
    }

    addVel(vx, vy) {
        this.vx += vx;
        this.vy += vy;
    }

    updatePos() {
        if (!this.locked) {
            this.x += this.vx * CONFIG.deltaTime;
            this.y += this.vy * CONFIG.deltaTime;

            const decay = Math.exp(-CONFIG.deltaTime * CONFIG.dampen);
            this.vx *= decay;
            this.vy *= decay;
        }
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nodes = [];
let [mouseX, mouseY] = [0, 0];

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
    if (i !== CONFIG.nodeCountY - 1) func(nodes[i + 1][j]);
    if (j !== CONFIG.nodeCountX - 1) func(nodes[i][j + 1]);
}

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;

    for (var i = 0; i < CONFIG.nodeCountY; i++) {
        for (var j = 0; j < CONFIG.nodeCountX; j++) {
            const node = nodes[i][j];

            let [fx, fy] = [0, 0];
            fy += CONFIG.gravity * CONFIG.nodeMass;
            mapNeighbor(i, j, other => {
                const [dx, dy] = [other.x - node.x, other.y - node.y];
                const magnitude = norm(dx, dy) - CONFIG.nodeDist;
                let [dfx, dfy] = normalize(dx, dy);
                dfx *= magnitude * CONFIG.stiffness;
                dfy *= magnitude * CONFIG.stiffness;
                fx += dfx;
                fy += dfy;
            });

            node.addVel(
                fx * CONFIG.deltaTime / CONFIG.nodeMass,
                fy * CONFIG.deltaTime / CONFIG.nodeMass
            );
            node.updatePos();

            if (i !== CONFIG.nodeCountY - 1) {
                drawLine(node, nodes[i + 1][j]);
            }

            if (j !== CONFIG.nodeCountX - 1) {
                drawLine(node, nodes[i][j + 1]);
            }

            drawNode(node);
        }
    }

    ctx.strokeStyle = '#0078CE';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, CONFIG.dragRadius, 0, 2 * Math.PI);
    ctx.stroke();
}

(function() {
    const updateCanvasGeometry = () => {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    };
    updateCanvasGeometry()
    window.addEventListener('resize', updateCanvasGeometry);

    const [midX, midY] =  [canvas.width / 2, canvas.height / 2];
    const top = midY - (CONFIG.nodeCountY - 1) * CONFIG.nodeDist / 2;
    const left = midX - (CONFIG.nodeCountX - 1) * CONFIG.nodeDist / 2;
    for (var i = 0; i < CONFIG.nodeCountY; i++) {
        const row = [];
        for (var j = 0; j < CONFIG.nodeCountX; j++) {
            const node = new Node(
                left + j * CONFIG.nodeDist,
                top + i * CONFIG.nodeDist + CONFIG.yOffset,
                i === 0 && (j & 1) === 0
            );
            row.push(node);
        }
        nodes.push(row);
    }

    canvas.addEventListener('mousemove', e => {
        const [currX, currY] = [
            e.pageX - canvas.offsetLeft,
            e.pageY - canvas.offsetTop
        ];
        const [dirX, dirY] = [currX - mouseX, currY - mouseY];
        [mouseX, mouseY] = [currX, currY];

        for (var i = 0; i < CONFIG.nodeCountY; i++) {
            for (var j = 0; j < CONFIG.nodeCountX; j++) {
                const node = nodes[i][j];
                if (norm(node.x - currX, node.y - currY) < CONFIG.dragRadius) {
                    node.addVel(dirX, dirY);
                }
            }
        }
    });

    setInterval(updateCanvas, 10);
})();
