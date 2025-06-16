# Digital Robot Simulation

A web-based simulation where a robot autonomously picks up items and delivers them to colored zones. The robot features lively animations, a status popup, and playful behaviors.

---

## Features

- **Autonomous robot**: Finds, picks, and delivers items to their target zones.
- **Animated robot**: Breathing, blinking, hopping when idle, and a happy face/sound on delivery.
- **Status popup**: Shows real-time robot, item, and zone status.
- **Dynamic environment**: Zones and items are randomized after each delivery cycle.
- **Interactive UI**: Toggle status popup, observe robot logic in action.

---

## Getting Started

### 1. Clone or Download

Clone this repository or download the source code.

### 2. Project Structure

```
digital-robot-simulation/
├── src/
│   ├── index.html
│   ├── main.js
│   ├── robot/
│   │   └── robot.js
│   ├── zones/
│   │   └── zones.js
│   ├── utils/
│   │   └── helpers.js
│   ├── items/
│   │   └── items.js
│   └── happy.wav         # (Optional) Sound played on delivery
├── README.md
└── package.json
```

### 3. Run the Simulation

Open `src/index.html` in your browser.  
No build step or server is required.

---

## Usage

- **Watch the robot**: It will automatically pick up and deliver items.
- **Status Popup**: Click "Show Status" to view real-time details about items, robot, and zones.
- **Observe behaviors**:
  - Robot hops when idle.
  - Robot's eye tracks the nearest item.
  - Robot smiles and plays a sound when delivering an item.

---

## Code Flow

### 1. Initialization

- The canvas and robot are initialized.
- Three items are randomly placed, each assigned to a colored zone.

### 2. Main Loop (`update()` in `main.js`)

- **Robot logic**: The robot plans a path to the nearest item or its delivery zone.
- **Item pickup**: When the robot reaches an item, it picks it up (`picked = true`).
- **Delivery**: When the robot drops the item in the correct zone, it marks it as delivered (`delivered = true`), plays a sound, and shows a happy face.
- **Status update**: The popup is updated with the latest robot, item, and zone info.
- **Cycle**: When all items are delivered, new items and zones are randomized.

### 3. Drawing (`draw()` and `drawRobot()`)

- **Robot**: Animated with breathing, blinking, hopping, and eye tracking.
- **Items/Zones**: Drawn with color and labels.
- **Popup**: Shows live status.

---

## Customization

- **Sound**: Replace `happy.wav` with your own sound file.
- **Robot speed**: Adjust `robot.speed` in `robot.js`.
- **Number of items/zones**: Change the item creation logic in `main.js`.

---

## Dependencies

- Pure JavaScript, HTML5 Canvas.
- No external libraries required.

---

## Credits

- Robot animation and logic: [Your Name]
- Sound: [Attribution if using a public sound]

---

## License

MIT License

---
