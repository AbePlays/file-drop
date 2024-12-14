import adapter from '@sveltejs/adapter-cloudflare'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    alias: {
      '@components': 'src/components',
      '@utils': 'src/utils'
    }
  }
}

export default config
