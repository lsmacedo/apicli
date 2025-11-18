import { join } from 'path';
import { homedir } from 'os';
import dotenv from 'dotenv';
import { listFiles, readFile } from '@src/utils/file';
import { Collection, parseCollectionConfig } from '@src/models/collection';
import { ParamValue } from '@src/models/paramValue';

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
  return parseCollectionConfig(collectionName, await readFile(path));
};

export const getCollectionEnv = (
  collectionName: string,
  env: string | undefined
): ParamValue[] => {
  const paths = [join(getConfigPath(), `${collectionName}.env`)];
  if (env) {
    paths.push(join(getConfigPath(), `${collectionName}.env.${env}`));
  }

  const { parsed } = dotenv.config({ path: paths, quiet: true });

  return Object.entries(parsed ?? {}).map(([name, value]) => ({ name, value }));
};

export const getEnvironmentsList = async (
  collectionName: string
): Promise<string[]> => {
  const fileNames = await listFiles(getConfigPath());
  const regex = new RegExp(`${collectionName}\.env\.(.+)`);
  return fileNames
    .map((name) => name.match(regex)?.[1])
    .filter((match): match is string => !!match)
    .map((match) => match);
};
