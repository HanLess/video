import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'mp4-reader/index.js',
    output: {
      file: 'public/mp4-reader.js',
      name: 'mp4Reader',
      format: 'umd'
    },
    plugins: [
        resolve(),
        babel({
          exclude: 'node_modules/**' 
        }),
        commonjs()
      ]
};