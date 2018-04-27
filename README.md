# antd-theme-generator

This a script to generate color specific styles less file and which you can use to change theme dynamically in browser

## Example:

```
const { generateTheme } = require('antd-theme-generator');

const options = {
  antDir: path.join(__dirname, './node_modules/antd'),
  stylesDir: path.join(__dirname, './src/styles'),
  varFile: path.join(__dirname, './src/styles/variables.less'), // default path is Ant Design default.less file
  mainLessFile: path.join(__dirname, './src/styles/index.less'),
  themeVariables: ['@primary-color'],
  indexFileName: 'index.html',
  outputFilePath: path.join(__dirname, './public/color.less') // if provided, file will be created with generated less/styles
}

generateTheme(options).then(less => {
  console.log('Theme generated successfully');
})
.catch(error => {
  console.log('Error', error);
})
```

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

Now you can update colors by updating less avriables like this

```
window.less.modifyVars({
  '@primary-color': '#0035ff'
})
```
