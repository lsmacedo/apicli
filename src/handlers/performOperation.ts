import { MissingRequiredParamsError } from '@src/errors/missingRequiredParams';
import { OperationNotFoundError } from '@src/errors/operationNotFound';
import {
  ParamDefinitions,
  ParamValues,
  parseParamValueStrings,
} from '@src/models/param';
import {
  getCollectionConfig,
  getCollectionEnv,
} from '@src/services/collectionService';
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

  const paramValues: ParamValues = {
    ...getCollectionEnv(collectionName),
    ...parseParamValueStrings(cliParams),
  };

  const missingParams = getMissingParams(operation.params, paramValues);
  if (missingParams.length > 0) {
    throw new MissingRequiredParamsError(missingParams);
  }

  const requestData = buildRequestData(operation, paramValues);
  const response = await executeRequest(requestData);

  await printResponse(response);
};

const getMissingParams = (
  paramDefinitions: ParamDefinitions,
  paramValues: ParamValues
) =>
  Object.values(paramDefinitions).filter(
    (param) =>
      param.default === undefined &&
      !Object.keys(paramValues).includes(param.name)
  );

const printResponse = async (response: Response) => {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.log(text);
  }
};
