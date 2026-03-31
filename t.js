// Testing File

import './dist/index.js';
import { DatabaseManager } from './dist/index.js';

const d = new DatabaseManager("asd");
const err = await d;
if (err[0])
    throw err[1];
