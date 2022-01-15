const mix = require('laravel-mix');
require('laravel-mix-postcss-config');
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js')
mix.js('resources/js/admin.js', 'public/js')
    .postCss('resources/css/app.css', 'public/assets/css')
    .postCss('resources/css/styles.css', 'public/assets/css')
    .postCssConfig()
    .options({
        processCssUrls: false,
        terser: {
            extractComments: false,
        },
        uglify: {
            sourceMap: false,
            compress: {
                drop_console: true
            },
            output: {
                comments: false,
                beautify: false,
            }
        }
    })
    .extract(['vue'])

// version files only for js and css
if (mix.inProduction()) {
    console.log("Inside production");
    mix.options({
        terser: {
            terserOptions: {
                compress: {
                    drop_console: true,
                }
            }
        }
    })
    mix.version(['public/js/app.js', 'public/assets/css/app.css'])
} else if(!mix.inProduction()) {
    mix.sourceMaps();
    mix.webpackConfig({ devtool: 'inline-source-map'})
}
