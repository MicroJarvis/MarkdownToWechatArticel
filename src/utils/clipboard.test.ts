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

  test('调用不应抛出异常', async () => {
    const result = await copyHtmlToClipboard('<p>Hello</p>');
    expect(typeof result).toBe('boolean');
  });
});
