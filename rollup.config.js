import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'target/es5/index.js',
  output: {
    file: 'target/es5/bundle.js',
    format: 'umd',
    name: 'push-it-to-the-limit'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
}
