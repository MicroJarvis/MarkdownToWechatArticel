/**
 * VSCode API Mock，用于 Jest 单元测试
 */

export const window = {
  showErrorMessage: jest.fn().mockResolvedValue(undefined),
  showInformationMessage: jest.fn().mockResolvedValue(undefined),
  showWarningMessage: jest.fn().mockResolvedValue(undefined),
  createWebviewPanel: jest.fn(),
  activeTextEditor: undefined as unknown,
};

export const workspace = {
  onDidChangeTextDocument: jest.fn().mockReturnValue({ dispose: jest.fn() }),
  getConfiguration: jest.fn().mockReturnValue({
    get: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
  }),
};

export const env = {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
};

export const commands = {
  registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
};

export const Uri = {
  file: jest.fn((path: string) => ({ fsPath: path })),
  joinPath: jest.fn(),
};

export enum ViewColumn {
  One = 1,
  Two = 2,
  Three = 3,
}

export const ExtensionContext = jest.fn();
