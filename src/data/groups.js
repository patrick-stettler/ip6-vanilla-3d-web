/**
 * @module data/groups
 * Provides the flat list of module groups.
 */

export { MODULE_GROUPS };

/**
 * @typedef {Object} ModuleGroupDataType
 * @property { !number } id   - unique group identifier. Mandatory.
 * @property { !string } name - display name. Mandatory.
 */

/** @type { !ModuleGroupDataType[] } */
const MODULE_GROUPS = [
    { id: 0, name: "Kontext" },
    { id: 1, name: "Design" },
    { id: 2, name: "Praxis" },
    { id: 3, name: "Mathematik" },
    { id: 4, name: "Informatik" },
    { id: 5, name: "Management" }
];
