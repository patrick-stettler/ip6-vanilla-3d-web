/**
 * @module layout/computeLayout
 * Computes group and cube positions for the scene.
 */

import { CUBE_GAP, CUBE_SIZE, GROUP_GAP, PADDING } from "../config.js";

export { groupDepth, groupWidth, layoutGroups };

/**
 * @typedef {Object} CubePlacementType
 * @property { !ModuleDataType } module - the module placed at this position. Mandatory.
 * @property { !number }         x      - world x center position. Mandatory.
 * @property { !number }         y      - world y center position. Mandatory.
 */

/**
 * @typedef {Object} GroupPlacementType
 * @property { !LayoutGroupType }     group - the group placed at this position. Mandatory.
 * @property { !number }              x     - world x center position. Mandatory.
 * @property { !number }              y     - world y center position. Mandatory.
 * @property { !number }              width - group plane width. Mandatory.
 * @property { !number }              depth - group plane depth. Mandatory.
 * @property { !CubePlacementType[] } cubes - cube placements belonging to this group. Mandatory.
 */

/**
 * @typedef {Object} LayoutType
 * @property {{ width: number, depth: number }} baseSize        - dimensions for the ground plane. Mandatory.
 * @property { !GroupPlacementType[] }          groupPlacements - placement of every group and its cubes. Mandatory.
 */

/**
 * @typedef {Object} LayoutGroupType
 * @property { !number }           id      - group identifier. Mandatory.
 * @property { !string }           name    - display label. Mandatory.
 * @property { !ModuleDataType[] } modules - modules belonging to this group. Mandatory.
 */

/**
 * Returns the number of grid columns for a group with the given module count.
 * @pure
 * @private
 * @param  { !number } moduleCount - number of modules in the group. Mandatory.
 * @return { number }
 * @complexity O(1)
 */
function groupColumnCount(moduleCount) {
    return Math.max(1, Math.ceil(Math.sqrt(moduleCount)));
}

/**
 * Returns the number of grid rows for a group with the given module count.
 * @pure
 * @private
 * @param  { !number } moduleCount - number of modules in the group. Mandatory.
 * @return { number }
 * @complexity O(1)
 */
function groupRowCount(moduleCount) {
    return Math.max(1, Math.ceil(moduleCount / groupColumnCount(moduleCount)));
}

/**
 * Returns the total ground-plane width for a group with the given module count.
 * @pure
 * @param  { !number } moduleCount - number of modules in the group. Mandatory.
 * @return { number }
 * @complexity O(1)
 */
function groupWidth(moduleCount) {
    const cols = groupColumnCount(moduleCount);
    return cols * CUBE_SIZE + (cols - 1) * CUBE_GAP + PADDING * 2;
}

/**
 * Returns the total ground-plane depth for a group with the given module count.
 * @pure
 * @param  { !number } moduleCount - number of modules in the group. Mandatory.
 * @return { number }
 * @complexity O(1)
 */
function groupDepth(moduleCount) {
    const rows = groupRowCount(moduleCount);
    return rows * CUBE_SIZE + (rows - 1) * CUBE_GAP + PADDING * 2;
}

/**
 * Arranges groups into rows and computes world positions for every group plane
 * and cube.
 * @pure
 * @param  {{ groups: !LayoutGroupType[], basePadding: !number }} config - groups to lay out and padding around the ground plane. Mandatory.
 * @return { LayoutType }
 * @complexity O(g log g + m)
 * @example
 *     const layout = layoutGroups({ groups, basePadding: 1.5 });
 */
function layoutGroups({ groups, basePadding }) {
    const sorted = [...groups].sort(function(a, b) {
        return b.modules.length - a.modules.length;
    });

    /** @type { LayoutGroupType[][] } */
    const rows = [];

    for (let i = 0; i < Math.ceil(sorted.length / 2); i++) {
        const pair   = [sorted[i]];
        const mirror = sorted[sorted.length - 1 - i];

        if (mirror !== sorted[i]) pair.push(mirror);
        rows.push(pair);
    }

    /** @type { number[] } */
    const rowWidths = rows.map(function(row) {
        return row.reduce(function(sum, group) {
            return sum + groupWidth(group.modules.length);
        }, 0) + (row.length - 1) * GROUP_GAP;
    });

    /** @type { number[] } */
    const rowDepths = rows.map(function(row) {
        return row.reduce(function(max, group) {
            return Math.max(max, groupDepth(group.modules.length));
        }, 0);
    });

    /** @type { number } */
    const maxRowWidth = Math.max(...rowWidths);

    /** @type { number } */
    const totalLayoutY = rowDepths.reduce(function(sum, depth) {
        return sum + depth;
    }, 0) + (rows.length - 1) * GROUP_GAP;

    /** @type { number } */
    const step = CUBE_SIZE + CUBE_GAP;

    /** @type { GroupPlacementType[] } */
    const groupPlacements = [];

    /** @type { number } */
    let rowTopY = totalLayoutY / 2;

    for (let r = 0; r < rows.length; r++) {
        const row      = rows[r];
        const rowWidth = rowWidths[r];
        const rowDepth = rowDepths[r];

        /** @type { number } */
        let colX = -(rowWidth / 2);

        for (let c = 0; c < row.length; c++) {
            const group        = row[c];
            const width        = groupWidth(group.modules.length);
            const depth        = groupDepth(group.modules.length);
            const groupCenterX = colX + width / 2;
            const groupCenterY = rowTopY - rowDepth / 2;
            const columnCount  = groupColumnCount(group.modules.length);
            const rowCount     = groupRowCount(group.modules.length);
            const startCubeX   = groupCenterX - ((columnCount - 1) * step) / 2;
            const startCubeY   = groupCenterY + ((rowCount - 1) * step) / 2;

            groupPlacements.push({
                group: group,
                x:     groupCenterX,
                y:     groupCenterY,
                width: width,
                depth: depth,
                cubes: group.modules.map(function(module, i) {
                    const column = i % columnCount;
                    const row    = Math.floor(i / columnCount);
                    return { module, x: startCubeX + column * step, y: startCubeY - row * step };
                })
            });

            colX += width + GROUP_GAP;
        }

        rowTopY -= rowDepth + GROUP_GAP;
    }

    return {
        baseSize: {
            width: maxRowWidth + basePadding * 2,
            depth: totalLayoutY + basePadding * 2
        },
        groupPlacements: groupPlacements
    };
}
