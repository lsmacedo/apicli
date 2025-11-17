import { getCollectionConfig } from '@src/services/collectionService';
import { askForOption } from '@src/services/promptService';
import { performOperation } from '@src/handlers/performOperation';

export const listOperations = async (collectionName: string) => {
  const config = await getCollectionConfig(collectionName);
  const operations = Object.values(config.operations ?? []).sort((a, b) =>
    a.name < b.name ? -1 : 1
  );

  if (!operations.length) {
    console.error('The collection is empty');
    return;
  }

  const operation = await askForOption(
    'Pick an operation',
    operations.map(({ name }) => name)
  );

  await performOperation(collectionName, operation, []);
};
