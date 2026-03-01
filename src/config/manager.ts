import * as vscode from 'vscode';
import { TemplateConfig, mergeTemplates } from '../templates/types';
import { getDefaultTemplate } from '../templates/default';

const CONFIG_SECTION = 'wechatFormatter';

/**
 * 配置管理器
 * 封装 VSCode workspace configuration 的读写操作
 */
export class ConfigManager {
  private static instance: ConfigManager;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取当前配置
   */
  public get(): TemplateConfig {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const defaultTemplate = getDefaultTemplate();

    // 从 VSCode 配置中读取覆盖值
    const overrides = this.loadOverridesFromConfig(config);

    // 合并默认模板和用户覆盖
    return mergeTemplates(defaultTemplate, overrides);
  }

  /**
   * 设置配置（增量更新）
   */
  public async set(partialConfig: Partial<TemplateConfig>): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

    // 将部分配置保存到 VSCode 设置
    for (const [key, value] of Object.entries(partialConfig)) {
      if (value !== undefined) {
        await config.update(key, value, vscode.ConfigurationTarget.Global);
      }
    }
  }

  /**
   * 重置为默认配置
   */
  public async reset(): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

    // 获取所有配置键
    const keys = Object.keys(config);

    // 删除所有自定义配置
    for (const key of keys) {
      try {
        await config.update(key, undefined, vscode.ConfigurationTarget.Global);
      } catch {
        // 忽略删除失败
      }
    }
  }

  /**
   * 获取当前模板名称
   */
  public getTemplateName(): string {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return config.get<string>('templateName') || '简约白';
  }

  /**
   * 设置模板名称
   */
  public async setTemplateName(name: string): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    await config.update('templateName', name, vscode.ConfigurationTarget.Global);
  }

  /**
   * 从 VSCode 配置加载覆盖值
   */
  private loadOverridesFromConfig(config: vscode.WorkspaceConfiguration): Partial<TemplateConfig> {
    const overrides: Partial<TemplateConfig> = {};

    // 读取各个元素样式的覆盖
    const elementKeys: (keyof TemplateConfig)[] = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'paragraph', 'link', 'blockquote',
      'ul', 'ol', 'li',
      'code', 'codeBlock',
      'table', 'tableHeader', 'tableCell',
      'hr', 'image', 'container',
    ];

    for (const key of elementKeys) {
      const value = config.get<Record<string, unknown>>(key);
      if (value && Object.keys(value).length > 0) {
        (overrides as Record<string, unknown>)[key] = value;
      }
    }

    return overrides;
  }

  /**
   * 监听配置变化
   */
  public onDidChange(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(CONFIG_SECTION)) {
        callback();
      }
    });
  }
}

/**
 * 导出单例访问方法
 */
export function getConfig(): TemplateConfig {
  return ConfigManager.getInstance().get();
}

export function setConfig(config: Partial<TemplateConfig>): Promise<void> {
  return ConfigManager.getInstance().set(config);
}

export function resetConfig(): Promise<void> {
  return ConfigManager.getInstance().reset();
}