# antd-theme-generator

This script generates color specific styles/less file which you can use to change theme dynamically in browser

## Example:

```
const { generateTheme } = require('antd-theme-generator');

const options = {
  antDir: path.join(__dirname, './node_modules/antd'),
  stylesDir: path.join(__dirname, './src/styles'),
  varFile: path.join(__dirname, './src/styles/variables.less'), // default path is Ant Design default.less file
  mainLessFile: path.join(__dirname, './src/styles/index.less'),
  themeVariables: ['@primary-color'],
  outputFilePath: path.join(__dirname, './public/color.less') // if provided, file will be created with generated less/styles
  customColorRegexArray: [/^fade\(.*\)$/], // An array of regex codes to match your custom color variable values so that code can identify that it's a valid color. Make sure your regex does not adds false positives.
}

generateTheme(options).then(less => {
  console.log('Theme generated successfully');
})
.catch(error => {
  console.log('Error', error);
})
```
## Note: include all color variables in `varFile` that you want to change dynamically and assign them unique color codes. Don't assign same color to two or more variables and don't use `#fff`, `#ffffff`, `#000` or `#000000`. If you still want white or black color as default, slightly change it e.g. `#fffffe` or `#000001` which will not replace common background colors from other components. 

## If you variables have some custom color code like `fade(@primary-color, 20%)` or something that does not matches with common regex to match a valid color then add your custom regex array as `customColorRegexArray` variable in options object while executing `generateTheme(options)`.

Add following lines in your main html file

```
<link rel="stylesheet/less" type="text/css" href="/color.less" />
<script>
  window.less = {
    async: false,
    env: 'production'
  };
</script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/less.js/2.7.2/less.min.js"></script>
```

Now you can update colors by updating less variables like this

```
window.less.modifyVars({
  '@primary-color': '#0035ff'
})
```
