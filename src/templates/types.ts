/**
 * 单个元素的样式配置
 * 所有属性都是可选的，支持增量更新
 */
export interface ElementStyle {
  /** 字体 family */
  fontFamily?: string;
  /** 字体大小 (px) */
  fontSize?: number;
  /** 字体粗细 */
  fontWeight?: string;
  /** 文字颜色 (hex) */
  color?: string;
  /** 行高 (无单位倍数) */
  lineHeight?: number;
  /** 文本对齐 */
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  /** 上边距 (px) */
  marginTop?: number;
  /** 下边距 (px) */
  marginBottom?: number;
  /** 左内边距 (px) */
  paddingLeft?: number;
  /** 右内边距 (px) */
  paddingRight?: number;
  /** 上内边距 (px) */
  paddingTop?: number;
  /** 下内边距 (px) */
  paddingBottom?: number;
  /** 背景颜色 (hex) */
  backgroundColor?: string;
  /** 圆角 (px) */
  borderRadius?: number;
  /** 左边框 (如 '4px solid #42b983') */
  borderLeft?: string;
  /** 下边框 */
  borderBottom?: string;
  /** 上边框 */
  borderTop?: string;
  /** 右边框 */
  borderRight?: string;
}

/**
 * 完整模板配置
 */
export interface TemplateConfig {
  /** 模板名称 */
  name: string;

  // 标题样式 (H1-H6)
  h1: ElementStyle;
  h2: ElementStyle;
  h3: ElementStyle;
  h4: ElementStyle;
  h5: ElementStyle;
  h6: ElementStyle;

  // 正文
  paragraph: ElementStyle;

  // 链接
  link: ElementStyle;

  // 引用块
  blockquote: ElementStyle;

  // 列表
  ul: ElementStyle;
  ol: ElementStyle;
  li: ElementStyle;

  // 代码块
  code: ElementStyle;       // 行内代码
  codeBlock: ElementStyle;  // 代码块容器

  // 表格
  table: ElementStyle;
  tableHeader: ElementStyle;
  tableCell: ElementStyle;

  // 分割线
  hr: ElementStyle;

  // 图片
  image: ElementStyle;

  // 容器（整体内边距）
  container: ElementStyle;
}

/**
 * 将 ElementStyle 转换为内联 CSS 字符串
 */
export function styleToCss(style: ElementStyle): string {
  const parts: string[] = [];

  if (style.fontFamily) {
    parts.push(`font-family: ${style.fontFamily}`);
  }
  if (style.fontSize !== undefined) {
    parts.push(`font-size: ${style.fontSize}px`);
  }
  if (style.fontWeight) {
    parts.push(`font-weight: ${style.fontWeight}`);
  }
  if (style.color) {
    parts.push(`color: ${style.color}`);
  }
  if (style.lineHeight !== undefined) {
    parts.push(`line-height: ${style.lineHeight}`);
  }
  if (style.textAlign) {
    parts.push(`text-align: ${style.textAlign}`);
  }
  if (style.marginTop !== undefined) {
    parts.push(`margin-top: ${style.marginTop}px`);
  }
  if (style.marginBottom !== undefined) {
    parts.push(`margin-bottom: ${style.marginBottom}px`);
  }
  if (style.paddingLeft !== undefined) {
    parts.push(`padding-left: ${style.paddingLeft}px`);
  }
  if (style.paddingRight !== undefined) {
    parts.push(`padding-right: ${style.paddingRight}px`);
  }
  if (style.backgroundColor) {
    parts.push(`background-color: ${style.backgroundColor}`);
  }
  if (style.borderRadius !== undefined) {
    parts.push(`border-radius: ${style.borderRadius}px`);
  }
  if (style.borderLeft) {
    parts.push(`border-left: ${style.borderLeft}`);
  }
  if (style.borderBottom) {
    parts.push(`border-bottom: ${style.borderBottom}`);
  }
  if (style.borderTop) {
    parts.push(`border-top: ${style.borderTop}`);
  }
  if (style.paddingTop !== undefined) {
    parts.push(`padding-top: ${style.paddingTop}px`);
  }
  if (style.paddingBottom !== undefined) {
    parts.push(`padding-bottom: ${style.paddingBottom}px`);
  }

  return parts.join('; ');
}

/**
 * 深度合并两个 ElementStyle 对象
 */
export function mergeStyles(base: ElementStyle, override: Partial<ElementStyle>): ElementStyle {
  return { ...base, ...override };
}

/**
 * 深度合并两个 TemplateConfig 对象
 */
export function mergeTemplates(base: TemplateConfig, override: Partial<TemplateConfig>): TemplateConfig {
  const result: TemplateConfig = { ...base, ...override };

  // 合并每个元素的样式
  const styleKeys: (keyof TemplateConfig)[] = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'paragraph', 'link', 'blockquote',
    'ul', 'ol', 'li',
    'code', 'codeBlock',
    'table', 'tableHeader', 'tableCell',
    'hr', 'image'
  ];

  for (const key of styleKeys) {
    const overrideValue = override[key];
    const baseValue = base[key];
    if (overrideValue && typeof overrideValue === 'object' && baseValue && typeof baseValue === 'object') {
      // Use unknown as intermediate type for safe casting
      (result as unknown as Record<string, ElementStyle>)[key] = mergeStyles(
        baseValue as ElementStyle,
        overrideValue as Partial<ElementStyle>
      );
    }
  }

  // 合并容器配置
  if (override.container && typeof override.container === 'object' && base.container) {
    result.container = mergeStyles(base.container, override.container as Partial<ElementStyle>);
  }

  return result;
}