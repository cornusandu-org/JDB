import { cpSync } from 'fs';

cpSync('assets/jdb', 'dist/assets', { recursive: true });
