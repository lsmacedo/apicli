import {
  Operation,
  ParamDefinition,
  ParamLocation,
} from '@src/models/collection';
import { ParamValue, resolveValue } from '@src/models/paramValue';

type RequestData = {
  url: string;
  headers: Record<string, string>;
  body: URLSearchParams | string | undefined;
  method: string;
};

export const buildRequestData = (
  operation: Operation,
  paramValues: ParamValue[]
): RequestData => {
  const method = operation.method;
  const params = groupParamsByLocation(operation.params);

  const url = buildUrl(operation.url, params.query, params.path, paramValues);
  const headers = buildHeaders(operation, params.headers, paramValues);
  const body = buildBody(operation, params.body, paramValues);

  return { url, headers, body, method };
};

export const executeRequest = async (requestData: RequestData) => {
  return fetch(requestData.url, {
    method: requestData.method,
    headers: requestData.headers,
    body: requestData.body,
  });
};

const groupParamsByLocation = (paramDefinitions: ParamDefinition[]) => {
  const grouped: Record<ParamLocation, ParamDefinition[]> = {
    query: [],
    headers: [],
    path: [],
    body: [],
  };

  for (const param of paramDefinitions) {
    grouped[param.location].push(param);
  }

  return grouped;
};

const buildUrl = (
  url: string,
  queryParams: ParamDefinition[],
  pathParams: ParamDefinition[],
  paramValues: ParamValue[]
) => {
  const urlWithQueryParams = applyQueryParams(url, queryParams, paramValues);
  return applyPathParams(urlWithQueryParams, pathParams, paramValues);
};

const applyQueryParams = (
  url: string,
  queryParams: ParamDefinition[],
  paramValues: ParamValue[]
) => {
  const newUrl = new URL(url);
  for (const param of queryParams) {
    const value = resolveValue(param, paramValues);
    if (value) {
      newUrl.searchParams.append(param.name, value);
    }
  }
  return newUrl.href;
};

const applyPathParams = (
  url: string,
  pathParams: ParamDefinition[],
  paramValues: ParamValue[]
) => {
  const newUrl = new URL(url);
  for (const param of pathParams) {
    const value = resolveValue(param, paramValues);
    if (value) {
      newUrl.pathname = newUrl.pathname.replace(`%7B${param.name}%7D`, value);
    }
  }
  return newUrl.href;
};

const buildHeaders = (
  operation: Operation,
  headerParams: ParamDefinition[],
  paramValues: ParamValue[]
) => {
  const headers: Record<string, string> = {};

  if (operation.contentType) {
    headers['Content-Type'] = operation.contentType;
  }

  for (const param of headerParams) {
    const value = resolveValue(param, paramValues);
    if (value) {
      headers[param.name] = value;
    }
  }
  return headers;
};

const buildBody = (
  operation: Operation,
  bodyParams: ParamDefinition[],
  paramValues: ParamValue[]
) => {
  switch (operation.contentType) {
    case 'application/x-www-form-urlencoded':
      return buildSearchParams(bodyParams, paramValues);
    case 'application/json':
      return buildJsonBody(operation.bodyTemplate, bodyParams, paramValues);
  }
};

const buildSearchParams = (
  params: ParamDefinition[],
  paramValues: ParamValue[]
) => {
  const searchParams = new URLSearchParams();
  for (const param of params) {
    const value = resolveValue(param, paramValues);
    if (value) {
      searchParams.append(param.name, value);
    }
  }
  return searchParams;
};

const buildJsonBody = (
  bodyTemplate: string | undefined,
  paramDefinitions: ParamDefinition[],
  paramValues: ParamValue[]
) => {
  if (!bodyTemplate) {
    return '';
  }

  return paramDefinitions.reduce((acc, curr) => {
    const value = resolveValue(curr, paramValues);
    return value !== undefined
      ? acc.replace(new RegExp(`{${curr.name}}`, 'g'), value)
      : acc;
  }, bodyTemplate);
};
