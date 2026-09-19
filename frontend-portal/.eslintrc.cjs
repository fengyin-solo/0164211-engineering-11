module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.vue']
  },
  extends: [
    'eslint:recommended',
    // 使用 vue3-essential（错误预防类规则）；模板格式化类规则（如 max-attributes-per-line）
    // 与项目现有紧凑模板风格冲突，不强制启用
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // 视图组件多为 index.vue / detail.vue 等单名单文件组件，由路由组织，无需多词命名
    'vue/multi-word-component-names': 'off',
    // 与 tsconfig 的 noUnusedLocals/noUnusedParameters 保持一致
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ]
  }
}
