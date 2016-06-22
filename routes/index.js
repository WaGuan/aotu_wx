var express     = require('express');
var router      = express.Router();
var weixin      = require('../api/weixin');
var request     = require('superagent');

// Aotu公众号配置信息
var config      = require('../config/config');
var aotuConfig  = config.wx_config.aotu;
var keyword     = require('../config/keyword');

// 日志
var log         = require('log4js').getLogger('index');

/* GET home page. */
router.get('/', function(req, res, next) {
  // 签名成功
  if (weixin.checkSignature(req)) {
    res.status(200).send(req.query.echostr);
  } else {
    //res.status(200).send('Hello Kugou');
    res.render('page/index', {title: '凹凸实验室'});
  }
});

// Start
router.post('/', function(req, res) {
    // loop
    weixin.loop(req, res);
});

// config
weixin.token = aotuConfig.token;

// 监听文本消息
weixin.textMsg(function(msg) {

    log.info("收到文本消息: " + JSON.stringify(msg));

    
    var msgContent = trim( msg.content );  // 信息内容    
    var flag = false;  // 是否立即回复

    // 默认回复语句
    var resMsg = {
      fromUserName: msg.toUserName,
      toUserName: msg.fromUserName,
      msgType: "text",
      content: "小凹在不断的成长，欢迎您给出宝贵的意见，有任何疑问请回复 help 或 bz",
      funcFlag: 0
    };

    if( !!keyword.exactKey[ msgContent ] ){
      // 精确匹配
      resMsg = {
        fromUserName: msg.toUserName,
        toUserName: msg.fromUserName,
        msgType: 'text',
        content: keyword.exactKey[ msgContent ].content
      }
      flag = true;
    } else if( isKeyInStr(msgContent, 'JXAL') ){
      // JXAL 精选案例
      var url = 'http://aotu.io/cases/mobi/maga.html?vol=';
      var arr = msgContent.split(' ');
      var num = arr.length > 1 ? arr[ 1 ] : 'latest';
      url += num;
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
      flag = true;
    } else if( msgContent.slice(0,2) == '反馈' ){
      // 反馈 反馈内容
      var arr = msgContent.split(' ');
      if( arr.length > 1 ){
        resMsg = {
            fromUserName: msg.toUserName,
            toUserName: msg.fromUserName,
            msgType: "text",
            content: "谢谢，您的反馈小凹已经收到",
            funcFlag: 0
        };  
        flag = true;
      }      
    } else {
      // 小凹机器人搜索
      var searchUrl =  config.search_url;
      request
        .get( searchUrl + msgContent )
        .end( function(err, resp){
            var result = JSON.parse(resp.text),
                data,
                articles = [];

            if( result.rtn === 0 ){
                data = result.data;
                data.forEach(function(item, i){
                    if( i > 4 ) return;
                    if( i < 4 ){
                      articles[i] = {
                        title : item.title,
                        description : item.summary,
                        picUrl : getImageURL(item, i,msgContent),
                        url : item.url    
                      }
                    } else {
                        // 查看所有
                        articles.push({
                            title : '查看关键词' + msgContent + '更多的内容',
                            description : '',
							picUrl: "http://loremflickr.com/200/200/" + msgContent,
                            url : 'http://aotu.jd.com/aotu_wx/list?key=' + msgContent
                        })    
                    }                  
                });

                if( data.length ){
                  // 返回图文消息
                  resMsg = {
                      fromUserName : msg.toUserName,
                      toUserName : msg.fromUserName,
                      msgType : "news",
                      articles : articles,
                      funcFlag : 0
                  }  
                }                              
            }

            log.info('收到文本消息回复： ' + JSON.stringify(resMsg));
            weixin.sendMsg( resMsg );        
        });
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

    // 获取图片URL
    function getImageURL( item, i, key ){
      var prefix = 'http://aotu.jd.com/aotu_wx/article_imgs/thumbs/';
      var images = item.images;
      var size = i === 0 ? '900x500/' : '200x200/';
      var imageurl = '';
      
      if( !images || images.length ){
        // 无图片
        prefix = 'http://loremflickr.com/';
        imageurl = prefix + size + key;
      } else {
        var image = images[0];
        imageurl = prefix + size + image.name;
      }
      return imageurl;
    }

    if( flag === true ){
      log.info('收到文本消息回复： ' + JSON.stringify(resMsg));
      weixin.sendMsg(resMsg);  
    }
    
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
