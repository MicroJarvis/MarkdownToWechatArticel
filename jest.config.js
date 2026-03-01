/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^vscode$': '<rootDir>/src/__mocks__/vscode.ts',
  },
  testMatch: ['**/src/**/*.test.ts'],
  // 排除编译输出目录和 VSCode 集成测试目录
  testPathIgnorePatterns: ['/node_modules/', '/out/', '/src/test/'],
  roots: ['<rootDir>/src'],
  transform: {
    // TypeScript 文件：用 ts-jest 处理
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
      },
    }],
    // ESM 的 JS 文件：用 ts-jest 的 allowJs 模式处理
    '^.+\\.js$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        allowJs: true,
      },
    }],
  },
  // 用前缀匹配覆盖整个 unified / remark / rehype / micromark / hast / unist / vfile 生态
  transformIgnorePatterns: [
    '/node_modules/(?!(' + [
      'unified', 'bail', 'is-plain-obj', 'trough', 'devlop',
      'remark', 'rehype', 'shiki', '@shikijs',
      'hast', 'hastscript', 'parse5',
      'unist',
      'mdast',
      'vfile',
      'micromark',
      'decode-named-character-reference', 'character-entities',
      'property-information', 'web-namespaces',
      'space-separated-tokens', 'comma-separated-tokens',
      'zwitch', 'longest-streak',
      'html-void-elements', 'stringify-entities',
      'trim-lines', 'ccount', 'markdown-table', 'escape-string-regexp',
    ].join('|') + '))',
  ],
};
