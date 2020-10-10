# antd-theme-generator

This script generates color specific styles/less file which you can use to change theme dynamically in browser

## Example:

```
const { generateTheme } = require('antd-theme-generator');

const options = {
  antDir: path.join(__dirname, './node_modules/antd'),
  stylesDir: path.join(__dirname, './src'), // all files with .less extension will be processed
  varFile: path.join(__dirname, './src/styles/variables.less'), // default path is Ant Design default.less file
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

| Property | Type | Default | Descript |
| --- | --- | --- | --- |
| antdDir | string | - | This is path to antd directory in your node_modules |
| stylesDir | string, [string] | - | Path/Paths to your custom styles directory containing .less files |
| varFile | string | - | Path to your theme related variables file |
| themeVariables | array | ['@primary-color'] | List of variables that you want to dynamically change |
| outputFilePath | string | - | Generated less content will be written to file path specified otherwise it will not be written. However, you can use returned output and write in any file as you want |
| customColorRegexArray | array | ['color', 'lighten', 'darken', 'saturate', 'desaturate', 'fadein', 'fadeout', 'fade', 'spin', 'mix', 'hsv', 'tint', 'shade', 'greyscale', 'multiply', 'contrast', 'screen', 'overlay'].map(name => new RegExp(`${name}\(.*\)`))] | This array is to provide regex which will match your color value, most of the time you don't need this |


Add following lines in your main html file

```
<link rel="stylesheet/less" type="text/css" href="/color.less" />
<script>
  window.less = {
    async: true,
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
