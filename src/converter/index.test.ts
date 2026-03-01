import { convertToWechat, getConversionWarning } from './index';
import { getDefaultTemplate } from '../templates/default';

// Mock shiki（避免慢速 I/O，专注于转换逻辑测试）
jest.mock('shiki', () => ({
  codeToHtml: jest.fn().mockImplementation(async (code: string) => {
    return `<pre style="background-color:#f6f8fa"><code>${code.replace(/</g, '&lt;')}</code></pre>`;
  }),
}));

describe('convertToWechat', () => {
  const template = getDefaultTemplate();

  test('转换基础 Markdown 为 HTML', async () => {
    const html = await convertToWechat('# Hello\n\n段落文本。', template);
    expect(html).toContain('<h1');
    expect(html).toContain('Hello');
    expect(html).toContain('<p');
    expect(html).toContain('段落文本');
  });

  test('输出包裹在带样式的 div 中', async () => {
    const html = await convertToWechat('Hello', template);
    expect(html).toMatch(/^<div style=/);
    expect(html.endsWith('</div>')).toBe(true);
  });

  test('元素带有内联样式', async () => {
    const html = await convertToWechat('# 标题', template);
    expect(html).toContain('style=');
    expect(html).toContain('font-size');
  });

  test('空 Markdown 不抛异常', async () => {
    await expect(convertToWechat('', template)).resolves.toBeDefined();
  });

  test('处理 GFM 表格', async () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |';
    const html = await convertToWechat(md, template);
    expect(html).toContain('<table');
    expect(html).toContain('<th');
    expect(html).toContain('<td');
  });

  test('处理 GFM 任务列表', async () => {
    const md = '- [ ] 待办\n- [x] 完成';
    const html = await convertToWechat(md, template);
    expect(html).toContain('input');
  });

  test('处理 GFM 删除线', async () => {
    const md = '~~删除线~~';
    const html = await convertToWechat(md, template);
    expect(html).toContain('<del');
  });

  test('传入 null 模板时抛出统一格式的错误', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(convertToWechat('# Test', null as any)).rejects.toThrow('Markdown 转换失败');
  });

  test('容器边距来自 template.container 配置', async () => {
    const customTemplate = getDefaultTemplate();
    customTemplate.container.paddingLeft = 99;
    const html = await convertToWechat('hello', customTemplate);
    expect(html).toContain('padding-left: 99px');
  });
});

describe('getConversionWarning', () => {
  test('正常文件返回 null', () => {
    expect(getConversionWarning('# 小文件\n内容')).toBeNull();
  });

  test('超过 5000 行返回警告信息', () => {
    const largeMd = Array(5001).fill('行').join('\n');
    const warning = getConversionWarning(largeMd);
    expect(warning).not.toBeNull();
    expect(warning).toContain('5000');
  });
});

