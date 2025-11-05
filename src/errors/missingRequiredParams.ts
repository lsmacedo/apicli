export class MissingRequiredParamsError extends Error {
  constructor(missingParams: string[]) {
    super(`Missing the following required params: ${missingParams.join(', ')}`);
  }
}
