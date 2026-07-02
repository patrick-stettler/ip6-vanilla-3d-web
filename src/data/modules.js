/**
 * @module data/modules
 * Provides the flat list of study modules.
 */

export { MODULES };

/**
 * @typedef {Object} ModuleDataType
 * @property { !number }   id            - unique module identifier. Mandatory.
 * @property { !string }   title         - short label shown on the cube. Mandatory.
 * @property { !number }   group         - id of the module group. Mandatory.
 * @property { !number }   ects          - ECTS credit value. Mandatory.
 * @property { !string }   status        - module state used by CSS for visual styling. Mandatory.
 * @property { ?number }   grade         - grade on the 1-6 scale, or null if ungraded. Mandatory.
 * @property { !number[] } prerequisites - IDs of prerequisite modules. Mandatory.
 * @property { !string }   name          - full module name. Mandatory.
 */

/** @type { !ModuleDataType[] } */
const MODULES = [

    /* Kontext */
    { id: 0,   title: "wisa",       group: 0,   ects: 2,    status: "ongoing",          grade: null,    prerequisites: [1],          name: "Wissenschaftliches Arbeiten" },
    { id: 1,   title: "sprx",       group: 0,   ects: 2,    status: "passed",           grade: 5.5,     prerequisites: [],          name: "Schreibpraxis" },
    { id: 2,   title: "den1",       group: 0,   ects: 2,    status: "passed",           grade: 5.0,     prerequisites: [],          name: "Developing English 1 (Basic)" },    
    { id: 3,   title: "den2",       group: 0,   ects: 2,    status: "passed",           grade: 4.5,     prerequisites: [2],          name: "Developing English 2 (Basic)" },    
    { id: 4,   title: "patr",       group: 0,   ects: 2,    status: "passed",           grade: null,    prerequisites: [],          name: "Patentrecht" },    
    { id: 5,   title: "wusa",       group: 0,   ects: 2,    status: "not_started",      grade: null,    prerequisites: [],          name: "Weltmacht USA" },    
    
    /* Design */        
    { id: 100, title: "meco",       group: 1,   ects: 3,    status: "passed",           grade: 5.5,     prerequisites: [],          name: "Media Computing" },   
    { id: 101, title: "ivis",       group: 1,   ects: 3,    status: "not_started",      grade: null,    prerequisites: [],          name: "Informations-Visualisierung" },   
    { id: 102, title: "adxd",       group: 1,   ects: 3,    status: "passed",           grade: 5.0,     prerequisites: [],          name: "Advanced Experience Design" },   
    { id: 103, title: "dtpC",       group: 1,   ects: 3,    status: "passed",           grade: 5.0,     prerequisites: [],          name: "Designtheorie und -prozesse" },   
    { id: 104, title: "uidC",       group: 1,   ects: 3,    status: "passed",           grade: 5.5,     prerequisites: [],          name: "User Interface und Interaction Design" },   
    
    /* Praxis */     
    { id: 200, title: "P1bb",       group: 2,   ects: 6,    status: "passed",           grade: null,     prerequisites: [],         name: "Projekt 1 berufsbegleitend" },
    { id: 201, title: "P2bb",       group: 2,   ects: 6,    status: "passed",           grade: null,     prerequisites: [200],      name: "Projekt 2 berufsbegleitend" },
    { id: 202, title: "pro3I",      group: 2,   ects: 6,    status: "passed",           grade: 5.0,      prerequisites: [201],      name: "Projekt 3 Informatik" },
    { id: 203, title: "pro4I",      group: 2,   ects: 6,    status: "passed",           grade: 5.0,      prerequisites: [202],      name: "Projekt 4 Informatik" },
    { id: 204, title: "pro5I",      group: 2,   ects: 6,    status: "passed",           grade: 5.0,      prerequisites: [203],      name: "Projekt 5 Informatik" },
    { id: 205, title: "pro6Ia",     group: 2,   ects: 12,   status: "ongoing",          grade: null,     prerequisites: [204],      name: "Projekt 6 Informatik Bachelor Thesis" },

    /* Mathematik */
    { id: 300, title: "vana",       group: 3,   ects: 3,    status: "not_started",      grade: null,    prerequisites: [304],          name: "Vertiefung Analysis" },
    { id: 301, title: "kry",        group: 3,   ects: 3,    status: "passed",           grade: 5.0,     prerequisites: [308, 307],          name: "Kryptologie" },
    { id: 302, title: "krysi",      group: 3,   ects: 3,    status: "not_started",      grade: null,    prerequisites: [301],          name: "Kryptographie und Informationssicherheit" },
    { id: 303, title: "eti",        group: 3,   ects: 3,    status: "passed",           grade: 5.5,     prerequisites: [308],          name: "Einführung in die Theoretische Informatik" },
    { id: 304, title: "eana",       group: 3,   ects: 3,    status: "passed",           grade: 4.0,     prerequisites: [308],          name: "Einführung in die Analysis" },
    { id: 305, title: "dist",       group: 3,   ects: 3,    status: "passed",           grade: 4.5,     prerequisites: [308],          name: "Diskrete Stochastik" },
    { id: 306, title: "lag",        group: 3,   ects: 3,    status: "passed",           grade: 4.5,     prerequisites: [308],          name: "Lineare Algebra und Geometrie" },
    { id: 307, title: "mada",       group: 3,   ects: 3,    status: "passed",           grade: 5.0,     prerequisites: [308],          name: "Mathematik für die Datenkommunikation" },
    { id: 308, title: "mgli",       group: 3,   ects: 3,    status: "passed",           grade: 5.0,     prerequisites: [],          name: "Mathematische Grundlagen der Informatik" },
    

    /* Informatik */
    { id: 400, title: "webpr",      group: 4,   ects: 3,    status: "passed",          grade: 5.5,      prerequisites: [405],          name: "Web Programming" },
    { id: 401, title: "webec",      group: 4,   ects: 3,    status: "passed",          grade: 5.5,      prerequisites: [405],          name: "Web Engineering" },
    { id: 402, title: "sepC",       group: 4,   ects: 3,    status: "passed",          grade: 4.5,      prerequisites: [],          name: "Softwareentwicklungsprozesse" },
    { id: 403, title: "stqm",       group: 4,   ects: 3,    status: "not_started",     grade: null,     prerequisites: [404],          name: "Software Testing and Quality Management" },
    { id: 404, title: "swc",        group: 4,   ects: 3,    status: "passed",          grade: 4.0,      prerequisites: [],          name: "Software Construction" },
    { id: 405, title: "depa",       group: 4,   ects: 3,    status: "failed_once",     grade: 3.5,      prerequisites: [],          name: "Design Patterns" },
    { id: 406, title: "req",        group: 4,   ects: 3,    status: "passed",          grade: 4.5,      prerequisites: [407],          name: "Requirements Engineering" },
    { id: 407, title: "sweGL",      group: 4,   ects: 3,    status: "passed",          grade: 5.0,      prerequisites: [],          name: "Software Engineering Grundlagen" },

    /* Management */
    { id: 500, title: "pefu",       group: 5,   ects: 3,    status: "passed",           grade: 5.0,     prerequisites: [],          name: "Personal und Führung" },
    { id: 501, title: "mpm",        group: 5,   ects: 3,    status: "passed",           grade: 5.5,     prerequisites: [],          name: "Marketing und Produktmanagement" },
    { id: 502, title: "cmm",        group: 5,   ects: 3,    status: "not_started",      grade: null,    prerequisites: [],          name: "Current Management Topics by MOOCs" },
    { id: 503, title: "bwlC",       group: 5,   ects: 3,    status: "passed",           grade: 5.0,     prerequisites: [],          name: "BWL Startup" },
    { id: 504, title: "pmC",        group: 5,   ects: 3,    status: "passed",           grade: 5.5,     prerequisites: [],          name: "Projektmanagement" }
];
