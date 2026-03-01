import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { TemplateConfig, mergeTemplates } from '../templates/types';
import { getDefaultTemplate } from '../templates/default';

const CONFIG_FILE_NAME = 'wechat-formatter-config.json';

/**
 * 配置管理器
 * 使用 JSON 文件存储配置，支持嵌套对象
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private configPath: string | undefined;
  private cachedConfig: TemplateConfig | undefined;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 初始化配置路径
   */
  public initialize(context: vscode.ExtensionContext): void {
    // 使用全局存储路径
    this.configPath = path.join(context.globalStorageUri.fsPath, CONFIG_FILE_NAME);

    // 确保目录存在
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 获取当前配置
   */
  public get(): TemplateConfig {
    // 如果有缓存，直接返回
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    const defaultTemplate = getDefaultTemplate();

    // 如果没有配置文件，返回默认模板
    if (!this.configPath || !fs.existsSync(this.configPath)) {
      this.cachedConfig = defaultTemplate;
      return defaultTemplate;
    }

    try {
      const content = fs.readFileSync(this.configPath, 'utf-8');
      const savedConfig = JSON.parse(content) as Partial<TemplateConfig>;

      // 合并默认模板和保存的配置
      const merged = mergeTemplates(defaultTemplate, savedConfig);
      this.cachedConfig = merged;
      return merged;
    } catch (error) {
      console.error('读取配置失败:', error);
      this.cachedConfig = defaultTemplate;
      return defaultTemplate;
    }
  }

  /**
   * 设置配置（增量更新）
   */
  public async set(partialConfig: Partial<TemplateConfig>): Promise<void> {
    if (!this.configPath) {
      console.error('配置路径未初始化');
      return;
    }

    // 获取当前配置
    const currentConfig = this.get();

    // 合并新配置
    const merged = mergeTemplates(currentConfig, partialConfig);
    this.cachedConfig = merged;

    // 保存到文件
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(merged, null, 2), 'utf-8');
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  }

  /**
   * 重置为默认配置
   */
  public async reset(): Promise<void> {
    if (!this.configPath) {
      return;
    }

    // 删除配置文件
    if (fs.existsSync(this.configPath)) {
      fs.unlinkSync(this.configPath);
    }

    // 清除缓存
    this.cachedConfig = undefined;
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cachedConfig = undefined;
  }
}

/**
 * 导出便捷方法
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