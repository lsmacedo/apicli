import { join } from 'path';
import { homedir } from 'os';
import dotenv from 'dotenv';
import { listFiles, readFile } from '@src/utils/file';
import { Collection, parseCollectionConfig } from '@src/models/collection';

export const getConfigPath = () => join(homedir(), '.apicli');

export const getCollectionsList = async () => {
  const fileNames = await listFiles(getConfigPath());
  return fileNames
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, name.length - '.json'.length));
};

export const getCollectionConfig = async (
  collectionName: string
): Promise<Collection> => {
  const path = join(getConfigPath(), `${collectionName}.json`);
  return parseCollectionConfig(await readFile(path));
};

export const getCollectionEnv = (
  collectionName: string
): Record<string, string> => {
  const path = join(getConfigPath(), `${collectionName}.env`);
  const { parsed } = dotenv.config({ path, quiet: true });
  return parsed || {};
};
