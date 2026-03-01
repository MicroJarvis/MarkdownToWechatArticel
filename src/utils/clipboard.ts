import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFileSync } from 'child_process';

/**
 * 剪贴板工具
 * 处理 HTML 格式的复制操作
 */

/**
 * macOS: 通过 osascript (JXA) 将 HTML 写入系统剪贴板
 * 使用 NSPasteboard 同时写入 HTML 和纯文本格式
 */
function copyHtmlMacOS(html: string): boolean {
  const tmpFile = path.join(os.tmpdir(), `wechat_copy_${Date.now()}.html`);
  try {
    fs.writeFileSync(tmpFile, html, 'utf8');
    const escapedPath = tmpFile.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    execFileSync('osascript', ['-l', 'JavaScript', '-e', `
      ObjC.import('AppKit');
      ObjC.import('Foundation');
      var p = '${escapedPath}';
      var html = $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null);
      var pb = $.NSPasteboard.generalPasteboard;
      pb.clearContents;
      pb.setStringForType(html, $.NSPasteboardTypeHTML);
      pb.setStringForType(html, $.NSPasteboardTypeString);
    `], { timeout: 10000 });
    return true;
  } catch {
    return false;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

/**
 * 将 HTML 复制到剪贴板（富文本格式）
 * macOS: 通过 osascript 调用 NSPasteboard 写入 HTML 格式
 * 其他平台: 降级为纯文本
 */
export async function copyHtmlToClipboard(html: string): Promise<boolean> {
  if (os.platform() === 'darwin') {
    if (copyHtmlMacOS(html)) {
      return true;
    }
  }

  // 降级方案：写入 HTML 源码字符串
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
