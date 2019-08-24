import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import flow from 'rollup-plugin-flow'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/main/js/index.js',
  output: {
    file: 'target/es5/bundle.js',
    format: 'umd',
    name: 'push-it-to-the-limit'
  },
  plugins: [
    flow(),
    resolve(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
    commonjs()
  ]
}
