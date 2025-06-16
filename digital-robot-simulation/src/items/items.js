const items = [
  { x: 300, y: 80, color: 'red', name: 'Book', picked: false },
  { x: 400, y: 200, color: 'blue', name: 'Toy', picked: false },
  { x: 250, y: 150, color: 'green', name: 'Plant', picked: false },
  { x: 350, y: 100, color: 'yellow', name: 'Lamp', picked: false },
];

function getItemByName(name) {
  return items.find(item => item.name === name);
}

function resetItems() {
  items.forEach(item => item.picked = false);
}

export { items, getItemByName, resetItems };