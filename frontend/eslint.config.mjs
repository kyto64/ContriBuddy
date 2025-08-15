// ESLint v9 flat config for Vue 3 + TypeScript
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  // Vue essential rules
  pluginVue.configs['flat/essential'],
  // TypeScript recommended rules (no type-check)
  vueTsConfigs.recommended,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.d.ts'
    ],
    rules: {
      // Keep previous project choice
      'vue/multi-word-component-names': 'off',
      // Don't block builds on boundary-layer anys; keep as warnings
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    languageOptions: {
      ecmaVersion: 'latest',
    },
  },
)
