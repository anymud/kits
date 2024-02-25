import consola from "consola"

try {
    consola.info('Starting build')
    await Bun.build({
        entrypoints: [
            './src/index.ts',
            './src/chain/index.ts',
            './src/chain/async.ts',
            './src/iter/index.ts',
            './src/iter/async.ts',
        ],
        outdir: './dist',
        external: [
        ],
        target: 'node',
    })
    consola.success('Build complete')
} catch (e) {
    consola.error('Build failed', e)
}