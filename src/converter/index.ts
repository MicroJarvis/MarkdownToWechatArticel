import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { TemplateConfig, styleToCss } from '../templates/types';
import { applyInlineStyles } from './styler';
import { preprocessMarkdownCodeBlocks, SHIKI_BLOCK_START, SHIKI_BLOCK_END } from './markdown';

/**
 * 检查是否为超长文件
 */
function isLargeFile(markdown: string): boolean {
  return markdown.split('\n').length > 5000;
}


/**
 * 处理行内代码
 * 只处理不在 <pre> 标签内的 <code> 标签
 */
function processInlineCode(html: string, template: TemplateConfig): string {
  const inlineCodeStyle = styleToCss(template.code);

  // M6 fix: 使用含时间戳的随机令牌，避免与用户内容冲突
  const token = `\x00WFMT_${Date.now()}_${Math.random().toString(36).slice(2)}_`;

  // 先临时替换 <pre> 内的 <code> 标签，处理完后再恢复
  const preCodePlaceholders: string[] = [];
  let result = html.replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, (match) => {
    const placeholder = `${token}${preCodePlaceholders.length}\x00`;
    preCodePlaceholders.push(match);
    return placeholder;
  });

  // 现在处理所有剩余的 <code> 标签（都是行内代码）
  // 转义双引号，避免 font-family 中的引号（如 "SF Mono"）破坏 HTML style 属性
  const escapedInlineCodeStyle = inlineCodeStyle.replace(/"/g, '&quot;');
  result = result.replace(/<code(?:\s[^>]*)?>|<code>/g, (match) => {
    if (match === '<code>') {
      return `<code style="${escapedInlineCodeStyle}">`;
    }
    // 已有属性的 <code>，在现有属性前插入 style
    return match.replace(/<code/, `<code style="${escapedInlineCodeStyle}"`);
  });

  // M6 + H1 fix: 使用函数替换，避免 $ 特殊字符问题，同时用唯一 token 避免内容冲突
  preCodePlaceholders.forEach((original, index) => {
    result = result.replace(`${token}${index}\x00`, () => original);
  });

  return result;
}

/**
 * 处理代码块 <pre> 标签样式
 * shiki 生成的 HTML 作为原始字符串嵌入，无法通过 hast 访问，需在字符串层面覆盖样式
 */
function processCodeBlock(html: string, template: TemplateConfig): string {
  const cb = template.codeBlock;
  // 构建需要覆盖/追加的样式片段
  const overrides: string[] = [];
  if (cb.backgroundColor) { overrides.push(`background-color: ${cb.backgroundColor}`); }
  if (cb.color) { overrides.push(`color: ${cb.color}`); }
  if (cb.fontSize !== undefined) { overrides.push(`font-size: ${cb.fontSize}px`); }
  if (cb.borderRadius !== undefined) { overrides.push(`border-radius: ${cb.borderRadius}px`); }
  if (cb.paddingLeft !== undefined) { overrides.push(`padding-left: ${cb.paddingLeft}px`); }
  if (cb.paddingRight !== undefined) { overrides.push(`padding-right: ${cb.paddingRight}px`); }
  if (cb.paddingTop !== undefined) { overrides.push(`padding-top: ${cb.paddingTop}px`); }
  if (cb.paddingBottom !== undefined) { overrides.push(`padding-bottom: ${cb.paddingBottom}px`); }
  if (cb.marginTop !== undefined) { overrides.push(`margin-top: ${cb.marginTop}px`); }
  if (cb.marginBottom !== undefined) { overrides.push(`margin-bottom: ${cb.marginBottom}px`); }
  overrides.push('overflow-x: auto');

  if (overrides.length === 0) {
    return html;
  }

  const overrideStr = overrides.join('; ');

  // 替换所有 <pre ...> 标签：在现有 style 属性后追加覆盖样式，后出现的同名属性优先级更高
  return html.replace(/<pre([^>]*)>/g, (match, attrs: string) => {
    const styleMatch = attrs.match(/style="([^"]*)"/);
    if (styleMatch) {
      // 已有 style 属性，追加覆盖样式
      const newStyle = `${styleMatch[1]}; ${overrideStr}`;
      return `<pre${attrs.replace(/style="[^"]*"/, `style="${newStyle}"`)}>`;
    }
    // 没有 style 属性，直接添加
    return `<pre${attrs} style="${overrideStr}">`;
  });
}


export async function convertToWechat(
  markdown: string,
  template: TemplateConfig
): Promise<string> {
  // 检查大文件
  if (isLargeFile(markdown)) {
    console.warn('文件较大（超过 5000 行），处理可能较慢');
  }

  try {
    // Step 1: 使用 shiki 预处理代码块（委托给 markdown.ts）
    const processedMarkdown = await preprocessMarkdownCodeBlocks(markdown);

    // Step 2: 使用 unified 处理 Markdown
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm) // 支持 GFM 扩展：表格、任务列表、删除线等
      .use(remarkRehype, {
        allowDangerousHtml: true, // 允许 shiki 生成的 HTML
      })
      .use(applyInlineStyles, template) // 应用内联样式
      .use(rehypeStringify, {
        allowDangerousHtml: true,
      });

    const result = await processor.process(processedMarkdown);
    let html = String(result);

    // Step 3: 处理行内代码
    html = processInlineCode(html, template);

    // Step 4: 处理代码块 <pre> 样式（shiki 生成的原始 HTML，无法通过 hast 访问）
    html = processCodeBlock(html, template);

    // Step 5: 清理 shiki 标记（使用 markdown.ts 中的常量）
    html = html.split(SHIKI_BLOCK_START).join('').split(SHIKI_BLOCK_END).join('');

    // Step 5: 包装在容器中
    const containerStyle = styleToCss({
      fontFamily: template.paragraph.fontFamily,
      fontSize: template.paragraph.fontSize,
      color: template.paragraph.color,
      lineHeight: template.paragraph.lineHeight,
      paddingLeft: template.container.paddingLeft,
      paddingRight: template.container.paddingRight,
      paddingTop: template.container.paddingTop,
      paddingBottom: template.container.paddingBottom,
    });

    // 转义双引号，避免 font-family 中的引号（如 "Segoe UI"）破坏 HTML style 属性
    const escapedStyle = containerStyle.replace(/"/g, '&quot;');
    return `<div style="${escapedStyle}">${html}</div>`;
  } catch (error) {
    throw new Error(`Markdown 转换失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取转换器的警告信息（用于大文件提示）
 */
export function getConversionWarning(markdown: string): string | null {
  if (isLargeFile(markdown)) {
    return '文件较大（超过 5000 行），预览可能较慢';
  }
  return null;
}