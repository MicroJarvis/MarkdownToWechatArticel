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
 * 将 Markdown 转换为微信公众号格式的 HTML
 */
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

    // Step 4: 清理 shiki 标记（使用 markdown.ts 中的常量）
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