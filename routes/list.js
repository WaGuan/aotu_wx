var express = require('express');
var router = express.Router();
var request = require('superagent');

var jssdk = require('../api/jssdk');
var config = require('../config/config');
var appid = config.appid;

// 获取文章列表
router.get('/', function(req, res, next) {

    var key = req.query.key;
    var searchUrl = config.search_url;

    // request
    //     .get( searchUrl + key )
    //     .end( function(err, resp){
    //         var result = JSON.parse(resp.text);
    //         if( result.rtn === 0 ){
    //             res.render('page/list',{ searchurl: config.search_url + key, result: result,data: {noncestr:'111',timestamp:'222',sinature:'333'}, appid: '1234567890'});                
    //         }
    //     });

    request
        .get( searchUrl + key )
        .end( function(err, resp){
            var result = JSON.parse(resp.text),
                data,
                articles = [];
            if( result.rtn === 0 ){
                data = result.data;
                data.forEach(function(item, i){
                    if( i > 5 ){
                        return;
                    }
                    if( i === 0 ){
                        // 大图
                        articles[i] = {
                            title : item.title,
                            description : item.summary,
                            picUrl : "http://jdc.jd.com/h5/case/img/h5case.jpg",
                            url : item.url    
                        }
                    }else if( i < 5 ){
                        // 小图
                        articles.push({
                            title : item.title,
                            description : item.summary,
                            picUrl : "http://jdc.jd.com/h5/case/img/h5case.jpg",
                            url : item.url
                        })    
                    } else {
                        // 查看所有
                        articles.push({
                            title : '查看关键词' + key + '更多的内容',
                            description : '',
                            picUrl : "http://jdc.jd.com/h5/case/img/h5case.jpg",
                            url : 'http://aotu.jd.com/aotu_wx/list?key=' + key
                        })    
                    }
                    
                })
                //res.render('page/list',{ searchurl: config.search_url + key, result: result,data: {noncestr:'111',timestamp:'222',sinature:'333'}, appid: '1234567890'});                
            }

            console.log(articles);
        });

    
  
  // var url = req.query.url || 'http://weinre.qiang.it/aotu_wx/list';

  // new jssdk( url, function( data ){
  //   console.log(data,'data');
  //   res.render('page/list',{ data: data, appid: appid});  
  // });
  
});

module.exports = router;
