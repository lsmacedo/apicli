import z from 'zod';

export type CollectionInput = z.input<typeof collectionFileSchema>;

export type Collection = {
  name: string;
  description: string;
  operations: Record<string, Operation>;
};

export type Operation = {
  name: string;
  url: string;
  method: Method;
  contentType: ContentType | undefined;
  bodyTemplate: string | undefined;
  params: ParamDefinition[];
};

export type ParamDefinition = {
  name: string;
  location: ParamLocation;
  optional: boolean;
  default: string | undefined;
};

export type Method = (typeof methods)[number];
export type ParamLocation = (typeof paramLocations)[number];
export type ContentType = (typeof contentTypes)[number];

export const methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const;
export const paramLocations = ['path', 'headers', 'query', 'body'] as const;
export const contentTypes = [
  'application/x-www-form-urlencoded',
  'application/json',
] as const;

const paramSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    optional: z.boolean().default(false),
    default: z.string().optional(),
  }),
]);

const collectionFileSchema = z.object({
  baseUrl: z.string().default(''),
  description: z.string().default(''),
  shared: z
    .record(
      z.string(),
      z.object({
        query: z.array(paramSchema).default([]),
        headers: z.array(paramSchema).default([]),
        body: z.array(paramSchema).default([]),
      })
    )
    .default({}),
  operations: z
    .record(
      z.string(),
      z.object({
        path: z.string(),
        method: z.enum(methods),
        contentType: z.enum(contentTypes).optional(),
        use: z.array(z.string()).default([]),
        bodyTemplate: z.any().optional(),
        params: z
          .object({
            path: z.array(paramSchema).default([]),
            headers: z.array(paramSchema).default([]),
            query: z.array(paramSchema).default([]),
            body: z.array(paramSchema).default([]),
          })
          .default({ path: [], headers: [], query: [], body: [] }),
      })
    )
    .default({}),
});

export const parseCollectionConfig = (
  collectionName: string,
  data: string
): Collection => {
  const collection = collectionFileSchema.parse(JSON.parse(data));

  const operations: Record<string, Operation> = {};
  for (const [name, operation] of Object.entries(collection.operations)) {
    const shared = {
      headers: [] as ParamDefinition[],
      query: [] as ParamDefinition[],
      body: [] as ParamDefinition[],
    };

    for (const s of ['headers', 'query', 'body'] as const) {
      for (const u of operation.use) {
        const params = collection.shared[u];
        shared[s].push(...parseParamsArray(params[s], s));
      }
    }

    const params = extractPathParams(operation.path, operation.params.path)
      .concat(shared.headers)
      .concat(parseParamsArray(operation.params.headers, 'headers'))
      .concat(shared.query)
      .concat(parseParamsArray(operation.params.query, 'query'))
      .concat(shared.body)
      .concat(extractBodyParams(operation.bodyTemplate, operation.params.body));

    operations[name] = {
      name,
      url: `${collection.baseUrl}${operation.path}`,
      method: operation.method,
      bodyTemplate: operation.bodyTemplate
        ? JSON.stringify(operation.bodyTemplate, null, 2)
        : undefined,
      contentType: operation.contentType ?? inferContentType(operation),
      params,
    };
  }

  return {
    name: collectionName,
    description: collection.description,
    operations,
  };
};

const parseParamsArray = (
  params: z.infer<typeof paramSchema>[],
  location: ParamLocation
): ParamDefinition[] => {
  const result: ParamDefinition[] = [];
  for (const param of params) {
    const parsed =
      typeof param === 'string' ? { name: param, optional: false } : param;

    result.push({
      name: parsed.name,
      location,
      optional: parsed.optional,
      default: parsed.default,
    });
  }
  return result;
};

const extractPathParams = (
  url: string,
  pathParams: z.infer<typeof paramSchema>[]
): ParamDefinition[] => {
  const inferredParams = parseParamsArray(
    [...url.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]),
    'path'
  );
  const definedParams = parseParamsArray(pathParams, 'path');
  return inferredParams.map(
    (param) => definedParams.find(({ name }) => name === param.name) ?? param
  );
};

const extractBodyParams = (
  bodyTemplate: string,
  bodyParams: z.infer<typeof paramSchema>[]
): ParamDefinition[] => {
  const definedParams = parseParamsArray(bodyParams, 'body');

  if (!bodyTemplate) {
    return definedParams;
  }

  const template = JSON.stringify(bodyTemplate, null, 2);
  const inferredParams = parseParamsArray(
    [...template.matchAll(/\{([^}\s]+)\}/g)].map((match) => match[1]),
    'body'
  );
  return inferredParams.map(
    (param) => definedParams.find(({ name }) => name === param.name) ?? param
  );
};

const inferContentType = (
  operation: z.infer<typeof collectionFileSchema>['operations'][string]
): ContentType | undefined => {
  if (!operation.bodyTemplate) {
    return undefined;
  }
  return 'application/json';
};
