/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-i18n' {
  import { DefineComponent } from 'vue'
  export { createI18n, useI18n } from '@intlify/vue-i18n'
}
