// ESLint 9 flat config
// 本地检查（npm run lint）与上线前检查（npm run check / Dockerfile 构建）共用本配置
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default tseslint.config(
  {
    // 忽略构建产物与自动生成的声明文件
    ignores: ['dist/**', 'node_modules/**', 'src/auto-imports.d.ts', 'src/components.d.ts']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    // .vue 文件中的 <script lang="ts"> 由 typescript-eslint 解析
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },
  {
    // 浏览器侧源码
    files: ['src/**/*.{ts,tsx,vue,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser
    },
    rules: {
      // 项目仍在演进，any 先作为警告暴露，不阻断检查流程
      '@typescript-eslint/no-explicit-any': 'warn',
      // views 目录为路由页面组件，文件名即路由路径（index/detail/404 等），不强制多词命名
      'vue/multi-word-component-names': ['error', {
        ignores: ['index', 'detail', '404']
      }],
      // 自动导入（unplugin-auto-import）注入的 API 已由 auto-imports.d.ts 声明类型；
      // TS 场景下 no-undef 无法理解类型声明，按官方建议关闭，未定义变量交给 tsc 兜底
      'no-undef': 'off'
    }
  },
  {
    // Node 侧构建与检查脚本
    files: ['*.config.ts', '*.config.mjs', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node
    }
  }
)
