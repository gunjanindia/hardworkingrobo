const zones = [
  { x: 100, y: 300, color: 'red', name: 'Bookshelf' },
  { x: 500, y: 300, color: 'blue', name: 'Toybox' },
  { x: 200, y: 150, color: 'green', name: 'Plant Area' },
  { x: 420, y: 100, color: 'yellow', name: 'Game Zone' },
];

function isItemInZone(item, zone) {
  const zoneWidth = 40;
  const zoneHeight = 40;
  return (
    item.x >= zone.x &&
    item.x <= zone.x + zoneWidth &&
    item.y >= zone.y &&
    item.y <= zone.y + zoneHeight
  );
}

export { zones, isItemInZone };