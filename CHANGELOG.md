# Changelog
This document contains changes in this package with each version change.
## [1.2.4] - 2020-06-06 (latest)
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
