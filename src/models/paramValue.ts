import { ParamDefinition } from '@src/models/collection';

export type ParamValue = {
  name: string;
  value: string;
};

export const parseParamValueStrings = (params: string[]) => {
  const paramValues: ParamValue[] = [];

  for (const param of params) {
    const equalSignIndex = param.indexOf('=');
    const name = param.slice(0, equalSignIndex);
    const value = param.slice(equalSignIndex + 1);

    paramValues.push({ name, value });
  }

  return paramValues;
};

export const resolveValue = (
  paramDefinition: Pick<ParamDefinition, 'name' | 'default'>,
  paramValues: ParamValue[]
) => {
  const value = paramValues.find(
    ({ name }) => name === paramDefinition.name
  )?.value;

  if (value !== undefined) {
    return value;
  }

  if (paramDefinition.default !== undefined) {
    return String(paramDefinition.default);
  }

  return undefined;
};

export const getMissingParams = (
  paramDefinitions: ParamDefinition[],
  paramValues: ParamValue[]
) =>
  paramDefinitions.filter(
    (param) =>
      param.default === undefined &&
      param.optional === false &&
      !paramValues.some(({ name }) => name === param.name)
  );
