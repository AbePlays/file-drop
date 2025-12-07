import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { sveltekit } from '@sveltejs/kit/vite';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	optimizeDeps: {
		esbuildOptions: {
			define: { global: 'globalThis' },
			plugins: [NodeGlobalsPolyfillPlugin({ buffer: true, process: true })],
		},
	},
	plugins: [sveltekit(), UnoCSS()],
});
