import { Operation } from '@src/models/collection';
import {
  ParamDefinition,
  ParamDefinitions,
  ParamLocation,
  ParamValues,
} from '@src/models/param';

type RequestData = {
  url: string;
  headers: Record<string, string>;
  body: URLSearchParams | undefined;
  method: string;
};

export const buildRequestData = (
  operation: Operation,
  paramValues: ParamValues
): RequestData => {
  const method = operation.method;
  const params = groupParamsByLocation(operation.params);

  const url = buildUrl(operation.url, params.query, params.path, paramValues);
  const headers = buildHeaders(params.headers, paramValues);
  const body = buildBody(operation.contentType, params.body, paramValues);

  return { url, headers, body, method };
};

export const executeRequest = async (requestData: RequestData) => {
  return fetch(requestData.url, {
    method: requestData.method,
    headers: requestData.headers,
    body: requestData.body,
  });
};

const groupParamsByLocation = (paramDefinitions: ParamDefinitions) => {
  const grouped: Record<ParamLocation, ParamDefinition[]> = {
    query: [],
    headers: [],
    path: [],
    body: [],
  };

  for (const param of Object.values(paramDefinitions)) {
    grouped[param.location].push(param);
  }

  return grouped;
};

const buildUrl = (
  url: string,
  queryParams: ParamDefinition[],
  pathParams: ParamDefinition[],
  paramValues: ParamValues
) => {
  const urlWithQueryParams = applyQueryParams(url, queryParams, paramValues);
  return applyPathParams(urlWithQueryParams, pathParams, paramValues);
};

const applyQueryParams = (
  url: string,
  queryParams: ParamDefinition[],
  paramValues: ParamValues
) => {
  const newUrl = new URL(url);
  for (const param of queryParams) {
    const value = paramValues[param.name] ?? param.default;
    newUrl.searchParams.append(param.name, value);
  }
  return newUrl.href;
};

const applyPathParams = (
  url: string,
  pathParams: ParamDefinition[],
  paramValues: ParamValues
) => {
  const newUrl = new URL(url);
  for (const param of pathParams) {
    const value = paramValues[param.name] ?? param.default;
    newUrl.pathname = newUrl.pathname.replace(`%7B${param}%7D`, value);
  }
  return newUrl.href;
};

const buildHeaders = (
  headerParams: ParamDefinition[],
  paramValues: ParamValues
) => {
  const headers: Record<string, string> = {};
  for (const param of headerParams) {
    const value = paramValues[param.name] ?? param.default;
    headers[param.name] = value;
  }
  return headers;
};

const buildBody = (
  contentType: Operation['contentType'],
  bodyParams: ParamDefinition[],
  paramValues: ParamValues
) => {
  switch (contentType) {
    case 'application/x-www-form-urlencoded':
      return buildSearchParams(bodyParams, paramValues);
  }
};

const buildSearchParams = (
  params: ParamDefinition[],
  paramValues: ParamValues
) => {
  const searchParams = new URLSearchParams();
  for (const param of params) {
    const value = paramValues[param.name] ?? param.default;
    searchParams.append(param.name, value);
  }
  return searchParams;
};
