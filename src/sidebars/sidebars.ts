import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  docsSidebar: [
    {type: 'html', value: '<li class="sidebar-header">What is Conduit</li>'},
    {type: 'autogenerated', dirName: '0-what-is'},

    {type: 'html', value: '<li class="sidebar-header">Using Conduit</li>'},
    {type: 'autogenerated', dirName: '1-using'},
    
    {type: 'html', value: '<li class="sidebar-header">Developing Conduit</li>'},
    {type: 'autogenerated', dirName: '2-developing', customProps: { slugBase: 'foo' }},
    
    {type: 'html', value: '<li class="sidebar-header">Scaling Conduit</li>'},
    {type: 'autogenerated', dirName: '3-scaling'},
    {type: "link",label: "Conduit Platform",href: "https://meroxa.io"},

    {type: 'html', value: '<li class="sidebar-header">Community</li>'},
    {type: "link", label: "Discord Community",href: "https://discord.meroxa.com"},
    {type: "link", label: "GiHub Discussions",href: "https://github.com/ConduitIO/conduit/discussions"},
    {type: 'autogenerated', dirName: '4-community'},

    {type: 'html', value: '<li class="sidebar-header">Future of Conduit</li>'},
    {type: "link",label: "Roadmap",href: "https://github.com/orgs/ConduitIO/projects/3/views/9"},
    {type: 'autogenerated', dirName: '5-future'},
  ],

  // But you can create a sidebar manually
  
  // docsSidebar: [
  //   'introduction',
  //   'getting-started',
  //   {
  //     type: 'category',
  //     label: 'Tutorial',
  //     items: ['getting-started/architecture'],
  //   },
  // ],
};

export default sidebars;
