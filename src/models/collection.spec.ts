import {
  Collection,
  CollectionInput,
  Operation,
  ParamDefinition,
  parseCollectionConfig,
} from './collection';

describe('parseCollectionConfig', () => {
  const collectionName = '<collection>';

  describe('collections', () => {
    it('parses empty collection', () => {
      const data = collectionInputToString({});
      const expected = buildCollection(collectionName, {});

      expect(parseCollectionConfig(collectionName, data)).toEqual(expected);
    });

    it('parses collection description', () => {
      const description = '<description>';

      const data = collectionInputToString({ description });
      const expected = buildCollection(collectionName, { description });

      expect(parseCollectionConfig(collectionName, data)).toEqual(expected);
    });
  });

  describe('operations', () => {
    it('parses basic params', () => {
      const data = collectionInputToString({
        operations: {
          o1: {
            path: '<path>',
            method: 'POST',
            contentType: 'application/json',
          },
        },
      });
      const expected = buildOperations({
        o1: {
          url: '<path>',
          method: 'POST',
          contentType: 'application/json',
        },
      });

      expect(parseCollectionConfig(collectionName, data).operations).toEqual(
        expected
      );
    });

    it('prefixes operation url with baseUrl', () => {
      const data = collectionInputToString({
        baseUrl: '<base_url>',
        operations: {
          o1: {
            path: '<path1>',
            method: 'GET',
          },
          o2: {
            path: '<path2>',
            method: 'GET',
          },
        },
      });
      const expected = buildOperations({
        o1: { url: '<base_url><path1>' },
        o2: { url: '<base_url><path2>' },
      });

      expect(parseCollectionConfig(collectionName, data).operations).toEqual(
        expected
      );
    });
  });

  describe('operation params', () => {
    const path = '<path>';
    const method = 'GET';

    it('extracts path params from url', () => {
      const data = collectionInputToString({
        operations: {
          o1: {
            path: '/foo/{param1}/bar/{param2}',
            method,
          },
        },
      });
      const expected = [
        buildParamDefinition({ name: 'param1', location: 'path' }),
        buildParamDefinition({ name: 'param2', location: 'path' }),
      ];

      expect(
        parseCollectionConfig(collectionName, data).operations['o1'].params
      ).toEqual(expected);
    });

    it('overrides inferred path param definitions with params.path', () => {
      const data = collectionInputToString({
        operations: {
          o1: {
            path: '/foo/{param1}/bar/{param2}/test/{param3}',
            method,
            params: {
              path: [
                { name: 'param1', default: 'value' },
                { name: 'param2', optional: true },
              ],
            },
          },
        },
      });
      const expected = [
        buildParamDefinition({
          name: 'param1',
          location: 'path',
          default: 'value',
        }),
        buildParamDefinition({
          name: 'param2',
          location: 'path',
          optional: true,
        }),
        buildParamDefinition({
          name: 'param3',
          location: 'path',
        }),
      ];

      expect(
        parseCollectionConfig(collectionName, data).operations['o1'].params
      ).toEqual(expected);
    });

    it('parses compact params list', () => {
      const data = collectionInputToString({
        operations: {
          o1: {
            path,
            method,
            params: {
              query: ['q1', 'q2', 'q3'],
              headers: ['h1', 'h2'],
              body: ['b1', 'b2', 'b3'],
            },
          },
        },
      });
      const expected = [
        buildParamDefinition({ name: 'h1', location: 'headers' }),
        buildParamDefinition({ name: 'h2', location: 'headers' }),
        buildParamDefinition({ name: 'q1', location: 'query' }),
        buildParamDefinition({ name: 'q2', location: 'query' }),
        buildParamDefinition({ name: 'q3', location: 'query' }),
        buildParamDefinition({ name: 'b1', location: 'body' }),
        buildParamDefinition({ name: 'b2', location: 'body' }),
        buildParamDefinition({ name: 'b3', location: 'body' }),
      ];

      expect(
        parseCollectionConfig(collectionName, data).operations['o1'].params
      ).toEqual(expected);
    });

    it('parses complete params list', () => {
      const data = collectionInputToString({
        operations: {
          o1: {
            path,
            method,
            params: {
              query: [
                { name: 'q1', optional: true },
                { name: 'q2', default: 'dq2' },
              ],
              headers: [{ name: 'h1' }],
              body: [{ name: 'b1', default: 'db1' }],
            },
          },
        },
      });
      const expected = [
        buildParamDefinition({ name: 'h1', location: 'headers' }),
        buildParamDefinition({ name: 'q1', optional: true, location: 'query' }),
        buildParamDefinition({ name: 'q2', default: 'dq2', location: 'query' }),
        buildParamDefinition({ name: 'b1', default: 'db1', location: 'body' }),
      ];

      expect(
        parseCollectionConfig(collectionName, data).operations['o1'].params
      ).toEqual(expected);
    });
  });

  describe('shared params', () => {
    it('appends shared params operations', () => {
      const data = collectionInputToString({
        shared: {
          s1: {
            headers: ['sh1'],
            query: ['sq1', 'sq2'],
            body: ['sb1'],
          },
          s2: {
            query: ['sq3'],
          },
        },
        operations: {
          o1: {
            path: '<path1>',
            method: 'GET',
            use: ['s1', 's2'],
            params: {
              headers: ['h1'],
              query: ['q1'],
              body: ['b1', 'b2'],
            },
          },
        },
      });
      const expected = [
        buildParamDefinition({ name: 'sh1', location: 'headers' }),
        buildParamDefinition({ name: 'h1', location: 'headers' }),
        buildParamDefinition({ name: 'sq1', location: 'query' }),
        buildParamDefinition({ name: 'sq2', location: 'query' }),
        buildParamDefinition({ name: 'sq3', location: 'query' }),
        buildParamDefinition({ name: 'q1', location: 'query' }),
        buildParamDefinition({ name: 'sb1', location: 'body' }),
        buildParamDefinition({ name: 'b1', location: 'body' }),
        buildParamDefinition({ name: 'b2', location: 'body' }),
      ];

      expect(
        parseCollectionConfig(collectionName, data).operations['o1'].params
      ).toEqual(expected);
    });
  });
});

const collectionInputToString = (input: CollectionInput) =>
  JSON.stringify(input);

const buildCollection = (
  name: string,
  data: Partial<Collection>
): Collection => ({
  name,
  description: data.description ?? '',
  operations: data.operations ?? {},
});

const buildOperations = (
  operations: Record<string, Partial<Operation>>
): Record<string, Operation> =>
  Object.entries(operations).reduce(
    (acc, [name, data]) => ({
      ...acc,
      [name]: {
        name: data.name ?? name,
        url: data.url ?? '',
        method: data.method ?? 'GET',
        contentType: data.contentType,
        bodyTemplate: data.bodyTemplate,
        params: data.params ?? [],
      },
    }),
    {}
  );

const buildParamDefinition = (
  data: Partial<ParamDefinition>
): ParamDefinition => ({
  name: data.name ?? '',
  location: data.location ?? 'path',
  optional: data.optional ?? false,
  default: data.default ?? undefined,
});
