import fs from 'fs/promises';

export const listFiles = (path: string) => fs.readdir(path);

export const readFile = (path: string) =>
  fs.readFile(path, { encoding: 'utf8' });
