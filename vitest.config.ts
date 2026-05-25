import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.ts'],
    exclude: ['node_modules', '.nuxt', 'dist', '.output']
  },
  resolve: {
    alias: {
      '#shared': resolve(__dirname, 'shared')
    }
  }
})
