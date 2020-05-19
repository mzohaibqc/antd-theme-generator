import React, { Component } from 'react';
import { BuildOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import { Menu } from 'antd';

const { SubMenu } = Menu;

class Menus extends Component {
  render() {
    const { dark } = this.props;

    return (
      <Menu
        mode="inline"
        theme={dark ? 'dark' : 'light'}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="Color"><a href="#Color">Color</a></Menu.Item>
        <Menu.Item key="Typography"><a href="#Typography">Typography</a></Menu.Item>
        {/* <SubMenu
          key="sub1"
          title={
            <span>
              <Icon type="appstore" />Base
            </span>
          }
        >
          <Menu.Item key="Color"><a href="#Color">Color</a></Menu.Item>
          <Menu.Item key="Typography"><a href="#Typography">Typography</a></Menu.Item>
        </SubMenu> */}
        <SubMenu
          key="sub2"
          title={
            <span>
              <LaptopOutlined />Form
            </span>
              }
        >
          <Menu.Item key="Button"><a href="#Button">Button</a></Menu.Item>
          <Menu.Item key="Radio"><a href="#Radio">Radio</a></Menu.Item>
          <Menu.Item key="Checkbox"><a href="#Checkbox">Checkbox</a></Menu.Item>
          <Menu.Item key="Input"><a href="#Input">Input</a></Menu.Item>
          <Menu.Item key="Select"><a href="#Select">Select</a></Menu.Item>
          <Menu.Item key="TreeSelect"><a href="#TreeSelect">TreeSelect</a></Menu.Item>
          <Menu.Item key="Cascader"><a href="#Cascader">Cascader</a></Menu.Item>
          <Menu.Item key="Switch"><a href="#Switch">Switch</a></Menu.Item>
          <Menu.Item key="DatePicker"><a href="#DatePicker">DatePicker</a></Menu.Item>
          <Menu.Item key="TimePicker"><a href="#TimePicker">TimePicker</a></Menu.Item>
          <Menu.Item key="Slider"><a href="#Slider">Slider</a></Menu.Item>
          <Menu.Item key="Dropdown"><a href="#Dropdown">Dropdown</a></Menu.Item>
          <Menu.Item key="Rate"><a href="#Rate">Rate</a></Menu.Item>
          <Menu.Item key="Steps"><a href="#Steps">Steps</a></Menu.Item>
          <Menu.Item key="Transfer"><a href="#Transfer">Transfer</a></Menu.Item>
          <Menu.Item key="Form"><a href="#Form">Form</a></Menu.Item>
        </SubMenu>
        <SubMenu
          key="sub3"
          title={
            <span>
              <BuildOutlined />View
            </span>
              }
        >
          <Menu.Item key="Menu"><a href="#Menu">Menu</a></Menu.Item>
          <Menu.Item key="Tabs"><a href="#Tabs">Tabs</a></Menu.Item>
          <Menu.Item key="Table"><a href="#Table">Table</a></Menu.Item>
          <Menu.Item key="Pagination"><a href="#Pagination">Pagination</a></Menu.Item>
          <Menu.Item key="Progress"><a href="#Progress">Progress</a></Menu.Item>
          <Menu.Item key="Tree"><a href="#Tree">Tree</a></Menu.Item>
          <Menu.Item key="Card"><a href="#Card">Card</a></Menu.Item>
          <Menu.Item key="List"><a href="#List">List</a></Menu.Item>
          <Menu.Item key="Calendar"><a href="#Calendar">Calendar</a></Menu.Item>
          <Menu.Item key="Avatar"><a href="#Avatar">Avatar</a></Menu.Item>
          <Menu.Item key="Spin"><a href="#Spin">Spin</a></Menu.Item>
          <Menu.Item key="Collapse"><a href="#Collapse">Collapse</a></Menu.Item>
          <Menu.Item key="Carousel"><a href="#Carousel">Carousel</a></Menu.Item>
          <Menu.Item key="Timeline"><a href="#Timeline">Timeline</a></Menu.Item>
        </SubMenu>
        <SubMenu
          key="sub4"
          title={
            <span>
              <NotificationOutlined />Hint
            </span>
              }
        >
          <Menu.Item key="Badge"><a href="#Badge">Badge</a></Menu.Item>
          <Menu.Item key="Alert"><a href="#Alert">Alert</a></Menu.Item>
          <Menu.Item key="Message"><a href="#Message">Message</a></Menu.Item>
          <Menu.Item key="Notification"><a href="#Notification">Notification</a></Menu.Item>
          <Menu.Item key="Tag"><a href="#Tag">Tag</a></Menu.Item>
          <Menu.Item key="Tooltip"><a href="#Tooltip">Tooltip</a></Menu.Item>
          <Menu.Item key="Popover"><a href="#Popover">Popover</a></Menu.Item>
          <Menu.Item key="Modal"><a href="#Modal">Modal</a></Menu.Item>
          <Menu.Item key="Popconfirm"><a href="#Popconfirm">Popconfirm</a></Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

export default Menus;
