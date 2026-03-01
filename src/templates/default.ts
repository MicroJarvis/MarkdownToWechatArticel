import { TemplateConfig, ElementStyle } from './types';

/**
 * 简约白模板
 * 参考微信公众号常见技术文章风格
 */
export const simpleWhiteTemplate: TemplateConfig = {
  name: '简约白',

  // H1 标题 - 文章大标题
  h1: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 1.4,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  // H2 标题 - 章节标题
  h2: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 1.4,
    marginTop: 25,
    marginBottom: 15,
    borderLeft: '4px solid #42b983',
    paddingLeft: 10,
  },

  // H3 标题
  h3: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 1.4,
    marginTop: 20,
    marginBottom: 12,
  },

  // H4 标题
  h4: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 1.5,
    marginTop: 18,
    marginBottom: 10,
  },

  // H5 标题
  h5: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555555',
    lineHeight: 1.5,
    marginTop: 15,
    marginBottom: 8,
  },

  // H6 标题
  h6: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666666',
    lineHeight: 1.5,
    marginTop: 12,
    marginBottom: 6,
  },

  // 正文段落
  paragraph: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 15,
    color: '#3f3f3f',
    lineHeight: 1.8,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'justify',
  },

  // 链接
  link: {
    color: '#42b983',
    fontWeight: 'normal',
  },

  // 引用块
  blockquote: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    color: '#666666',
    lineHeight: 1.6,
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 15,
    borderLeft: '4px solid #ddd',
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },

  // 无序列表
  ul: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 15,
    color: '#3f3f3f',
    lineHeight: 1.8,
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 20,
  },

  // 有序列表
  ol: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 15,
    color: '#3f3f3f',
    lineHeight: 1.8,
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 20,
  },

  // 列表项
  li: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 15,
    color: '#3f3f3f',
    lineHeight: 1.8,
    marginTop: 5,
    marginBottom: 5,
  },

  // 行内代码
  code: {
    fontFamily: '"SF Mono", Monaco, Menlo, Consolas, monospace',
    fontSize: 14,
    color: '#e96900',
    backgroundColor: '#f8f8f8',
    borderRadius: 3,
    paddingLeft: 4,
    paddingRight: 4,
  },

  // 代码块容器
  codeBlock: {
    fontFamily: '"SF Mono", Monaco, Menlo, Consolas, monospace',
    fontSize: 13,
    lineHeight: 1.6,
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: '#f6f8fa',
    borderRadius: 6,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },

  // 表格
  table: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    marginTop: 15,
    marginBottom: 15,
    borderLeft: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
  },

  // 表头单元格
  tableHeader: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    backgroundColor: '#f6f8fa',
    lineHeight: 1.5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderTop: '1px solid #ddd',
    borderRight: '1px solid #ddd',
  },

  // 表格单元格
  tableCell: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    color: '#3f3f3f',
    lineHeight: 1.5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderTop: '1px solid #ddd',
    borderRight: '1px solid #ddd',
  },

  // 分割线
  hr: {
    marginTop: 20,
    marginBottom: 20,
    borderLeft: 'none',
    borderBottom: '1px solid #eee',
  },

  // 图片
  image: {
    marginTop: 15,
    marginBottom: 15,
    textAlign: 'center',
  },

  // 容器（整体内边距）
  container: {
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 20,
    paddingBottom: 20,
  },
};

/**
 * 获取默认模板
 */
export function getDefaultTemplate(): TemplateConfig {
  return { ...simpleWhiteTemplate };
}

/**
 * 获取所有可用模板
 */
export function getAvailableTemplates(): TemplateConfig[] {
  return [simpleWhiteTemplate];
}

/**
 * 根据名称获取模板
 */
export function getTemplateByName(name: string): TemplateConfig | undefined {
  return getAvailableTemplates().find(t => t.name === name);
}