const calculateDistance = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
};

const isInRange = (robotX, robotY, targetX, targetY, range) => {
    const distance = calculateDistance(robotX, robotY, targetX, targetY);
    return distance <= range;
};

const findClosestItem = (robot, items) => {
    let closestItem = null;
    let closestDistance = Infinity;

    for (const item of items) {
        if (!item.picked) {
            const distance = calculateDistance(robot.x, robot.y, item.x, item.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        }
    }

    return closestItem;
};

const findDropZoneForItem = (item, zones) => {
    return zones.find(zone => zone.color === item.color);
};

export { calculateDistance, isInRange, findClosestItem, findDropZoneForItem };