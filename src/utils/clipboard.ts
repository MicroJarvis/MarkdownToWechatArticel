import * as vscode from 'vscode';

/**
 * 剪贴板工具
 * 处理 HTML 格式的复制操作
 */

/**
 * 将 HTML 复制到剪贴板
 * 使用 electron clipboard API 写入富文本格式
 *
 * @param html 要复制的 HTML 内容
 * @returns 是否成功
 */
export async function copyHtmlToClipboard(html: string): Promise<boolean> {
  // 尝试使用 electron clipboard API
  // VSCode 扩展运行在 electron 环境中
  try {
    // 在 VSCode 扩展环境中，可以通过 global 访问 electron
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const electronModule = (global as any).process?.versions?.electron;
    if (electronModule) {
      // 动态导入 electron（在 VSCode 扩展主机中可用）
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const electron = require('electron');
      if (electron && electron.clipboard && typeof electron.clipboard.writeHTML === 'function') {
        electron.clipboard.writeHTML(html);
        return true;
      }
    }
  } catch {
    // electron API 不可用，继续尝试降级方案
  }

  // 降级方案：使用 VSCode API 复制 HTML 文本
  // 注意：微信公众号编辑器可能无法正确解析粘贴的 HTML
  try {
    // 直接复制 HTML 源码，用户粘贴到微信后可能需要手动调整
    await vscode.env.clipboard.writeText(html);

    // 提示用户
    vscode.window.showInformationMessage(
      '已复制内容到剪贴板，请粘贴到微信公众号编辑器。如果样式丢失，请尝试粘贴为纯文本后重新格式化。'
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * 检查 electron clipboard API 是否可用
 */
export function isElectronClipboardAvailable(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const electron = require('electron');
    return !!(electron && electron.clipboard && typeof electron.clipboard.writeHTML === 'function');
  } catch {
    return false;
  }
}

/**
 * 复制纯文本到剪贴板
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await vscode.env.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}