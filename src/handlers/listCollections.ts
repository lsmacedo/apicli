import { getCollectionsList } from '@src/services/collectionService';
import { askForOption } from '@src/services/promptService';
import { listOperations } from '@src/handlers/listOperations';

export const listCollections = async () => {
  const collections = await getCollectionsList();

  if (!collections) {
    console.error('There are no collections available');
    return;
  }

  const collectionName = await askForOption('Pick a collection', collections);

  await listOperations(collectionName);
};
