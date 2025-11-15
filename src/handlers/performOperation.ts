import {
  ParamValue,
  parseParamValueStrings,
  resolveValue,
} from '@src/models/paramValue';
import {
  getCollectionConfig,
  getCollectionEnv,
} from '@src/services/collectionService';
import { OperationNotFoundError } from '@src/errors/operationNotFound';
import { askForParams } from '@src/services/promptService';
import { buildRequestData, executeRequest } from '@src/services/requestService';

export const performOperation = async (
  collectionName: string,
  operationName: string,
  cliParams: string[]
) => {
  const collection = await getCollectionConfig(collectionName);
  const operation = collection.operations[operationName];

  if (!operation) {
    const availableOperations = Object.keys(collection.operations);
    throw new OperationNotFoundError(operationName, availableOperations);
  }

  const envValues = getCollectionEnv(collectionName);
  const cliValues = parseParamValueStrings(cliParams);

  const promptValues = await askForParams(
    'Provide the operation params',
    operation.params.map((param) => ({
      name: param.name,
      optional: param.optional,
      defaultValue: resolveValue(param, cliValues),
      disabled: envValues.some((value) => value.name === param.name),
    }))
  );

  const parsedValues: ParamValue[] = Object.entries(promptValues)
    .filter(([, value]) => value)
    .map(([name, value]) => ({
      name,
      value,
    }));
  const combinedValues = [...envValues, ...parsedValues];

  const requestData = buildRequestData(operation, combinedValues);

  const response = await executeRequest(requestData);

  await printResponse(response);
};

const printResponse = async (response: Response) => {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.log(text);
  }
};
