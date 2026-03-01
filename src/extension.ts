import * as vscode from 'vscode';
import { registerConvertCommand } from './commands/convert';
import { ConfigManager } from './config/manager';

/**
 * 插件激活
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('微信公众号 Markdown 排版工具已激活');

  // 初始化配置管理器
  ConfigManager.getInstance().initialize(context);

  // 注册转换命令
  registerConvertCommand(context);

  console.log('命令已注册: wechatFormatter.convert');
}

/**
 * 插件停用
 */
export function deactivate(): void {
  console.log('微信公众号 Markdown 排版工具已停用');
}