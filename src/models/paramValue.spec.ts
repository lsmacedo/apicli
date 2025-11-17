import { ParamValue, parseParamValueStrings, resolveValue } from './paramValue';

describe('parseParamValueStrings', () => {
  it('handles empty array', () => {
    expect(parseParamValueStrings([])).toEqual([]);
  });

  it('parses key/value pairs into a ParamValue array', () => {
    const params = ['key=value', 'foo=bar', 'a=b'];
    const expected: ParamValue[] = [
      { name: 'key', value: 'value' },
      { name: 'foo', value: 'bar' },
      { name: 'a', value: 'b' },
    ];

    expect(parseParamValueStrings(params)).toEqual(expected);
  });
});

describe('resolveValue', () => {
  const paramValues = [
    { name: 'foo', value: 'bar' },
    { name: 'a', value: 'b' },
  ];

  describe('if value is not set', () => {
    it('returns default value', () => {
      const paramDefinition = { name: 'key', default: 'value' };
      expect(resolveValue(paramDefinition, paramValues)).toEqual('value');
    });

    it("returns undefined if there's no default value", () => {
      const paramDefinition = { name: 'key', default: undefined };
      expect(resolveValue(paramDefinition, paramValues)).toEqual(undefined);
    });
  });

  describe('if value is set', () => {
    it('returns the value if it is set', () => {
      const paramDefinition = { name: 'foo', default: undefined };
      expect(resolveValue(paramDefinition, paramValues)).toEqual('bar');
    });
  });
});
