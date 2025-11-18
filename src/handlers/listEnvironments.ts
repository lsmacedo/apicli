import { getEnvironmentsList } from '@src/services/collectionService';
import { listOperations } from '@src/handlers/listOperations';
import { askForOption } from '@src/services/promptService';

export const listEnvironments = async (collectionName: string) => {
  const environments = await getEnvironmentsList(collectionName);

  const env = environments.length
    ? await askForOption('Pick an environment', environments)
    : undefined;

  await listOperations(collectionName, env);
};
