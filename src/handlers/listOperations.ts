import { getCollectionConfig } from '@src/services/collectionService';

export const listOperations = async (collectionName: string) => {
  const config = await getCollectionConfig(collectionName);
  const operations = Object.keys(config.operations ?? []);

  if (!operations.length) {
    console.log('The collection is empty');
    return;
  }

  for (const name of operations) {
    console.log(name);
  }
};
