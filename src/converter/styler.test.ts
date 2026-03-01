import { sanitizeStylesForWechat, isWechatSupportedCss, applyWechatStyleFilter } from './styler';

describe('isWechatSupportedCss', () => {
  test('允许标准文字属性', () => {
    expect(isWechatSupportedCss('color')).toBe(true);
    expect(isWechatSupportedCss('font-size')).toBe(true);
    expect(isWechatSupportedCss('font-weight')).toBe(true);
    expect(isWechatSupportedCss('line-height')).toBe(true);
    expect(isWechatSupportedCss('text-align')).toBe(true);
    expect(isWechatSupportedCss('text-decoration')).toBe(true);
  });

  test('允许盒模型属性', () => {
    expect(isWechatSupportedCss('margin-top')).toBe(true);
    expect(isWechatSupportedCss('margin-bottom')).toBe(true);
    expect(isWechatSupportedCss('padding-left')).toBe(true);
    expect(isWechatSupportedCss('border-radius')).toBe(true);
    expect(isWechatSupportedCss('background-color')).toBe(true);
    expect(isWechatSupportedCss('border-left')).toBe(true);
  });

  test('拒绝微信不支持的属性', () => {
    expect(isWechatSupportedCss('display')).toBe(false);
    expect(isWechatSupportedCss('gap')).toBe(false);
    expect(isWechatSupportedCss('position')).toBe(false);
    expect(isWechatSupportedCss('transform')).toBe(false);
    expect(isWechatSupportedCss('animation')).toBe(false);
    expect(isWechatSupportedCss('transition')).toBe(false);
    expect(isWechatSupportedCss('background-image')).toBe(false);
  });

  test('大小写不敏感', () => {
    expect(isWechatSupportedCss('COLOR')).toBe(true);
    expect(isWechatSupportedCss('DISPLAY')).toBe(false);
  });
});

describe('sanitizeStylesForWechat', () => {
  test('过滤掉不支持的属性，保留支持的属性', () => {
    const input = 'color: red; display: flex; font-size: 14px';
    const output = sanitizeStylesForWechat(input);
    expect(output).toContain('color: red');
    expect(output).toContain('font-size: 14px');
    expect(output).not.toContain('display');
  });

  test('空字符串返回空字符串', () => {
    expect(sanitizeStylesForWechat('')).toBe('');
  });

  test('全部不支持的属性返回空字符串', () => {
    const result = sanitizeStylesForWechat('display: flex; gap: 10px; position: absolute');
    expect(result).toBe('');
  });

  test('保留 border 相关属性', () => {
    const input = 'border-left: 4px solid #42b983; border-radius: 4px';
    const output = sanitizeStylesForWechat(input);
    expect(output).toContain('border-left');
    expect(output).toContain('border-radius');
  });

  test('处理末尾分号的字符串', () => {
    const output = sanitizeStylesForWechat('color: red;');
    expect(output).toContain('color: red');
  });
});

describe('applyWechatStyleFilter', () => {
  test('是 sanitizeStylesForWechat 的别名，行为一致', () => {
    const input = 'color: red; display: flex';
    expect(applyWechatStyleFilter(input)).toBe(sanitizeStylesForWechat(input));
  });
});
