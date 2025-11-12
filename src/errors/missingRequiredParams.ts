import { ParamDefinition } from '@src/models/param';

export class MissingRequiredParamsError extends Error {
  constructor(missingParams: ParamDefinition[]) {
    super(
      `Missing the following required params: ${missingParams.map((param) => param.name).join(', ')}`
    );
  }
}
