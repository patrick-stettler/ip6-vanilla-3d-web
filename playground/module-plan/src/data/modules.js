import { STATUS } from '../config.js';

export const groups = [
  { id: 'demo', name: 'Demo Module', color: '#4488ff' },
];

export const modules = [
  { id: 'm1', name: 'Analysis 1',  ects: 3, group: 'demo', status: STATUS.COMPLETED,    grade: 6.0 },
  { id: 'm2', name: 'OOP 1',       ects: 6, group: 'demo', status: STATUS.COMPLETED,    grade: 4.0 },
  { id: 'm3', name: 'Netzwerke',   ects: 3, group: 'demo', status: STATUS.FAILED_TWICE, grade: null },
  { id: 'm4', name: 'Stochastik',  ects: 4, group: 'demo', status: STATUS.FAILED_ONCE,  grade: null },
  { id: 'm5', name: 'Web Dev',     ects: 3, group: 'demo', status: STATUS.NOT_STARTED,  grade: null },
];
