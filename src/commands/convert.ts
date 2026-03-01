import * as vscode from 'vscode';
import { WebviewPanelManager } from '../webview/panel';

let documentChangeListener: vscode.Disposable | undefined;
let isListenerRegistered: boolean = false;

/**
 * 转换命令
 * 获取当前 Markdown 文件内容并打开预览面板
 */
export async function convertCommand(context: vscode.ExtensionContext): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  // 检查是否有活动编辑器
  if (!editor) {
    vscode.window.showErrorMessage('没有打开的文件');
    return;
  }

  // 检查是否为 Markdown 文件
  const document = editor.document;
  if (document.languageId !== 'markdown') {
    vscode.window.showErrorMessage('请在 Markdown 文件中执行此命令');
    return;
  }

  // 获取 Markdown 内容
  const markdown = document.getText();

  try {
    // 使用 context.extensionUri 作为扩展 URI
    const extensionUri = context.extensionUri;
    const panelManager = WebviewPanelManager.getInstance(extensionUri);

    // 设置文档变化监听器（实时预览）- 只注册一次
    if (!isListenerRegistered) {
      setupDocumentChangeListener(context, panelManager);
      isListenerRegistered = true;
    }

    // 显示预览
    await panelManager.show(markdown);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`转换失败: ${errorMessage}`);
  }
}

/**
 * 设置文档变化监听器，实现实时预览
 */
function setupDocumentChangeListener(context: vscode.ExtensionContext, panelManager: WebviewPanelManager): void {
  // 防抖计时器 - 使用 ReturnType<typeof setTimeout> 兼容浏览器和 Node.js 环境
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  // 监听文档变化
  documentChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
    const document = event.document;

    // 只处理 Markdown 文件
    if (document.languageId !== 'markdown') {
      return;
    }

    // 防抖处理：300ms 内的变化只触发一次更新
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      const markdown = document.getText();
      panelManager.updateContent(markdown);
    }, 300);
  });

  context.subscriptions.push(documentChangeListener);
}

/**
 * 注册转换命令
 */
export function registerConvertCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand(
    'wechatFormatter.convert',
    () => convertCommand(context)
  );

  context.subscriptions.push(command);
}