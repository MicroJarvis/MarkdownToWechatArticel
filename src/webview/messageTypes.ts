import { TemplateConfig, ElementStyle } from '../templates/types';

/**
 * Extension → Webview 消息类型
 */
export type ExtensionToWebviewMessageType = 'updatePreview' | 'loadConfig' | 'showError' | 'showWarning';

/**
 * Extension → Webview 消息
 */
export interface ExtensionToWebviewMessage {
  type: ExtensionToWebviewMessageType;
  payload: {
    html?: string;            // updatePreview: 渲染的 HTML
    config?: TemplateConfig;  // loadConfig: 当前配置
    message?: string;         // showError/showWarning: 信息内容
  };
}

/**
 * Webview → Extension 消息类型
 */
export type WebviewToExtensionMessageType = 'updateConfig' | 'copyToClipboard' | 'resetConfig' | 'ready' | 'copySuccess' | 'copyError';

/**
 * Webview → Extension 消息
 */
export interface WebviewToExtensionMessage {
  type: WebviewToExtensionMessageType;
  payload: {
    config?: Partial<TemplateConfig>;  // updateConfig: 配置变更
    html?: string;                     // copyToClipboard: 要复制的 HTML
  };
}

/**
 * 可编辑的样式属性定义
 */
export interface StylePropertyDescriptor {
  key: keyof ElementStyle;
  label: string;
  type: 'text' | 'number' | 'color' | 'select';
  options?: { label: string; value: string }[];  // select 类型的选项
  min?: number;
  max?: number;
  unit?: string;  // 显示单位，如 'px'
}

/**
 * 可配置的元素定义
 */
export interface ConfigurableElement {
  key: keyof TemplateConfig;
  label: string;
  properties: StylePropertyDescriptor[];
}

/**
 * 所有可配置的元素列表
 */
export const CONFIGURABLE_ELEMENTS: ConfigurableElement[] = [
  {
    key: 'h1',
    label: '一级标题 (H1)',
    properties: [
      { key: 'fontSize', label: '字号', type: 'number', unit: 'px', min: 12, max: 48 },
      { key: 'color', label: '颜色', type: 'color' },
      { key: 'fontWeight', label: '粗细', type: 'select', options: [
        { label: '正常', value: 'normal' },
        { label: '粗体', value: 'bold' },
      ]},
      { key: 'textAlign', label: '对齐', type: 'select', options: [
        { label: '左对齐', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右对齐', value: 'right' },
      ]},
    ],
  },
  {
    key: 'h2',
    label: '二级标题 (H2)',
    properties: [
      { key: 'fontSize', label: '字号', type: 'number', unit: 'px', min: 12, max: 36 },
      { key: 'color', label: '颜色', type: 'color' },
      { key: 'fontWeight', label: '粗细', type: 'select', options: [
        { label: '正常', value: 'normal' },
        { label: '粗体', value: 'bold' },
      ]},
      { key: 'borderLeft', label: '左边框颜色', type: 'color' },
    ],
  },
  {
    key: 'paragraph',
    label: '正文段落',
    properties: [
      { key: 'fontSize', label: '字号', type: 'number', unit: 'px', min: 12, max: 24 },
      { key: 'color', label: '颜色', type: 'color' },
      { key: 'lineHeight', label: '行高', type: 'number', min: 1, max: 3 },
    ],
  },
  {
    key: 'code',
    label: '行内代码',
    properties: [
      { key: 'fontSize', label: '字号', type: 'number', unit: 'px', min: 10, max: 20 },
      { key: 'color', label: '颜色', type: 'color' },
      { key: 'backgroundColor', label: '背景色', type: 'color' },
    ],
  },
  {
    key: 'codeBlock',
    label: '代码块',
    properties: [
      { key: 'fontSize', label: '字号', type: 'number', unit: 'px', min: 10, max: 18 },
      { key: 'color', label: '字色', type: 'color' },
      { key: 'backgroundColor', label: '背景色', type: 'color' },
    ],
  },
  {
    key: 'blockquote',
    label: '引用块',
    properties: [
      { key: 'fontSize', label: '字号', type: 'number', unit: 'px', min: 12, max: 20 },
      { key: 'color', label: '文字颜色', type: 'color' },
      { key: 'backgroundColor', label: '背景色', type: 'color' },
      { key: 'borderLeft', label: '左边框', type: 'text' },
    ],
  },
  {
    key: 'link',
    label: '链接',
    properties: [
      { key: 'color', label: '颜色', type: 'color' },
    ],
  },
  {
    key: 'container',
    label: '页面边距',
    properties: [
      { key: 'paddingLeft', label: '左边距', type: 'number', unit: 'px', min: 0, max: 50 },
      { key: 'paddingRight', label: '右边距', type: 'number', unit: 'px', min: 0, max: 50 },
      { key: 'paddingTop', label: '上边距', type: 'number', unit: 'px', min: 0, max: 50 },
      { key: 'paddingBottom', label: '下边距', type: 'number', unit: 'px', min: 0, max: 50 },
    ],
  },
];