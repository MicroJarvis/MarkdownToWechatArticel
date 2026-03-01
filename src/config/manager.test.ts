import * as fs from 'fs';

// 必须在 import ConfigManager 之前 mock vscode 和 fs
jest.mock('vscode');
jest.mock('fs');

import { ConfigManager } from './manager';

const mockFs = fs as jest.Mocked<typeof fs>;

describe('ConfigManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置单例
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ConfigManager as any).instance = undefined;
  });

  function createManager(): ConfigManager {
    const manager = ConfigManager.getInstance();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (manager as any).configPath = '/mock/storage/config.json';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (manager as any).cachedConfig = undefined;
    return manager;
  }

  test('getInstance 返回单例', () => {
    const a = ConfigManager.getInstance();
    const b = ConfigManager.getInstance();
    expect(a).toBe(b);
  });

  test('配置文件不存在时返回默认模板', () => {
    mockFs.existsSync.mockReturnValue(false);
    const manager = createManager();
    const config = manager.get();
    expect(config.name).toBe('简约白');
    expect(config.h1).toBeDefined();
  });

  test('有缓存时不重复读文件', () => {
    mockFs.existsSync.mockReturnValue(false);
    const manager = createManager();
    manager.get();
    manager.get();
    expect(mockFs.readFileSync).not.toHaveBeenCalled();
  });

  test('读取已保存的配置并与默认模板合并', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ h1: { color: '#ff0000' } }));
    const manager = createManager();
    const config = manager.get();
    expect(config.h1.color).toBe('#ff0000');
    // 其他默认值保留
    expect(config.paragraph).toBeDefined();
  });

  test('配置文件损坏时使用默认模板并警告用户', () => {
    const vscode = require('vscode');
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('{ invalid json }');
    const manager = createManager();
    const config = manager.get();
    expect(config.name).toBe('简约白');
    expect(vscode.window.showWarningMessage).toHaveBeenCalled();
  });

  test('reset() 删除配置文件并清除缓存', async () => {
    mockFs.existsSync.mockReturnValue(true);
    const manager = createManager();
    await manager.reset();
    expect(mockFs.unlinkSync).toHaveBeenCalledWith('/mock/storage/config.json');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((manager as any).cachedConfig).toBeUndefined();
  });

  test('set() 写入失败时通知用户', async () => {
    const vscode = require('vscode');
    mockFs.existsSync.mockReturnValue(false);
    mockFs.writeFileSync.mockImplementation(() => { throw new Error('磁盘已满'); });
    const manager = createManager();
    await manager.set({ name: '测试' });
    expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
      expect.stringContaining('配置保存失败')
    );
  });
});
