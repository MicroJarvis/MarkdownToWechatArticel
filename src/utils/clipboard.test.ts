jest.mock('vscode');

import * as vscode from 'vscode';
import { copyTextToClipboard, copyHtmlToClipboard } from './clipboard';

const mockWriteText = vscode.env.clipboard.writeText as jest.Mock;

describe('copyTextToClipboard', () => {
  beforeEach(() => jest.clearAllMocks());

  test('成功时返回 true', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    expect(await copyTextToClipboard('Hello')).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('Hello');
  });

  test('写入失败时返回 false 而不抛出异常', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('剪贴板不可用'));
    expect(await copyTextToClipboard('Hello')).toBe(false);
  });
});

describe('copyHtmlToClipboard', () => {
  beforeEach(() => jest.clearAllMocks());

  test('无 extensionUri 时降级使用 VSCode clipboard', async () => {
    mockWriteText.mockResolvedValueOnce(undefined);
    const result = await copyHtmlToClipboard('<p>Hello</p>');
    expect(result).toBe(true);
  });

  test('降级失败时返回 false', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('fail'));
    const result = await copyHtmlToClipboard('<p>Hello</p>');
    expect(result).toBe(false);
  });
});
