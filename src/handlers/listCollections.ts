import { getCollectionsList } from '@src/services/collectionService';
import { askForOption } from '@src/services/promptService';
import { listEnvironments } from '@src/handlers/listEnvironments';

export const listCollections = async () => {
  const collections = await getCollectionsList();

  if (!collections) {
    console.error('There are no collections available');
    return;
  }

  const collectionName = await askForOption('Pick a collection', collections);

  await listEnvironments(collectionName);
};
