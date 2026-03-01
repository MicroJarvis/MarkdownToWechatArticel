import * as vscode from 'vscode';
import { TemplateConfig, ElementStyle } from '../templates/types';
import { ConfigManager } from '../config/manager';
import {
  ExtensionToWebviewMessage,
  WebviewToExtensionMessage,
  CONFIGURABLE_ELEMENTS,
} from './messageTypes';
import { convertToWechat, getConversionWarning } from '../converter';

/**
 * Webview Panel 管理器
 */
export class WebviewPanelManager {
  private static instance: WebviewPanelManager | undefined;
  private panel: vscode.WebviewPanel | undefined;
  private readonly extensionUri: vscode.Uri;
  private readonly configManager: ConfigManager;
  private currentMarkdown: string = '';
  private disposables: vscode.Disposable[] = [];

  private constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
    this.configManager = ConfigManager.getInstance();
  }

  public static getInstance(extensionUri: vscode.Uri): WebviewPanelManager {
    if (!WebviewPanelManager.instance) {
      WebviewPanelManager.instance = new WebviewPanelManager(extensionUri);
    }
    return WebviewPanelManager.instance;
  }

  public async show(markdown: string): Promise<void> {
    this.currentMarkdown = markdown;

    if (this.panel) {
      this.panel.reveal();
      await this.updatePreview();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'wechatFormatter',
      '微信排版预览',
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    this.panel.webview.html = this.getWebviewContent();

    this.panel.webview.onDidReceiveMessage(
      async (message: WebviewToExtensionMessage) => {
        await this.handleMessage(message);
      },
      null,
      this.disposables
    );

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
        this.dispose();
      },
      null,
      this.disposables
    );
  }

  /**
   * 更新内容（实时预览）
   */
  public async updateContent(markdown: string): Promise<void> {
    if (!this.panel) {
      return;
    }

    this.currentMarkdown = markdown;
    await this.updatePreview();
  }

  private async handleMessage(message: WebviewToExtensionMessage): Promise<void> {
    switch (message.type) {
      case 'ready':
        await this.sendInitialData();
        break;

      case 'updateConfig':
        if (message.payload.config) {
          await this.configManager.set(message.payload.config);
          await this.updatePreview();
        }
        break;

      case 'resetConfig':
        await this.configManager.reset();
        await this.sendConfig();
        await this.updatePreview();
        break;

      case 'copySuccess':
        vscode.window.showInformationMessage('已复制到剪贴板，可直接粘贴到微信公众号编辑器');
        break;

      case 'copyError':
        vscode.window.showErrorMessage('复制失败，请重试');
        break;
    }
  }

  private async sendInitialData(): Promise<void> {
    const warning = getConversionWarning(this.currentMarkdown);
    if (warning) {
      await this.sendMessage({
        type: 'showWarning',
        payload: { message: warning },
      });
    }

    await this.sendConfig();
    await this.updatePreview();
  }

  private async sendConfig(): Promise<void> {
    const config = this.configManager.get();
    await this.sendMessage({
      type: 'loadConfig',
      payload: { config },
    });
  }

  private async updatePreview(): Promise<void> {
    if (!this.currentMarkdown || !this.panel) {
      return;
    }

    try {
      const config = this.configManager.get();
      const html = await convertToWechat(this.currentMarkdown, config);
      await this.sendMessage({
        type: 'updatePreview',
        payload: { html },
      });
    } catch (error) {
      await this.sendMessage({
        type: 'showError',
        payload: {
          message: `转换失败: ${error instanceof Error ? error.message : String(error)}`,
        },
      });
    }
  }

  private async sendMessage(message: ExtensionToWebviewMessage): Promise<void> {
    if (this.panel) {
      await this.panel.webview.postMessage(message);
    }
  }

  private getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>微信排版预览</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #f0f0f0;
    }
    .main-container {
      display: flex;
      width: 100%;
      height: 100%;
    }
    /* 预览区域 - 模拟手机屏幕 */
    .preview-wrapper {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px;
      background: #e8e8e8;
      overflow-y: auto;
    }
    .phone-frame {
      width: 375px;
      min-height: 667px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      overflow: hidden;
    }
    .phone-header {
      height: 44px;
      background: #ededed;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #333;
      border-bottom: 1px solid #ddd;
    }
    .preview-container {
      overflow-y: auto;
      max-height: calc(100vh - 100px);
      background: #fff;
      /* 不添加额外样式，让转换后的 HTML 样式完全生效 */
    }
    /* 配置面板 */
    .config-container {
      width: 320px;
      overflow-y: auto;
      padding: 20px;
      background: #f5f5f5;
      border-left: 1px solid #ddd;
    }
    .config-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ddd;
    }
    .config-header h2 { font-size: 16px; color: #333; }
    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-primary { background: #42b983; color: #fff; }
    .btn-secondary { background: #fff; color: #666; border: 1px solid #ddd; }
    .btn:hover { opacity: 0.9; }
    .config-section {
      margin-bottom: 20px;
      background: #fff;
      border-radius: 6px;
      padding: 15px;
    }
    .config-section h3 {
      font-size: 14px;
      color: #333;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .config-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .config-row label {
      width: 80px;
      font-size: 13px;
      color: #666;
    }
    .config-row input, .config-row select {
      flex: 1;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
    }
    .config-row input[type="color"] {
      width: 60px;
      padding: 2px;
    }
    .config-row .unit {
      margin-left: 5px;
      font-size: 12px;
      color: #999;
    }
    .warning-banner {
      background: #fff3cd;
      color: #856404;
      padding: 10px 15px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 13px;
    }
    .error-banner {
      background: #f8d7da;
      color: #721c24;
      padding: 10px 15px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 13px;
    }
    .copy-btn-container {
      position: sticky;
      bottom: 0;
      background: #f5f5f5;
      padding: 15px 0;
      margin-top: 15px;
      border-top: 1px solid #ddd;
    }
    .copy-btn-container .btn {
      width: 100%;
      padding: 12px;
      font-size: 14px;
    }
    /* 预览内容样式重置 */
    .preview-container >>> img { max-width: 100% !important; height: auto !important; }
  </style>
</head>
<body>
  <div class="main-container">
    <div class="preview-wrapper">
      <div class="phone-frame">
        <div class="phone-header">预览效果</div>
        <div class="preview-container" id="preview">
          <p style="color: #999; text-align: center; padding: 40px;">加载中...</p>
        </div>
      </div>
    </div>

    <div class="config-container">
      <div class="config-header">
        <h2>模板配置</h2>
        <button class="btn btn-secondary" onclick="resetConfig()">重置</button>
      </div>

      <div id="warning" style="display:none" class="warning-banner"></div>
      <div id="error" style="display:none" class="error-banner"></div>

      <div id="config-sections"></div>

      <div class="copy-btn-container">
        <button class="btn btn-primary" onclick="copyToClipboard()">复制到剪贴板</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let currentConfig = {};
    let currentHtml = '';

    // 通知 extension 已准备好
    vscode.postMessage({ type: 'ready', payload: {} });

    // 监听来自 extension 的消息
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'updatePreview':
          currentHtml = message.payload.html;
          document.getElementById('preview').innerHTML = message.payload.html;
          break;
        case 'loadConfig':
          currentConfig = message.payload.config;
          renderConfigUI(currentConfig);
          break;
        case 'showWarning':
          showWarning(message.payload.message);
          break;
        case 'showError':
          showError(message.payload.message);
          break;
      }
    });

    function showWarning(msg) {
      const el = document.getElementById('warning');
      el.textContent = msg;
      el.style.display = 'block';
    }

    function showError(msg) {
      const el = document.getElementById('error');
      el.textContent = msg;
      el.style.display = 'block';
    }

    function renderConfigUI(config) {
      const elements = ${JSON.stringify(CONFIGURABLE_ELEMENTS)};
      const container = document.getElementById('config-sections');
      container.innerHTML = '';

      elements.forEach(elem => {
        const section = document.createElement('div');
        section.className = 'config-section';

        const title = document.createElement('h3');
        title.textContent = elem.label;
        section.appendChild(title);

        const style = config[elem.key] || {};

        elem.properties.forEach(prop => {
          const row = document.createElement('div');
          row.className = 'config-row';

          const label = document.createElement('label');
          label.textContent = prop.label;
          row.appendChild(label);

          const value = style[prop.key];

          if (prop.type === 'color') {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value || '#000000';
            input.dataset.elem = elem.key;
            input.dataset.prop = prop.key;
            input.addEventListener('change', onConfigChange);
            row.appendChild(input);
          } else if (prop.type === 'select') {
            const select = document.createElement('select');
            select.dataset.elem = elem.key;
            select.dataset.prop = prop.key;
            prop.options.forEach(opt => {
              const option = document.createElement('option');
              option.value = opt.value;
              option.textContent = opt.label;
              if (value === opt.value) option.selected = true;
              select.appendChild(option);
            });
            select.addEventListener('change', onConfigChange);
            row.appendChild(select);
          } else if (prop.type === 'number') {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = value || '';
            if (prop.min !== undefined) input.min = prop.min;
            if (prop.max !== undefined) input.max = prop.max;
            input.dataset.elem = elem.key;
            input.dataset.prop = prop.key;
            input.addEventListener('change', onConfigChange);
            row.appendChild(input);

            if (prop.unit) {
              const unit = document.createElement('span');
              unit.className = 'unit';
              unit.textContent = prop.unit;
              row.appendChild(unit);
            }
          } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = value || '';
            input.dataset.elem = elem.key;
            input.dataset.prop = prop.key;
            input.addEventListener('change', onConfigChange);
            row.appendChild(input);
          }

          section.appendChild(row);
        });

        container.appendChild(section);
      });
    }

    function onConfigChange(e) {
      const elemKey = e.target.dataset.elem;
      const propKey = e.target.dataset.prop;
      let value = e.target.value;

      if (e.target.type === 'number') {
        value = parseFloat(value) || 0;
      }

      const update = {};
      update[elemKey] = {};
      update[elemKey][propKey] = value;

      vscode.postMessage({
        type: 'updateConfig',
        payload: { config: update }
      });
    }

    function resetConfig() {
      vscode.postMessage({ type: 'resetConfig', payload: {} });
    }

    // 使用浏览器 Clipboard API 复制富文本 HTML
    async function copyToClipboard() {
      if (!currentHtml) {
        vscode.postMessage({ type: 'copyError', payload: {} });
        return;
      }

      try {
        // 方法1: 使用 ClipboardItem API (现代浏览器)
        if (navigator.clipboard && navigator.clipboard.write) {
          const htmlBlob = new Blob([currentHtml], { type: 'text/html' });
          const textBlob = new Blob([currentHtml.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
          const clipboardItem = new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
          });
          await navigator.clipboard.write([clipboardItem]);
          vscode.postMessage({ type: 'copySuccess', payload: {} });
          return;
        }

        // 方法2: 使用 execCommand (兼容旧浏览器)
        const textarea = document.createElement('textarea');
        textarea.value = currentHtml;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        vscode.postMessage({ type: 'copySuccess', payload: {} });
      } catch (err) {
        console.error('Copy failed:', err);
        vscode.postMessage({ type: 'copyError', payload: {} });
      }
    }
  </script>
</body>
</html>`;
  }

  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables = [];
  }
}