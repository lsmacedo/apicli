export type ParamLocation = 'query' | 'headers' | 'path';

export type ParamDefinitions = Record<
  string,
  {
    name: string;
    location: 'query' | 'headers' | 'path';
  }
>;

export type ParamValues = Record<string, string>;

export const parseParamValueStrings = (params: string[]) => {
  const paramValues: ParamValues = {};

  for (const param of params) {
    const equalSignIndex = param.indexOf('=');
    const name = param.slice(0, equalSignIndex);
    const value = param.slice(equalSignIndex + 1);

    paramValues[name] = value;
  }

  return paramValues;
};
