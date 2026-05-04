import { CUBE_W, CUBE_D, CUBE_GAP, GROUP_PAD, GROUP_GAP, ECTS_SCALE, levelZ, statusToLevelIndex } from '../config.js';

export function computeLayout(modules, groups) {
  const byGroup = new Map(groups.map(g => [g.id, []]));
  for (const m of modules) byGroup.get(m.group)?.push(m);

  const layouts = [];
  let currentY = 0;

  for (const group of groups) {
    const mods  = byGroup.get(group.id) ?? [];
    const rectW = mods.length * CUBE_W + Math.max(mods.length - 1, 0) * CUBE_GAP + 2 * GROUP_PAD;
    const rectD = CUBE_D + 2 * GROUP_PAD;
    const rectX = -(rectW / 2);

    layouts.push({
      group,
      rect: { x: rectX, y: currentY, w: rectW, d: rectD },
      modulePositions: mods.map((mod, i) => {
        const height = mod.ects * ECTS_SCALE;
        const floorZ = levelZ(statusToLevelIndex(mod.status, mod.grade));
        return {
          module: mod,
          x: rectX + GROUP_PAD + i * (CUBE_W + CUBE_GAP) + CUBE_W / 2,
          y: currentY + rectD / 2,
          z: floorZ + height / 2,
          height,
        };
      }),
    });

    currentY += rectD + GROUP_GAP;
  }

  const offsetY = -((currentY - GROUP_GAP) / 2);
  for (const gl of layouts) {
    gl.rect.y += offsetY;
    for (const pos of gl.modulePositions) pos.y += offsetY;
  }

  return layouts;
}

export function sceneExtent(layouts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const gl of layouts) {
    minX = Math.min(minX, gl.rect.x);
    maxX = Math.max(maxX, gl.rect.x + gl.rect.w);
    minY = Math.min(minY, gl.rect.y);
    maxY = Math.max(maxY, gl.rect.y + gl.rect.d);
  }
  return { w: maxX - minX, d: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}
