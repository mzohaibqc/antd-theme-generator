const fs = require("fs");
const path = require("path");
const glob = require("glob");
const postcss = require("postcss");
const less = require("less");
const bundle = require("less-bundle-promise");
const hash = require("hash.js");
const NpmImportPlugin = require('less-plugin-npm-import');
const colorsOnly = require('postcss-colors-only');
const stripCssComments = require('strip-css-comments');
const syntax = require('postcss-less');
const { gzip, ungzip} = require('node-gzip');

const options = {
  withoutGrey: true, // set to true to remove rules that only have grey colors
  withoutMonochrome: true, // set to true to remove rules that only have grey, black, or white colors
};

let hashCache = "";
let cssCache = "";

/*
  Generated random hex color code 
  e.g. #fe12ee
*/
function randomColor() {
  return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
}

/*
  Recursively get the color code assigned to a variable e.g.
  @primary-color: #1890ff;
  @link-color: @primary-color;
 
  @link-color -> @primary-color ->  #1890ff
  Which means
  @link-color: #1890ff
*/
function getColor(varName, mappings) {
  const color = mappings[varName];
  if (color in mappings) {
    return getColor(color, mappings);
  } else {
    return color;
  }
}
/*
  Read following files and generate color variables and color codes mapping
    - Ant design color.less, themes/default.less
    - Your own variables.less
  It will generate map like this
  {
    '@primary-color': '#00375B',
    '@info-color': '#1890ff',
    '@success-color': '#52c41a',
    '@error-color': '#f5222d',
    '@normal-color': '#d9d9d9',
    '@primary-6': '#1890ff',
    '@heading-color': '#fa8c16',
    '@text-color': '#cccccc',
    ....
  }
*/
function generateColorMap(content, customColorRegexArray = []) {
  return content
    .split("\n")
    .filter(line => line.startsWith("@") && line.indexOf(":") > -1)
    .reduce((prev, next) => {
      try {
        const matches = next.match(
          /(?=\S*['-])([@a-zA-Z0-9'-]+).*:[ ]{1,}(.*);/
        );
        if (!matches) {
          return prev;
        }
        let [, varName, color] = matches;
        if (color && color.startsWith("@")) {
          color = getColor(color, prev);
          if (!isValidColor(color, customColorRegexArray)) return prev;
          prev[varName] = color;
        } else if (isValidColor(color, customColorRegexArray)) {
          prev[varName] = color;
        }
        return prev;
      } catch (e) {
        console.log("e", e);
        return prev;
      }
    }, {});
}

/*
 This plugin will remove all css rules except those are related to colors
 e.g.
 Input: 
 .body { 
    font-family: 'Lato';
    background: #cccccc;
    color: #000;
    padding: 0;
    pargin: 0
 }

 Output: 
  .body {
    background: #cccccc;
    color: #000;
 }
*/
const reducePlugin = postcss.plugin("reducePlugin", () => {
  const cleanRule = rule => {
    if (rule.selector.startsWith(".main-color .palatte-")) {
      rule.remove();
      return;
    }
    let removeRule = true;
    rule.walkDecls(decl => {
      if (decl.prop.includes("background-image")) {
        decl.remove();
      }
      if (String(decl.value).match(/url\(.*\)/g)) {
        decl.remove();
      }
      if (
        !decl.prop.includes("color") &&
        !decl.prop.includes("background") &&
        !decl.prop.includes("border") &&
        !decl.prop.includes("box-shadow")
      ) {
        decl.remove();
      } else {
        removeRule = false;
      }
    });
    if (removeRule) {
      rule.remove();
    }
  };
  return css => {
    css.walkAtRules(atRule => {
      atRule.remove();
    });

    css.walkRules(cleanRule);

    css.walkComments(c => c.remove());
  };
});

function getMatches(string, regex) {
  const matches = {};
  let match;
  while ((match = regex.exec(string))) {
    if (match[2].startsWith("rgba") || match[2].startsWith("#")) {
      matches[`@${match[1]}`] = match[2];
    }
  }
  return matches;
}

/*
  This function takes less input as string and compiles into css.
*/
function render(text, paths) {
  return less.render.call(less, text, {
    paths: paths,
    javascriptEnabled: true,
    plugins: [new NpmImportPlugin({ prefix: '~' })]
  });
}

/*
  This funtion reads a less file and create an object with keys as variable names 
  and values as variables respective values. e.g.
  //variabables.less
    @primary-color : #1890ff;
    @heading-color : #fa8c16;
    @text-color : #cccccc;
  
    to

    {
      '@primary-color' : '#1890ff',
      '@heading-color' : '#fa8c16',
      '@text-color' : '#cccccc'
    }

*/
function getLessVars(filtPath) {
  const sheet = fs.readFileSync(filtPath).toString();
  const lessVars = {};
  const matches = sheet.match(/@(.*:[^;]*)/g) || [];

  matches.forEach(variable => {
    const definition = variable.split(/:\s*/);
    const varName = definition[0].replace(/['"]+/g, "").trim();
    lessVars[varName] = definition.splice(1).join(":");
  });
  return lessVars;
}

/*
  This function take primary color palette name and returns @primary-color dependent value
  .e.g 
  Input: @primary-1
  Output: color(~`colorPalette("@{primary-color}", ' 1 ')`)
*/
function getShade(varName) {
  let [, className, number] = varName.match(/(.*)-(\d)/);
  if (/primary-\d/.test(varName)) className = '@primary-color';
  return 'color(~`colorPalette("@{' + className.replace('@', '') + '}", ' + number + ")`)";
}

/*
  This function takes color string as input and return true if string is a valid color otherwise returns false.
  e.g.
  isValidColor('#ffffff'); //true
  isValidColor('#fff'); //true 
  isValidColor('rgba(0, 0, 0, 0.5)'); //true
  isValidColor('20px'); //false
*/
function isValidColor(color, customColorRegexArray = []) {
  if (!color || color.match(/px/g)) return false;
  if (color.match(/colorPalette|fade/g)) return true;
  if (color.charAt(0) === "#") {
    color = color.substring(1);
    return (
      [3, 4, 6, 8].indexOf(color.length) > -1 && !isNaN(parseInt(color, 16))
    );
  }
  const isColor = /^(rgb|hsl|hsv)a?\((\d+%?(deg|rad|grad|turn)?[,\s]+){2,3}[\s\/]*[\d\.]+%?\)$/i.test(
    color
  );
  if (isColor) return true;
  if (customColorRegexArray.length > 0) {
    return customColorRegexArray.reduce((prev, regex) => {
      return prev || regex.test(color);
    }, false);
  }
  return false;
}

async function compileAllLessFilesToCss(stylesDir, antdStylesDir, varMap = {}) {
  /* 
    Get all less files path in styles directory
    and then compile all to css and join
  */
  const styles = glob.sync(path.join(stylesDir, './**/*.less'));
  const csss = await Promise.all(
    styles.map(filePath => {
      let fileContent = fs.readFileSync(filePath).toString();
      Object.keys(varMap).forEach(varName => {
        fileContent = fileContent.replace(new RegExp(varName, 'g'), varMap[varName]);
      });
      return less
        .render(fileContent, {
          paths: [
            stylesDir,
            antdStylesDir,
          ],
          filename: path.resolve(filePath),
          javascriptEnabled: true,
          plugins: [new NpmImportPlugin({ prefix: '~' })],
        })
        .catch(() => '\n');
    }

    )
  );
  const hashes = {};

  return csss.map(c => {
    const css = stripCssComments(c.css || '', { preserve: false });
    const hashCode = hash.sha256().update(css).digest('hex');
    if (hashCode in hashes) {
      return '';
    } else {
      hashes[hashCode] = hashCode;
      return css;
    }
  }).join('\n')
}

/*
  This is main function which call all other functions to generate color.less file which contins all color
  related css rules based on Ant Design styles and your own custom styles
  By default color.less will be generated in /public directory
*/
async function generateTheme({
  antDir,
  antdStylesDir,
  stylesDir,
  mainLessFile,
  varFile,
  outputFilePath,
  cssModules = false,
  themeVariables = ['@primary-color'],
  customColorRegexArray = []
}) {
  let antdPath;
  if (antdStylesDir) {
    antdPath = antdStylesDir;
  } else {
    antdPath = path.join(antDir, 'lib');
  }
  // const entry = path.join(antdPath, './style/index.less');
  // const styles = glob.sync(path.join(antdPath, './*/style/index.less'));

  const antdStylesFile = path.join(antDir, './dist/antd.less'); //path.join(antdPath, './style/index.less');
  /*
    You own custom styles (Change according to your project structure)
    
    - stylesDir - styles directory containing all less files 
    - mainLessFile - less main file which imports all other custom styles
    - varFile - variable file containing ant design specific and your own custom variables
  */
  varFile = varFile || path.join(antdPath, "./style/themes/default.less");

  // let content = fs.readFileSync(entry).toString();
  // content += "\n";
  // styles.forEach(style => {
  //   content += `@import "${style}";\n`;
  // });
  // if (mainLessFile) {
  //   const customStyles = fs.readFileSync(mainLessFile).toString();
  //   content += `\n${customStyles}`;
  // }
  // const hashCode = hash.sha256().update(content).digest('hex');
  // if (hashCode === hashCache) {
  //   resolve(cssCache);
  //   return;
  // }
  // hashCache = hashCode;
  let themeCompiledVars = {};
  let themeVars = themeVariables || ["@primary-color"];
  const lessPaths = [
    path.join(antdPath, "./style"),
    stylesDir
  ];

  const randomColors = {};
  const randomColorsVars = {};
  /*
  Ant Design Specific Files (Change according to your project structure)
  You can even use different less based css framework and create color.less for  that
 
  - antDir - ant design instalation path
  - entry - Ant Design less main file / entry file
  - styles - Ant Design less styles for each component

  1. Bundle all variables into one file
  2. process vars and create a color name, color value key value map
  3. Get variables which are part of theme
  4. 
*/



  const varFileContent = await bundle({ src: varFile });
  const colorFileContent = await bundle({ src: path.join(antdPath, "./style/color/colors.less") });
  const colorPalettePath = path.join(antdPath, "./style/color/colorPalette.less");
  console.log(': ---------------------------------')
  console.log('colorPalettePath', colorPalettePath)
  console.log(': ---------------------------------')
  
  let colorPeletteContent = await bundle({ src: colorPalettePath });
  const mappings = Object.assign(generateColorMap(varFileContent, customColorRegexArray), generateColorMap(mainLessFile, customColorRegexArray));
  let css = "";
  themeVars = themeVars.filter(name => name in mappings && !name.match(/(.*)-(\d)/));
  themeVars.forEach(varName => {
    const color = randomColor();
    randomColors[varName] = color;
    randomColorsVars[color] = varName;
    css = `.${varName.replace("@", "")} { color: ${color}; }\n ${css}`;
  });

  let varsContent = '';
  themeVars.forEach(varName => {
    [1, 2, 3, 4, 5, 7, 8, 9, 10].forEach(key => {
      let name = varName === '@primary-color' ? `@primary-${key}` : `${varName}-${key}`;
      css = `.${name.replace("@", "")} { color: ${getShade(name)}; }\n ${css}`;
    });
    varsContent += `${varName}: ${randomColors[varName]};\n`;
  });

  css = `${colorFileContent}\n${varsContent}\n${css}`;
  let results = await render(css, lessPaths);
  css = results.css;
  css = css.replace(/(\/.*\/)/g, "");
  const regex = /.(?=\S*['-])([.a-zA-Z0-9'-]+)\ {\n\ \ color:\ (.*);/g;
  themeCompiledVars = getMatches(css, regex);

  // Convert all custom user less files to css
  const userCustomCss = await compileAllLessFilesToCss(stylesDir, antdStylesDir, themeCompiledVars);

  let antLessContent = `@import "../lib/style/components.less";` //fs.readFileSync(antdStylesFile).toString();
  let varsCombined = '';
  // themeVars.forEach(varName => {
  console.log(': -------------------')
  console.log('themeVars', themeVars.includes('@btn-group-border'), themeVars.includes('@primary-5'))
  console.log(': -------------------')
  //   varsCombined = `${varsCombined}\n${varName}: ${themeCompiledVars[varName]};`;
  // });
  // Object.keys(themeCompiledVars).forEach(varName => {
  themeVars.forEach(varName => {
    if (/(.*)-(\d)/.test(varName)) {
      color = getShade(varName);
      return;
    } else {
      color = themeCompiledVars[varName];
    }
    varsCombined = `${varsCombined}\n${varName}: ${color};`;
  });
    console.log(': -------------------------')
    console.log('varsCombined', varsCombined)
    console.log(': -------------------------')
  antLessContent = `${colorFileContent}\n@import "../lib/style/index.less";\n${varsCombined}\n${antLessContent}`;
  console.log(': -----------------------------')
  // console.log('antLessContent', antLessContent)
  console.log(': -----------------------------')
  const { css: antCss } = await render(antLessContent, [antdPath, antdStylesDir]);
  fs.writeFileSync('./ant.css', antCss);
  const allCss = `${antCss}\n${userCustomCss}`;
  results = await postcss([reducePlugin])
    // return postcss.use(colorsOnly(options))
    .process(allCss, {
      parser: less.parser,
      // from: entry
    });
  css = results.css;


  Object.keys(themeCompiledVars).forEach(varName => {
    let color;
    if (/(.*)-(\d)/.test(varName)) {
      color = themeCompiledVars[varName];
      varName = getShade(varName);
    } else {
      color = themeCompiledVars[varName];
    }
    color = color.replace('(', '\\(').replace(')', '\\)');
    // css = css.replace(new RegExp(`${color}`, "g"), varName); // Fixed bug https://github.com/mzohaibqc/antd-theme-webpack-plugin/issues/25
    css = css.replace(new RegExp(`${color}` + ' *;', "g"), `${varName};`);
  });

  // Removed all those rule which don't contain color variables since those can't be modified in browser using less.modifyVars()
  // css = await postcss([removeColorCodesPlugin])
  //   .process(css, { syntax })
  //   .then(({ css}) => css);



  // css = `${varFileContent}\n${css}`;
  console.log(': -------')
  console.log('css @comment-padding-base', colorPeletteContent.includes('@comment-padding-base'))
  console.log(': -------')
  // console.log('match', colorFileContent.match(/@[\w+-]+:\ (.*);/g));
  css = css.replace(new RegExp(`^@[\w+-]+:\ (.*);$`, 'g'), '');
  colorPeletteContent = combineLess(path.join(antdPath, "./style/themes/default.less"))
  console.log(': ---------------------------------------')
  console.log('colorPeletteContent', colorPeletteContent)
  console.log(': ---------------------------------------')
  fs.writeFileSync('./colorPelette.less', colorPeletteContent);
//   colorPeletteContent = `
//   ${fs.readFileSync(path.join(antdPath, "./style/color/bezierEasing.less")).toString()}\n
//   ${fs.readFileSync(path.join(antdPath, "./style/color/tinyColor.less")).toString()}\n
//   ${fs.readFileSync(path.join(antdPath, "./style/color/colorPalette.less")).toString()
//   .replace('@import "bezierEasing";', '')
//   .replace('@import "tinyColor";', '')
// }\n
//   `;

  

  const topVars = themeVars.reverse().map(varName => {
  return `${varName}: ${mappings[varName]};`;
}).join('\n');
console.log('topVars', topVars)
  let requiredVars = '';
  requiredVars += fs.readFileSync(path.join(antdPath, "./style/color/colors.less")).toString()
    .split("\n")
    .filter(line => line.startsWith("@") && line.indexOf(":") > -1)
    .map(line => {
      try {
        const matches = line.match(
          /(?=\S*['-])([@a-zA-Z0-9'-]+).*:[ ]{1,}(.*);/
        );
        return matches ? line + '\n': '';
      } catch (e) {
        return '';
      }
    }).join('');
  requiredVars += fs.readFileSync(path.join(antdPath, "./style/themes/default.less")).toString()
    .split("\n")
    .map(line => {
      return line.startsWith('//') || line.startsWith('/*') || line === '' || line.startsWith('@import')? '' : line + '\n';
    }).join('');
  console.log(': ---------------------------------------')
  css = `${colorPeletteContent}\n${varsCombined}\n${css}`;


  themeVars.reverse().forEach(varName => {
    css = css.replace(new RegExp(`${varName}(\ *):(.*);`, 'g'), '');
    css = `${varName}: ${mappings[varName]};\n${css}\n`;
  });

  css = css.replace(/\\9/g, ''); //.replace(new RegExp('@black', 'g'), '#000000').replace(new RegExp('@white', 'g'), '#ffffff');
  css = `
  @white: #fff;
  @black: #000;
  ${requiredVars}
  ${css}`
  // css = await gzip(css);
  if (outputFilePath) {
    fs.writeFileSync(outputFilePath, css);
    console.log(
      `🌈 Theme generated successfully. OutputFile: ${outputFilePath}`
    );
  } else {
    console.log(`Theme generated successfully`);
  }
  cssCache = css;
  return cssCache;
}

module.exports = {
  generateTheme,
  isValidColor,
  getLessVars,
  randomColor,
  renderLessContent: render
};

const removeColorCodesPlugin = postcss.plugin("removeColorCodesPlugin", () => {
  const cleanRule = rule => {
    let removeRule = true;
    rule.walkDecls(decl => {
      if (
        !decl.value.includes("@")
      ) {
        decl.remove();
      } else {
        removeRule = false;
      }
    });
    if (removeRule) {
      rule.remove();
    }
  };
  return css => {
    css.walkRules(cleanRule);
  };
});

function combineLess(filePath) {
  console.log('combineLess -> filePath', filePath)
  let fileContent = fs.readFileSync(filePath).toString();
  const directory = path.dirname(filePath);
  return fileContent.split("\n")
    // .filter(line => line.startsWith("@") && line.indexOf(":") > -1)
    .map(line => {
    console.log(': ------------------------')
    console.log('combineLess -> line', line)
    console.log(': ------------------------', line.match(/@import\ ["'](.*)["'];/))
      if (line.startsWith('@import')) {
        let importPath = line.match(/@import\ ["'](.*)["'];/)[1];
        if (!importPath.endsWith('.less')) {
          importPath += '.less';
        }
        return combineLess(path.join(directory, importPath))
      }
      return line;
    }).join('\n');
}