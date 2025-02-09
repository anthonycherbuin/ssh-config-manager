import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,vue}'] },
  {
    languageOptions: { 
      globals: globals.browser 
    }
  },
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      // Disable the multi-word component names rule
      'vue/multi-word-component-names': 'off'
    }
  }
];
