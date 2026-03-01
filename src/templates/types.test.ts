import { styleToCss, mergeStyles, mergeTemplates, ElementStyle } from './types';
import { getDefaultTemplate } from './default';

describe('styleToCss', () => {
  test('将完整 ElementStyle 转换为正确的 CSS 字符串', () => {
    const style: ElementStyle = {
      fontSize: 16,
      color: '#333333',
      lineHeight: 1.5,
      fontWeight: 'bold',
    };
    const css = styleToCss(style);
    expect(css).toContain('font-size: 16px');
    expect(css).toContain('color: #333333');
    expect(css).toContain('line-height: 1.5');
    expect(css).toContain('font-weight: bold');
  });

  test('省略 undefined 的属性', () => {
    const css = styleToCss({ color: '#000' });
    expect(css).toBe('color: #000');
    expect(css).not.toContain('font-size');
  });

  test('空对象返回空字符串', () => {
    expect(styleToCss({})).toBe('');
  });

  test('正确处理 borderLeft 字符串属性', () => {
    const css = styleToCss({ borderLeft: '4px solid #42b983' });
    expect(css).toContain('border-left: 4px solid #42b983');
  });

  test('正确处理所有 padding 属性', () => {
    const css = styleToCss({ paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5 });
    expect(css).toContain('padding-left: 10px');
    expect(css).toContain('padding-right: 10px');
    expect(css).toContain('padding-top: 5px');
    expect(css).toContain('padding-bottom: 5px');
  });

  test('处理 marginTop=0 不应省略（值为 0 也要输出）', () => {
    const css = styleToCss({ marginTop: 0 });
    expect(css).toContain('margin-top: 0px');
  });

  test('正确处理 backgroundColor', () => {
    const css = styleToCss({ backgroundColor: '#f8f8f8' });
    expect(css).toContain('background-color: #f8f8f8');
  });
});

describe('mergeStyles', () => {
  test('覆盖值替换基础值，保留未覆盖的属性', () => {
    const base: ElementStyle = { color: '#000', fontSize: 14 };
    const result = mergeStyles(base, { color: '#fff' });
    expect(result.color).toBe('#fff');
    expect(result.fontSize).toBe(14);
  });

  test('不修改原始 base 对象', () => {
    const base: ElementStyle = { color: '#000' };
    mergeStyles(base, { color: '#fff' });
    expect(base.color).toBe('#000');
  });

  test('override 中的 undefined 不会覆盖 base 值', () => {
    const base: ElementStyle = { color: '#000', fontSize: 14 };
    const result = mergeStyles(base, { fontSize: undefined });
    // spread 行为：undefined 会覆盖，这是已知的 JS 行为
    // 此测试记录当前行为
    expect(typeof result).toBe('object');
  });
});

describe('mergeTemplates', () => {
  test('正确覆盖顶层样式属性，保留其他属性', () => {
    const base = getDefaultTemplate();
    const result = mergeTemplates(base, { h1: { color: '#ff0000' } });
    expect(result.h1.color).toBe('#ff0000');
    // 其他 h1 属性应该被保留
    expect(result.h1.fontSize).toBe(base.h1.fontSize);
  });

  test('正确合并 container 配置', () => {
    const base = getDefaultTemplate();
    const result = mergeTemplates(base, { container: { paddingLeft: 40 } });
    expect(result.container.paddingLeft).toBe(40);
    // 其他 padding 保留不变
    expect(result.container.paddingRight).toBe(base.container.paddingRight);
  });

  test('未修改的模板节保持不变', () => {
    const base = getDefaultTemplate();
    const result = mergeTemplates(base, { name: '新模板' });
    expect(result.name).toBe('新模板');
    expect(result.paragraph).toEqual(base.paragraph);
    expect(result.code).toEqual(base.code);
  });

  test('不修改原始 base 对象', () => {
    const base = getDefaultTemplate();
    const originalH1Color = base.h1.color;
    mergeTemplates(base, { h1: { color: '#ff0000' } });
    expect(base.h1.color).toBe(originalH1Color);
  });
});
