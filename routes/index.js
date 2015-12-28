var express = require('express');
var router = express.Router();
var weixin = require('../api/weixin');

// Aotu公众号配置信息
var config = require('../config/config').wx_config.aotu;

// 日志
var log = require('log4js').getLogger('index');

/* GET home page. */
router.get('/', function(req, res, next) {
  // 签名成功
  if (weixin.checkSignature(req)) {
    res.status(200).send(req.query.echostr);
  } else {
    //res.status(200).send('Hello Kugou');
    res.render('page/index');
  }
});

// Start
router.post('/', function(req, res) {
    // loop
    weixin.loop(req, res);
});

// config
weixin.token = config.token;

// 监听文本消息
weixin.textMsg(function(msg) {

    log.info("收到文本消息: " + JSON.stringify(msg));

    // 默认回复语句
    var resMsg = {
      fromUserName: msg.toUserName,
      toUserName: msg.fromUserName,
      msgType: "text",
      content: "小凹在不断的成长，欢迎您给出宝贵的意见，有任何疑问请回复 反馈",
      funcFlag: 0
    };

    // 精确匹配
    switch (msg.content) {
        case "你好" :
        case "您好" :
            // 返回文本消息
            resMsg = {
                fromUserName : msg.toUserName,
                toUserName : msg.fromUserName,
                msgType : "text",
                content : "您好，这里是凹凸实验室，更多精彩内容请回复 help 或者 bz",
                funcFlag : 0
            };
            break;

        case "help" :
        case "bz" :
            // 返回帮助信息
            resMsg = {
              fromUserName : msg.toUserName,
              toUserName : msg.fromUserName,
              msgType : "text",
              content : "小凹在此恭候多时!\n" +
                        "回复命令+关键词获取信息\n" + 
                        "目前支持的功能如下：\n\n" +
                        "  获取某一期精选案例：\n" +
                        "    JXAL 2\n" + 
                        "  获取当前公众号版本号：\n" +
                        "    version"
            }
            break;

        case "version":
            resMsg = {
                fromUserName: msg.toUserName,
                toUserName: msg.fromUserName,
                msgType: "text",
                content: "当前版本号：2015年12月28日\n" +
                         "版权所有：凹凸实验室",
                funcFlag: 0
            };
            break;

        case "freewifi":
            resMsg = {
                fromUserName: msg.toUserName,
                toUserName: msg.fromUserName,
                msgType: "text",
                content: "360buy.com",
                funcFlag: 0
            };
            break;

        case "officewifi":
            resMsg = {
                fromUserName: msg.toUserName,
                toUserName: msg.fromUserName,
                msgType: "text",
                content: "Ecc.360buy.com",
                funcFlag: 0
            };
            break;

        case "反馈" :

            var feedback = [];
            feedback[0] = {
                title : "有话对小凹说？",
                description : "请尽情提出您宝贵的意见反馈，小凹定当竭尽所能改进",
                picUrl : "http://jdc.jd.com/h5/case/img/feedback.jpg",
                url : "/feedback"
            };

            // 返回图文消息
            resMsg = {
                fromUserName : msg.toUserName,
                toUserName : msg.fromUserName,
                msgType : "news",
                articles : feedback,
                funcFlag : 0
            }   
            break;
    }

    // 模糊匹配
    // JXAL 精选案例
    if( isKeyInStr(msg.content, 'JXAL') ){
      var url = 'http://aotu.io/cases/mobi/maga.html?vol=';
      var arr = msg.content.split(' ');
      var num = arr.length > 1 ? arr[ 1 ] : 'latest';
      url = url + num;
      var desc = num == 'latest' ? '最新一期' : '第' +  num + '期';
      var articles = [{
        title : "H5 精品案例赏析",
        description : desc,
        picUrl : "http://jdc.jd.com/h5/case/img/h5case.jpg",
        url : url
      }];
      // 返回图文消息
      resMsg = {
          fromUserName : msg.toUserName,
          toUserName : msg.fromUserName,
          msgType : "news",
          articles : articles,
          funcFlag : 0
      }
    }

    // 判断某个key是否在str里面，若有返回true，若无返回false
    function isKeyInStr( str, key ){
      // 全部转换成大写再来匹配
      str = trim(str);
      key = trim(key);

      if( str.indexOf( key ) !== -1 ){
        return true;
      }

      return false;
    }

    // 去掉前后空格并且转换成大写
    function trim( str ){
      return ("" + str).replace(/^\s+/gi,'').replace(/\s+$/gi,'').toUpperCase();
    }

    log.info('收到文本消息回复： ' + JSON.stringify(resMsg));
    weixin.sendMsg(resMsg);
});

// 监听图片消息
weixin.imageMsg(function(msg) {
    log.info("收到图片消息: " + JSON.stringify(msg));
    var resMsg = {
      fromUserName: msg.toUserName,
      toUserName: msg.fromUserName,
      msgType: "text",
      content: "",
      funcFlag: 0
    };

    log.info("收到图片消息回复：" + JSON.stringify(resMsg));
    weixin.sendMsg(resMsg);
});

// 监听位置消息
weixin.locationMsg(function(msg) {
    log.info("收到位置消息: " + JSON.stringify(msg));
    var resMsg = {
      fromUserName: msg.toUserName,
      toUserName: msg.fromUserName,
      msgType: "text",
      content: "",
      funcFlag: 0
    };

    log.info("收到位置消息回复：" + JSON.stringify(resMsg));
    weixin.sendMsg(resMsg);
});

// 监听链接消息
weixin.urlMsg(function(msg) {
    log.info('收到链接消息：' + JSON.stringify(msg));
    var resMsg = {
      fromUserName: msg.toUserName,
      toUserName: msg.fromUserName,
      msgType: "text",
      content: "",
      funcFlag: 0
    };

    log.info("收到链接消息回复：" + JSON.stringify(resMsg));
    weixin.sendMsg(resMsg);
});

// 监听事件消息
weixin.eventMsg(function(msg) {

    log.info('收到事件消息：' + JSON.stringify(msg));

    // content设置为空，表示不回复任何信息给用户
    var resMsg = {
      fromUserName: msg.toUserName,
      toUserName: msg.fromUserName,
      msgType: "text",
      content: "",
      funcFlag: 0
    };    

    // 订阅
    if(msg.event == "subscribe"){ 
      var welcome = [
        {
          title: "欢迎关注凹凸实验室",
          description: "",
          picUrl : "http://jdc.jd.com/h5/case/img/aotu.jpg",
          url : "http://aotu.io"
        },
        {
          title: "【译】使用NODE.JS创建命令行脚本工具",
          description: "",
          picUrl : "http://jdc.jd.com/h5/case/img/note1.jpg",
          url : "http://aotu.io/notes/2015/12/23/building-command-line-tools-with-node-js/"
        },
        {
          title: "SAFARI 9.0的新特性",
          description: "",
          picUrl : "http://jdc.jd.com/h5/case/img/note2.jpg",
          url : "http://aotu.io/notes/2015/12/23/new-safari-9/"
        },
        {
          title: "WHAT DOES THE FOO MEAN",
          description: "",
          picUrl : "http://jdc.jd.com/h5/case/img/note3.jpg",
          url : "http://aotu.io/notes/2015/12/18/etymology-of-foobar/"
        }
      ];
     
      // 返回图文消息
      resMsg = {
          fromUserName : msg.toUserName,
          toUserName : msg.fromUserName,
          msgType : "news",
          articles : welcome,
          funcFlag : 0
      }     
      // resMsg = {
      //   fromUserName: msg.toUserName,
      //   toUserName: msg.fromUserName,
      //   msgType: "text",
      //   content: "欢迎你关注凹凸实验室公众号，请输入 help 进行命令帮助吧！",
      //   funcFlag: 0
      // }      
    }

    // 点击事件
    if( msg.event == "CLICK" ){
      // 快捷命令
      if( msg.eventKey == "quick_order" ){
        resMsg = {
          fromUserName: msg.toUserName,
          toUserName: msg.fromUserName,
          msgType: "text",
          content : "亲~~\n" +
                    "回复命令+关键词获取信息\n" + 
                    "目前支持的功能如下：\n\n" +
                    "  FreeWifi密码：\n" +
                    "    freewifi \n\n" + 
                    "  OfficeWifi密码：\n" +
                    "    officewifi \n\n" + 
                    "  帮助：\n" + 
                    "    bz/help",
          funcFlag: 0
        }
      }
    }
    
    log.info('收到事件消息回复：' + JSON.stringify(resMsg));
    weixin.sendMsg(resMsg);
});



module.exports = router;
