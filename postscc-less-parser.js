const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const syntax = require('postcss-less');
const cssss = `
    @prefix: 'ant';
    @{prefix}-btn {
      color: red;
    }
`;
const result = syntax.parse(antdComponentsLess);

const properties = [
  "background",
  "background-color",
  "border",
  "border-left",
  "border-right",
  "border-bottom",
  "border-top",
  "text-shadow",
  "box-shadow",
];
const invalidColors = []; //['none', 'transparent'];
const numericValueRegex = /^\d+(%|ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmax|vmin|vw)$/;

const processNode = ({
  type,
  name,
  prop,
  value,
  selector,
  nodes,
  variable,
  ...rest
}) => {
  if (type === "atrule" && !variable) {
    // console.log('processNode -> name', name, variable, selector)
    return "";
  }
  if (type === "decl") {
    if (numericValueRegex.test(value)) {
      return "";
    }
    if (invalidColors.indexOf(value) > -1) {
      return "";
    }
    if (properties.indexOf(prop) === -1 && !prop.includes("color")) {
      return "";
    } else {
      return `${prop}: ${value};`;
    }
  } else if (type === "comment") {
    // ignore
    return "";
  } else if (type === "rule") {
    const innerContent = nodes.map(processNode).join("");
    if (!innerContent) return "";
    return `${selector} {
          ${innerContent}
        }`;
  } else {
    // alrule i.e, @media etc.
    // console.log('@atrule', type, prop, value, selector, nodes, variable, rest)
    // if (variable) {
    //   return `@${name}: ${value};\n`;
    // }
    return "";
  }
};
let out = result.nodes.map(processNode).join("\n");
// console.log('out', out)
out = out
  .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")
  .replace(/^\s*$(?:\r\n?|\n)/gm, "");
// console.log('out', out)
fs.writeFileSync("./results.less", out);
