import { codeToHtml } from 'shiki';

/**
 * Markdown 预处理工具
 *
 * 注意：unified 解析管道位于 index.ts。
 * 本文件负责在 unified 管道运行前对代码块进行 shiki 高亮预处理。
 * （M5: 对应 tech-spec Task 3.1/3.2，原设计为独立文件）
 */

/** shiki 高亮块的标记常量 */
export const SHIKI_BLOCK_START = '<!--SHIKI_BLOCK_START-->';
export const SHIKI_BLOCK_END = '<!--SHIKI_BLOCK_END-->';

/**
 * 使用 shiki 对单个代码块进行语法高亮
 * @param code 代码内容
 * @param lang 语言标识符
 * @returns 高亮后的 HTML 字符串
 */
export async function highlightCode(code: string, lang: string): Promise<string> {
  try {
    return await codeToHtml(code.trim(), {
      lang: lang.toLowerCase() === 'text' ? 'text' : lang,
      theme: 'github-light',
    });
  } catch {
    // 语言不支持时降级为纯文本
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="shiki" style="background-color: #f6f8fa; padding: 15px; border-radius: 6px; overflow-x: auto;"><code>${escapedCode}</code></pre>`;
  }
}

/**
 * 预处理 Markdown，将代码块替换为 shiki 高亮的 HTML 片段
 * 替换结果用 SHIKI_BLOCK_START/END 注释标记，防止 unified 再次处理
 */
export async function preprocessMarkdownCodeBlocks(markdown: string): Promise<string> {
  // 匹配 ``` 开始到下一个 ``` 结束的代码块（多行，非贪婪）
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

  if (matches.length === 0) {
    return markdown;
  }

  let result = markdown;
  for (const { lang, code, fullMatch } of matches) {
    const html = await highlightCode(code, lang);
    // H1 fix: 函数替换避免 $& $1 等特殊字符被误解析
    result = result.replace(fullMatch, () => `${SHIKI_BLOCK_START}${html}${SHIKI_BLOCK_END}`);
  }

  return result;
}
