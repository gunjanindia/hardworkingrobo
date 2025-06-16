const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

import { Robot } from './robot/robot.js';
import { zones } from './zones/zones.js';
import { calculateDistance } from './utils/helpers.js';

const robot = new Robot(50, 50, 20);
// Provide up-to-date wall/door info to robot for pathfinding
robot.wallXGetter = () => wallX;
robot.doorYGetter = () => doorY;
robot.doorHeightGetter = () => doorHeight;

let targetItem = null;
let wallX = 400;
let doorY = 200 + Math.random() * 200; // random vertical position for door
let doorHeight = 100;

const items = [];
const zoneNames = zones.map(z => z.name);
const zoneColors = zones.map(z => z.color);
// Change initial item creation to 3 items
let created = 0;
while (created < 3) {
  const idx = Math.floor(Math.random() * zones.length);
  const color = zoneColors[idx];
  const zoneName = zoneNames[idx];
  const x = Math.random() * (canvas.width - 40) + 20;
  const y = Math.random() * (canvas.height - 40) + 20;

  // Avoid placing on the vertical wall (x ≈ 400, except door) and outer walls
  const onVerticalWall = (x > 390 && x < 410) && !(y > 250 && y < 350);
  const onOuterWall = (x < 20 || x > canvas.width - 20 || y < 20 || y > canvas.height - 20);

  if (!onVerticalWall && !onOuterWall) {
    items.push({
      x,
      y,
      color,
      zoneName, // assign the correct zone name
      name: `Item ${created + 1}`,
      picked: false,
      delivered: false
    });
    created++;
  }
  // else: try again
}

// Add popup flag and DOM creation
let showPopup = true;

// Create popup DOM
const popup = document.createElement('div');
popup.style.position = 'fixed';
popup.style.top = '30px';
popup.style.right = '30px';
popup.style.background = 'rgba(30,30,30,0.97)';
popup.style.color = '#fff';
popup.style.padding = '18px 22px';
popup.style.borderRadius = '12px';
popup.style.boxShadow = '0 4px 24px #000a';
popup.style.zIndex = 1000;
popup.style.fontFamily = 'monospace';
popup.style.fontSize = '14px';
popup.style.maxWidth = '340px';
popup.style.maxHeight = '80vh';
popup.style.overflowY = 'auto';
popup.style.display = 'none';

const closeBtn = document.createElement('button');
closeBtn.textContent = '✕';
closeBtn.style.position = 'absolute';
closeBtn.style.top = '8px';
closeBtn.style.right = '10px';
closeBtn.style.background = 'transparent';
closeBtn.style.color = '#fff';
closeBtn.style.border = 'none';
closeBtn.style.fontSize = '18px';
closeBtn.style.cursor = 'pointer';
closeBtn.onclick = () => { showPopup = false; popup.style.display = 'none'; };
popup.appendChild(closeBtn);

document.body.appendChild(popup);

// Add a toggle button
const popupToggleBtn = document.createElement('button');
popupToggleBtn.textContent = 'Show Status';
popupToggleBtn.style.position = 'fixed';
popupToggleBtn.style.top = '30px';
popupToggleBtn.style.right = '30px';
popupToggleBtn.style.zIndex = 1001;
popupToggleBtn.style.background = '#444';
popupToggleBtn.style.color = '#fff';
popupToggleBtn.style.border = 'none';
popupToggleBtn.style.padding = '8px 16px';
popupToggleBtn.style.borderRadius = '8px';
popupToggleBtn.style.fontSize = '15px';
popupToggleBtn.style.cursor = 'pointer';
popupToggleBtn.onclick = () => {
  showPopup = !showPopup;
  popup.style.display = showPopup ? 'block' : 'none';
  popupToggleBtn.textContent = showPopup ? 'Hide Status' : 'Show Status';
};
document.body.appendChild(popupToggleBtn);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoomsAndWalls();

  // Draw drop zones with rounded corners and label inside
  for (let zone of zones) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(zone.x + 8, zone.y);
    ctx.lineTo(zone.x + 32, zone.y);
    ctx.quadraticCurveTo(zone.x + 40, zone.y, zone.x + 40, zone.y + 8);
    ctx.lineTo(zone.x + 40, zone.y + 32);
    ctx.quadraticCurveTo(zone.x + 40, zone.y + 40, zone.x + 32, zone.y + 40);
    ctx.lineTo(zone.x + 8, zone.y + 40);
    ctx.quadraticCurveTo(zone.x, zone.y + 40, zone.x, zone.y + 32);
    ctx.lineTo(zone.x, zone.y + 8);
    ctx.quadraticCurveTo(zone.x, zone.y, zone.x + 8, zone.y);
    ctx.closePath();
    ctx.fillStyle = zone.color;
    ctx.shadowColor = "#888";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#000000";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(zone.name, zone.x + 20, zone.y + 25);
    ctx.restore();
  }

  // Draw items with border and shadow
  for (let item of items) {
    if (!item.picked) {
      ctx.save();
      ctx.shadowColor = "#aaa";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#333";
      ctx.stroke();
      ctx.font = "10px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(item.name, item.x, item.y + 22);
      ctx.restore();
    }
  }
  robot.drawPath(ctx); // <-- Add this before drawing the robot

  drawRobot(ctx, robot);
}

function drawRobot(ctx, robot) {
  ctx.save();
  ctx.translate(robot.x, robot.y);

  // Breathing effect
  const time = Date.now() / 600;
  const breath = Math.sin(time) * 2;

  // Leg animation
  for (let i = 0; i < 4; i++) {
    ctx.save();
    const angle = (Math.PI / 2) * i + Math.sin(time * 2 + i) * 0.2;
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 18 + Math.abs(Math.sin(time * 3 + i) * 4));
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#444";
    ctx.stroke();
    ctx.restore();
  }

  // Body with breathing
  ctx.beginPath();
  ctx.moveTo(-10, -10 + 5 + breath);
  ctx.quadraticCurveTo(-10, -10 + breath, -10 + 5, -10 + breath);
  ctx.lineTo(10 - 5, -10 + breath);
  ctx.quadraticCurveTo(10, -10 + breath, 10, -10 + 5 + breath);
  ctx.lineTo(10, 10 - 5 + breath);
  ctx.quadraticCurveTo(10, 10 + breath, 10 - 5, 10 + breath);
  ctx.lineTo(-10 + 5, 10 + breath);
  ctx.quadraticCurveTo(-10, 10 + breath, -10, 10 - 5 + breath);
  ctx.closePath();
  ctx.fillStyle = robot.carrying ? "#ffb347" : "#888"; // Glow if carrying
  ctx.shadowColor = robot.carrying ? "#ff0" : "#222";
  ctx.shadowBlur = robot.carrying ? 16 : 8;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Blinking eye
  const blink = Math.abs(Math.sin(time * 2)) > 0.1 ? 1 : 0.2;
  ctx.beginPath();
  ctx.arc(0, -5 + breath, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = blink;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(0, -5 + breath, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "#222";
  ctx.fill();

  // If carrying, show item on top
  if (robot.carrying) {
    ctx.beginPath();
    ctx.arc(0, -18 + breath, 6, 0, Math.PI * 2);
    ctx.fillStyle = robot.carrying.color;
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#333";
    ctx.stroke();
  }

  ctx.restore();
}

function update() {
  robot.update(items, zones);

  // Sync carried item's position with robot
  if (robot.carrying) {
    robot.carrying.x = robot.x;
    robot.carrying.y = robot.y;
    robot.carrying.picked = true;
  }

  // 2. Update delivery status: If robot just dropped an item inside its zone, mark as delivered
  for (const item of items) {
    if (!item.delivered && !item.picked) {
      const zone = zones.find(z => z.name === item.zoneName);
      if (
        zone &&
        item.x >= zone.x &&
        item.x <= zone.x + 40 &&
        item.y >= zone.y &&
        item.y <= zone.y + 40
      ) {
        item.delivered = true;
      }
    }
  }

  // Check if all items are delivered and robot is not carrying anything
  const allDelivered = items.length > 0 && items.every(item => item.delivered);
  if (allDelivered && !robot.carrying && (!robot.path || robot.path.length === 0)) {
    if (!update._pendingNewItems) {
      update._pendingNewItems = true;
      setTimeout(() => {
        createNewItem();
        randomizeLayoutAndZones();
        update._pendingNewItems = false;
      }, 100);
    }
  }

  // Update popup content if visible
  if (showPopup) {
    popup.innerHTML = '';
    popup.appendChild(closeBtn);

    popup.innerHTML += `<b>Items (${items.length}):</b><br>`;
    if (items.length === 0) {
      popup.innerHTML += '<i>No items</i><br>';
    } else {
      items.forEach(item => {
        popup.innerHTML +=
          `<div style="margin-bottom:4px;">
            <span style="color:${item.color};font-weight:bold;">●</span>
            <b>${item.name}</b> [${item.zoneName}]<br>
            x:${item.x.toFixed(1)}, y:${item.y.toFixed(1)}<br>
            picked: ${item.picked ? '✔️' : '❌'} | delivered: ${item.delivered ? '✔️' : '❌'}
          </div>`;
      });
    }

    popup.innerHTML += `<hr style="border:0;border-top:1px solid #444;margin:8px 0;">
      <b>Robot:</b><br>
      x: ${robot.x.toFixed(1)}, y: ${robot.y.toFixed(1)}<br>
      carrying: ${robot.carrying ? robot.carrying.name : '<i>none</i>'}<br>
      path: ${robot.path && robot.path.length ? robot.path.length + ' steps' : 'none'}<br>
      speed: ${robot.speed}
    `;

    popup.innerHTML += `<hr style="border:0;border-top:1px solid #444;margin:8px 0;">
      <b>Zones (${zones.length}):</b><br>`;
    zones.forEach(z => {
      popup.innerHTML +=
        `<span style="color:${z.color};font-weight:bold;">■</span>
         <b>${z.name}</b> (x:${z.x.toFixed(1)}, y:${z.y.toFixed(1)})<br>`;
    });
  }

  draw();
}

function checkCompletion() {
  // If all items are delivered (items array is empty and robot is not carrying), create new items and randomize layout/zones
  if (
    items.length === 0 &&
    !robot.carrying &&
    (!robot.path || robot.path.length === 0)
  ) {
    if (!checkCompletion._pendingNewItems) {
      checkCompletion._pendingNewItems = true;
      setTimeout(() => {
        createNewItem();
        randomizeLayoutAndZones();
        checkCompletion._pendingNewItems = false;
      }, 100);
    }
  }
}

function createNewItem() {
  // Clear items array before creating new items
  items.length = 0;
  const zoneNames = zones.map(z => z.name);
  const zoneColors = zones.map(z => z.color);
  let created = 0;
  while (created < 3) {
    const idx = Math.floor(Math.random() * zones.length);
    const color = zoneColors[idx];
    const zoneName = zoneNames[idx];
    const x = Math.random() * (canvas.width - 40) + 20;
    const y = Math.random() * (canvas.height - 40) + 20;

    // Avoid placing on the vertical wall (x ≈ wallX, except door) and outer walls
    const onVerticalWall = (x > wallX - 10 && x < wallX + 10) && !(y > doorY && y < doorY + doorHeight);
    const onOuterWall = (x < 20 || x > canvas.width - 20 || y < 20 || y > canvas.height - 20);

    if (!onVerticalWall && !onOuterWall) {
      items.push({
        x,
        y,
        color,
        zoneName,
        name: `Item ${Date.now()}-${created}`,
        picked: false,
        delivered: false
      });
      created++;
    }
    // else: try again
  }
}


function drawRoomsAndWalls() {
  // Room 1 (left)
  ctx.save();
  ctx.fillStyle = "#f5f5dc";
  ctx.fillRect(0, 0, wallX, canvas.height);
  ctx.restore();

  // Room 2 (right)
  ctx.save();
  ctx.fillStyle = "#e0f7fa";
  ctx.fillRect(wallX, 0, canvas.width - wallX, canvas.height);
  ctx.restore();

  // Walls (thick lines)
  ctx.save();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 10;

  // Vertical wall with door
  ctx.beginPath();
  ctx.moveTo(wallX, 0);
  ctx.lineTo(wallX, doorY);
  ctx.moveTo(wallX, doorY + doorHeight);
  ctx.lineTo(wallX, canvas.height);
  ctx.stroke();

  // Outer walls
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  ctx.restore();

  // Door highlight
  ctx.save();
  ctx.fillStyle = "#ffe082";
  ctx.fillRect(wallX - 5, doorY, 10, doorHeight);
  ctx.restore();
}
function isInsideDoor(y) {
  // Door is between y=250 and y=350 on the vertical wall at x=400
  return y > doorY && y < doorY + doorHeight;
}

function isBlocked(nx, ny) {
  if (
    ((robot.x < wallX && nx >= wallX) || (robot.x > wallX && nx <= wallX)) &&
    !isInsideDoor(ny)
  ) {
    return true;
  }
  // Block outer walls
  if (nx < 15 || nx > canvas.width - 15 || ny < 15 || ny > canvas.height - 15) {
    return true;
  }
  return false;
}

function randomizeLayoutAndZones() {
  // Randomize wall and door based on canvas size
  wallX = Math.max(150, Math.min(canvas.width - 150, 0.25 * canvas.width + Math.random() * 0.5 * canvas.width));
  doorY = Math.max(50, Math.min(canvas.height - 200, Math.random() * (canvas.height - 200)));
  doorHeight = 80 + Math.random() * Math.max(60, canvas.height * 0.15);

  robot.wallX = wallX;
  robot.doorY = doorY;
  robot.doorHeight = doorHeight;

  // Randomize zone positions (not on wall or outer wall)
  zones.forEach(zone => {
    let zx, zy;
    do {
      zx = Math.random() * (canvas.width - 60) + 10;
      zy = Math.random() * (canvas.height - 60) + 10;
    } while (
      (zx > wallX - 30 && zx < wallX + 30 && !(zy > doorY && zy < doorY + doorHeight)) ||
      zx < 20 || zx > canvas.width - 40 || zy < 20 || zy > canvas.height - 40
    );
    zone.x = zx;
    zone.y = zy;
  });
}
// Set the collision checker for the robot
robot.setCollisionChecker(isBlocked);
function loop() {
  update();
  requestAnimationFrame(loop);
}

draw();
loop();

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();