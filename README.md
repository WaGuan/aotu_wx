# aotu_wx
凹凸实验室公众号

## 开始

```bash
git clone https://github.com/o2team/aotu_wx.git
cd aotu_wx && npm i -d
```

将`config/config.js.default`重命名为`config/config.js`，并填入`token`/`appid`/`secret`等信息，然后启动：

```bash
npm start
```

## 小凹公众号

> 请扫描下面关注凹凸实验室公众号，敬请提出宝贵意见：

![凹凸实验室公众号](public/images/qrcode.jpg)

> 功能列表:

1.自定义菜单

  - **官网** [http://aotu.io](http://aotu.io)
  - **期刊** 

    - *H5期刊* [http://aotu.io/cases/mobi/mail.html](http://aotu.io/cases/mobi/mail.html)
    - *前端快报* (待H5版本前端快报开发完成加进来)

  - **联系我们** [http://aotu.io/about](http://aotu.io/about)

2.关键词自动回复

  - 问候命令

    $ 你好/您好

  - 帮助命令

    $ help/bz

  - 反馈命令

    $ 反馈

  - 模糊关键词命令

    $ JXAL 2 (反馈H5精选案例第2期内容，若只输入JXAL则返回最新一期)

  - 版本信息

    $ version