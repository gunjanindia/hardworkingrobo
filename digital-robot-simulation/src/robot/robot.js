export class Robot {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.carrying = null;
    this.target = null;
    this.onArrive = null;
    this.speed = 2;
    this.isBlocked = null; // function to check wall collision

    // Wall and door properties
    this.wallX = 400;
    this.doorY = 250;
    this.doorHeight = 100;
  }
  setCollisionChecker(fn) {
    this.isBlocked = fn;
  }
  moveTo(tx, ty, onArrive) {
    this.target = { x: tx, y: ty };
    this.onArrive = onArrive;
  }

  update(items, zones) {
    // Ensure wall/door properties are always up-to-date from global zones if available
    if (typeof this.wallXGetter === "function") {
      this.wallX = this.wallXGetter();
      this.doorY = this.doorYGetter();
      this.doorHeight = this.doorHeightGetter();
    }

    // If carrying, go to zone; else, go to nearest item
    if (!this.path || this.path.length === 0) {
      let target;
      if (this.carrying) {
        // Find nearest suitable zone for the carried item
        const suitableZones = zones.filter(z => z.name === this.carrying.zoneName);
        target = suitableZones[0];
        let minDist = Infinity;
        for (const zone of suitableZones) {
          const d = Math.hypot(zone.x - this.x, zone.y - this.y);
          if (d < minDist) {
            minDist = d;
            target = zone;
          }
        }
      } else {
        // Find nearest item
        const available = items.filter(i => !i.picked);
        if (available.length === 0) return;
        target = available[0];
        let minDist = Infinity;
        for (const item of available) {
          const d = Math.hypot(item.x - this.x, item.y - this.y);
          if (d < minDist) {
            minDist = d;
            target = item;
          }
        }
      }
      this.path = this.computePath(target.x, target.y);
      this.pathTarget = target;
    }

    // Follow path
    if (this.path && this.path.length > 0) {
      const next = this.path[0];
      const dx = next.x - this.x;
      const dy = next.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.speed) {
        this.x = next.x;
        this.y = next.y;
        this.path.shift();
        // Arrived at final target
        if (this.path.length === 0 && this.pathTarget) {
          if (this.carrying && this.isInRange(this.pathTarget)) {
            this.placeInZone(this.pathTarget);
          } else if (!this.carrying && this.isInRange(this.pathTarget)) {
            this.pickUp(this.pathTarget);
          }
          this.pathTarget = null;
        }
      } else {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      }
    }
  }

  // Helper: Compute path through door if needed
  computePath(tx, ty) {
    const wallX = this.wallX ?? 400;
    const doorY = this.doorY ?? 250;
    const doorHeight = this.doorHeight ?? 100;
    const doorCenterY = doorY + doorHeight / 2;
    const margin = 18;

    // If both points are on the same side of the wall, direct path
    if ((this.x < wallX && tx < wallX) || (this.x > wallX && tx > wallX)) {
      return [{ x: tx, y: ty }];
    }
    // If crossing wall, must go through the door
    // Approach door from current side, go through center, then to target
    const approachX = this.x < wallX ? wallX - margin : wallX + margin;
    const exitX = this.x < wallX ? wallX + margin : wallX - margin;
    return [
      { x: approachX, y: doorCenterY },
      { x: exitX, y: doorCenterY },
      { x: tx, y: ty }
    ];
  }

  // Call this in your draw loop to show the path
  drawPath(ctx) {
    if (!this.path || this.path.length === 0) return;
    ctx.save();
    ctx.strokeStyle = "#888";
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    for (const p of this.path) {
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    // Draw dots
    for (const p of this.path) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ff0";
      ctx.fill();
    }
    ctx.restore();
  }

  detectItems(items) {
    return items.filter(item => !item.picked && this.isInRange(item));
  }

  isInRange(item) {
    const dx = item.x - this.x;
    const dy = item.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < this.size + 10; // Assuming 10 is the interaction range
  }

  pickUp(item) {
    if (this.isInRange(item)) {
      item.picked = true;
      this.carrying = item;
    }
  }

  placeInZone(zone) {
    // Only place if the zone matches the item's required zone
    if (
      this.carrying &&
      this.isInRange(zone) &&
      zone.name === this.carrying.zoneName
    ) {
      this.carrying.delivered = true;   // Mark as delivered
     // this.carrying.picked = false;      // No longer picked up
      this.carrying = null;
    }
  }

  createNewItem(items, newItem) {
    items.push(newItem);
  }
}

export default Robot;