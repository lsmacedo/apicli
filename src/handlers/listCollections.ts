import { getCollectionsList } from '@src/services/collectionService';

export const listCollections = async () => {
  const collections = await getCollectionsList();

  if (!collections) {
    console.log('There are no collections available');
    return;
  }

  for (const collection of collections) {
    console.log(collection);
  }
};
