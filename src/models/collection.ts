import z from 'zod';
import { ParamDefinitions, ParamLocation } from '@src/models/param';

export type Collection = {
  operations: Record<string, Operation>;
};

export type Operation = {
  name: string;
  url: string;
  method: string;
  params: ParamDefinitions;
};

const collectionFileSchema = z.object({
  baseUrl: z.string().default(''),
  shared: z
    .record(
      z.string(),
      z.object({
        query: z.array(z.string()).default([]),
        headers: z.array(z.string()).default([]),
      })
    )
    .default({}),
  operations: z
    .record(
      z.string(),
      z.object({
        path: z.string(),
        method: z.enum(['GET']),
        use: z.array(z.string()).default([]),
        query: z.array(z.string()).default([]),
        headers: z.array(z.string()).default([]),
      })
    )
    .default({}),
});

export const parseCollectionConfig = (data: string): Collection => {
  const collection = collectionFileSchema.parse(JSON.parse(data));

  const sharedParams: Record<string, ParamDefinitions> = {};
  for (const [name, config] of Object.entries(collection.shared)) {
    sharedParams[name] = {
      ...parseParamsArray(config.headers, 'headers'),
      ...parseParamsArray(config.query, 'query'),
    };
  }

  const operations: Record<string, Operation> = {};
  for (const [name, operation] of Object.entries(collection.operations)) {
    const params: ParamDefinitions = {};

    for (const sharedName of operation.use) {
      Object.assign(params, sharedParams[sharedName]);
    }

    Object.assign(params, parseParamsArray(operation.headers, 'headers'));
    Object.assign(params, parseParamsArray(operation.query, 'query'));
    Object.assign(params, extractPathParams(operation.path));

    operations[name] = {
      name,
      url: `${collection.baseUrl}${operation.path}`,
      method: operation.method,
      params,
    };
  }

  return {
    operations,
  };
};

const parseParamsArray = (
  params: string[],
  location: ParamLocation
): ParamDefinitions => {
  const result: ParamDefinitions = {};
  for (const param of params) {
    result[param] = { name: param, location };
  }
  return result;
};

const extractPathParams = (url: string): ParamDefinitions =>
  parseParamsArray(
    [...url.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]),
    'path'
  );
