import {
  getDefaultTemplate,
  simpleWhiteTemplate,
  getAvailableTemplates,
  getTemplateByName,
} from './default';

describe('getDefaultTemplate', () => {
  test('返回包含所有必要字段的模板', () => {
    const template = getDefaultTemplate();
    expect(template.name).toBe('简约白');
    expect(template.h1).toBeDefined();
    expect(template.h2).toBeDefined();
    expect(template.paragraph).toBeDefined();
    expect(template.code).toBeDefined();
    expect(template.codeBlock).toBeDefined();
    expect(template.container).toBeDefined();
  });

  test('每次调用返回独立对象（非同一引用）', () => {
    const t1 = getDefaultTemplate();
    const t2 = getDefaultTemplate();
    expect(t1).not.toBe(t2);
  });

  test('simpleWhiteTemplate 包含所有必要的元素键', () => {
    const required: (keyof typeof simpleWhiteTemplate)[] = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'paragraph', 'link', 'blockquote',
      'ul', 'ol', 'li',
      'code', 'codeBlock',
      'table', 'tableHeader', 'tableCell',
      'hr', 'image', 'container',
    ];
    for (const key of required) {
      expect(simpleWhiteTemplate[key]).toBeDefined();
    }
  });

  test('默认模板的 container 有合理的 padding 值', () => {
    const template = getDefaultTemplate();
    expect(template.container.paddingLeft).toBeGreaterThan(0);
    expect(template.container.paddingRight).toBeGreaterThan(0);
  });

  test('H2 包含 borderLeft（简约白左边框特征）', () => {
    const template = getDefaultTemplate();
    expect(template.h2.borderLeft).toBeDefined();
    expect(template.h2.borderLeft).toContain('solid');
  });
});

describe('getAvailableTemplates', () => {
  test('至少返回一个模板', () => {
    const templates = getAvailableTemplates();
    expect(templates.length).toBeGreaterThan(0);
  });

  test('所有模板都有名称', () => {
    for (const t of getAvailableTemplates()) {
      expect(t.name).toBeTruthy();
    }
  });
});

describe('getTemplateByName', () => {
  test('根据名称返回正确的模板', () => {
    const t = getTemplateByName('简约白');
    expect(t).toBeDefined();
    expect(t?.name).toBe('简约白');
  });

  test('名称不存在时返回 undefined', () => {
    expect(getTemplateByName('不存在的模板')).toBeUndefined();
  });
});
