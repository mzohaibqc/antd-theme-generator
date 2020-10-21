# Changelog
This document contains changes in this package with each version change.
## [1.2.8] - 2020-10-21 (latest)
Fixed Link buton border color
Issue Fixed: https://github.com/mzohaibqc/antd-theme-generator/issues/64
## [1.2.7] - 2020-10-18
Fixed slider thumb active color issue
Fixed issues relater to box-shadow
## [1.2.6] - 2020-10-15
Fixed a bug. input box-shadow color was generated different for every build due to `fade()`, fixed now.
Fixed following bug:
https://github.com/mzohaibqc/antd-theme-webpack-plugin/issues/69
## [1.2.5] - 2020-10-10
stylesDir can be a string or array of strings (['path1', 'path2']) if you have more than one styles directories in your project or you want to specify some sub directories e.g your component and containers directories containing styles for each component inside that directory.
## [1.2.4] - 2020-06-06
- Fixed following issues
    - https://github.com/ant-design/ant-design/issues/24777
    - https://github.com/mzohaibqc/antd-theme-generator/issues/45
## [1.2.3] - 2020-05-19
- Rewamped base script to remove restriction to use unique theme color values for different variables, now you can use same color for multiple variables or even 
 variables as value for other variables
- now generated color.less size has been reduced by 30% or more (300kB -> 200kB) due to removal of redundant rules and ant design variables


## [1.2.1] - 2020-04-25
- Added code to remove statements with value containing url like `background: url('some url')`  in color.less file
- Here is detail about the issue: https://github.com/mzohaibqc/antd-theme-generator/issues/38

## [1.2.0] - 2020-04-25
- Added code to remove background-image url in color.less file
- Here is detail about the issue: https://github.com/mzohaibqc/antd-theme-generator/issues/8
