export class OperationNotFoundError extends Error {
  constructor(operationName: string, availableOperations: string[]) {
    super(
      `Operation "${operationName}" not found.\nAvailable operations: ${availableOperations.join(', ')}`
    );
  }
}
