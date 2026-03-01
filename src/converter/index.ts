import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { codeToHtml } from 'shiki';
import { TemplateConfig, styleToCss } from '../templates/types';
import { applyInlineStyles } from './styler';

/**
 * 检查是否为超长文件
 */
function isLargeFile(markdown: string): boolean {
  return markdown.split('\n').length > 5000;
}

/**
 * 预处理代码块，使用 shiki 高亮
 * 注意：使用更健壮的正则处理代码块
 */
async function highlightCodeBlocks(markdown: string): Promise<string> {
  // 使用更健壮的正则：匹配 ``` 开始到下一个 ``` 结束
  // 支持代码块内包含 ``` 的情况（通过非贪婪匹配和语言标识符检测）
  const codeBlockRegex = /^```(\w*)\n([\s\S]*?)^```/gm;
  const matches: Array<{ lang: string; code: string; fullMatch: string }> = [];

  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    matches.push({
      lang: match[1] || 'text',
      code: match[2],
      fullMatch: match[0],
    });
  }

  // 没有代码块，直接返回
  if (matches.length === 0) {
    return markdown;
  }

  // 使用 shiki 高亮每个代码块
  let result = markdown;
  for (const { lang, code, fullMatch } of matches) {
    try {
      // 使用 shiki 的 codeToHtml 进行高亮
      const html = await codeToHtml(code.trim(), {
        lang: lang.toLowerCase() === 'text' ? 'text' : lang,
        theme: 'github-light',
      });
      // 用特殊标记替换，后续不会被再次处理
      result = result.replace(fullMatch, `<!--SHIKI_BLOCK_START-->${html}<!--SHIKI_BLOCK_END-->`);
    } catch {
      // 语言不支持或高亮失败，保留原始代码块
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const fallbackHtml = `<pre class="shiki" style="background-color: #f6f8fa; padding: 15px; border-radius: 6px; overflow-x: auto;"><code>${escapedCode}</code></pre>`;
      result = result.replace(fullMatch, `<!--SHIKI_BLOCK_START-->${fallbackHtml}<!--SHIKI_BLOCK_END-->`);
    }
  }

  return result;
}

/**
 * 处理行内代码
 * 只处理不在 <pre> 标签内的 <code> 标签
 */
function processInlineCode(html: string, template: TemplateConfig): string {
  const inlineCodeStyle = styleToCss(template.code);

  // 先临时替换 <pre> 内的 <code> 标签，处理完后再恢复
  const preCodePlaceholders: string[] = [];
  let result = html.replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, (match) => {
    const placeholder = `__PRE_CODE_PLACEHOLDER_${preCodePlaceholders.length}__`;
    preCodePlaceholders.push(match);
    return placeholder;
  });

  // 现在处理所有剩余的 <code> 标签（都是行内代码）
  result = result.replace(/<code>/g, `<code style="${inlineCodeStyle}">`);

  // 恢复 <pre> 内的内容
  preCodePlaceholders.forEach((original, index) => {
    result = result.replace(`__PRE_CODE_PLACEHOLDER_${index}__`, original);
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
    // Step 1: 使用 shiki 预处理代码块
    const processedMarkdown = await highlightCodeBlocks(markdown);

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

    // Step 4: 清理 shiki 标记
    html = html
      .replace(/<!--SHIKI_BLOCK_START-->/g, '')
      .replace(/<!--SHIKI_BLOCK_END-->/g, '');

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

    return `<div style="${containerStyle}">${html}</div>`;
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