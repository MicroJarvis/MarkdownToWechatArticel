import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFileSync } from 'child_process';

/**
 * 剪贴板工具
 * 处理 HTML 格式的复制操作
 */

let compiledBinaryPath: string | undefined;

/**
 * 获取/编译 html_to_clipboard 二进制工具路径
 * Swift 源文件打包在插件 resources/ 目录，首次调用时编译到用户临时目录
 */
function getOrCompileBinary(extensionUri: vscode.Uri): string | undefined {
  // 已编译过，直接返回
  if (compiledBinaryPath && fs.existsSync(compiledBinaryPath)) {
    return compiledBinaryPath;
  }

  const swiftSrc = path.join(extensionUri.fsPath, 'resources', 'html_to_clipboard.swift');
  if (!fs.existsSync(swiftSrc)) {
    return undefined;
  }

  const binaryPath = path.join(os.tmpdir(), 'wechat_formatter_html_to_clipboard');
  try {
    execFileSync('swiftc', [swiftSrc, '-o', binaryPath], { timeout: 30000 });
    compiledBinaryPath = binaryPath;
    return binaryPath;
  } catch {
    return undefined;
  }
}

/**
 * 将 HTML 复制到剪贴板（富文本格式）
 * macOS：通过预编译的 Swift 工具写入 NSPasteboard HTML 类型
 * 其他平台降级为纯文本
 */
export async function copyHtmlToClipboard(html: string, extensionUri?: vscode.Uri): Promise<boolean> {
  if (os.platform() === 'darwin' && extensionUri) {
    try {
      const binary = getOrCompileBinary(extensionUri);
      if (binary) {
        execFileSync(binary, [html], { timeout: 5000 });
        return true;
      }
    } catch {
      // 降级到纯文本方案
    }
  }

  // 降级方案：写入 HTML 源码字符串（样式可能丢失）
  try {
    await vscode.env.clipboard.writeText(html);
    return true;
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
