import { TemplateConfig, styleToCss, ElementStyle } from '../templates/types';
import { visit } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { Root, Element, Node } from 'hast';

/**
 * hast 节点类型守卫
 */
function isElement(node: Node): node is Element {
  return node.type === 'element';
}

/**
 * 获取元素对应的模板样式
 */
function getStyleForTag(tag: string, template: TemplateConfig): ElementStyle {
  const styleMap: Record<string, ElementStyle> = {
    h1: template.h1,
    h2: template.h2,
    h3: template.h3,
    h4: template.h4,
    h5: template.h5,
    h6: template.h6,
    p: template.paragraph,
    a: template.link,
    blockquote: template.blockquote,
    ul: template.ul,
    ol: template.ol,
    li: template.li,
    table: template.table,
    th: template.tableHeader,
    td: template.tableCell,
    hr: template.hr,
    img: template.image,
    pre: template.codeBlock,
  };

  return styleMap[tag] || {};
}

/**
 * 需要特殊处理的标签
 */
const SPECIAL_TAGS = {
  // 代码块中的 pre 标签
  pre: (node: Element, template: TemplateConfig) => {
    // 检查是否已经有 shiki 处理过的样式
    if (node.properties?.style) {
      // shiki 已经处理过，只添加一些额外样式
      const extraStyle = `margin-top: ${template.codeBlock.marginTop}px; margin-bottom: ${template.codeBlock.marginBottom}px; overflow-x: auto;`;
      node.properties.style = node.properties.style + ';' + extraStyle;
    } else {
      // 未处理过的代码块，应用模板样式
      node.properties = node.properties || {};
      node.properties.style = styleToCss(template.codeBlock);
    }
  },

  // 链接
  a: (node: Element, template: TemplateConfig) => {
    node.properties = node.properties || {};
    const existingStyle = node.properties.style as string || '';
    node.properties.style = existingStyle + (existingStyle ? ';' : '') + styleToCss(template.link);
    // 保留 href 属性
    // 微信公众号不支持外链，但保留链接样式
  },

  // 图片
  img: (node: Element, template: TemplateConfig) => {
    node.properties = node.properties || {};
    // 图片居中（注意：微信公众号不支持 display: flex/grid，使用 margin 实现居中）
    const style = styleToCss(template.image);
    node.properties.style = style;
    // 使用 margin: auto 实现居中，避免使用 display: block（微信不支持）
    node.properties.style += '; max-width: 100%; height: auto; margin-left: auto; margin-right: auto;';
  },

  // 表格
  table: (node: Element, template: TemplateConfig) => {
    node.properties = node.properties || {};
    node.properties.style = styleToCss(template.table);
    // 添加 border-collapse
    node.properties.style += '; border-collapse: collapse; width: 100%;';
  },

  // 分割线
  hr: (node: Element, template: TemplateConfig) => {
    node.properties = node.properties || {};
    node.properties.style = styleToCss(template.hr);
    node.properties.style += '; border: none;';
  },

  // 引用块
  blockquote: (node: Element, template: TemplateConfig) => {
    node.properties = node.properties || {};
    node.properties.style = styleToCss(template.blockquote);
    // 添加 padding-top 和 padding-bottom
    node.properties.style += '; padding-top: 10px; padding-bottom: 10px;';
  },
};

/**
 * 应用内联样式的 rehype 插件
 * 将模板样式直接应用到 HTML 元素的 style 属性
 */
export const applyInlineStyles: Plugin<[TemplateConfig], Root, Root> = (template) => {
  const transformer: Transformer<Root, Root> = (tree) => {
    visit(tree, isElement, (node: Element) => {
      const tag = node.tagName;

      // 特殊标签处理
      if (tag in SPECIAL_TAGS) {
        SPECIAL_TAGS[tag as keyof typeof SPECIAL_TAGS](node, template);
        return;
      }

      // 普通标签：获取样式并应用，M1 fix: 过滤微信不支持的 CSS 属性
      const style = getStyleForTag(tag, template);
      if (Object.keys(style).length > 0) {
        node.properties = node.properties || {};
        const existingStyle = node.properties.style as string || '';
        const newStyle = sanitizeStylesForWechat(styleToCss(style));
        if (newStyle) {
          node.properties.style = existingStyle ? `${existingStyle};${newStyle}` : newStyle;
        }
      }
    });

    return tree;
  };

  return transformer;
};

/**
 * 检查 CSS 属性是否被微信公众号支持
 * 返回 true 表示支持，false 表示需要降级或移除
 */
export function isWechatSupportedCss(property: string): boolean {
  // 微信公众号不支持的 CSS 属性列表
  const unsupportedProperties = [
    'display', // flex, grid 不支持
    'gap',
    'position', // 除了 static
    'transform',
    'transition',
    'animation',
    'box-shadow', // 部分支持
    'text-shadow',
    'filter',
    'clip-path',
    'mask',
    'background-image', // 外链不支持
    '@import',
    '::before',
    '::after',
    ':hover',
    ':focus',
  ];

  // 检查是否在不支持列表中
  const normalizedProp = property.toLowerCase();
  return !unsupportedProperties.some(unsupported =>
    normalizedProp.includes(unsupported.toLowerCase())
  );
}

/**
 * 过滤和清理样式，移除微信不支持的 CSS
 */
export function sanitizeStylesForWechat(styleString: string): string {
  const parts = styleString.split(';').map(s => s.trim()).filter(Boolean);
  const validParts: string[] = [];

  for (const part of parts) {
    const [prop] = part.split(':');
    if (prop && isWechatSupportedCss(prop.trim())) {
      validParts.push(part);
    }
  }

  return validParts.join('; ');
}

/**
 * 应用微信样式过滤到样式字符串
 * 移除不支持的 CSS 属性
 */
export function applyWechatStyleFilter(styleString: string): string {
  return sanitizeStylesForWechat(styleString);
}