var sha1 = require('sha1'),
    request = require('request');

// Aotu公众号配置信息
var config = require('../config/config').wx_config.aotu;

// 日志
var log = require('log4js').getLogger('api');

// 工具类
var util = require('../util/util');
 
// JSSDK 类
var JSSDK = function( url, back ) {
  var self = this;
  this.data = {};
  this.data.url = url;
  this.data.noncestr = this.createNonceStr();
  this.data.timestamp = this.createTimeStamp();
  this.getTicket( function( ticket ){
    self.data.ticket = ticket;
    self.data.signature = self.calcSignature( self.data.ticket, self.data.noncestr, self.data.timestamp, url);
    back( self.data );
  });  
}

JSSDK.prototype.getTicket = function( _callback ){
  var self = this;

  util.getToken( config, function( result ){
    if( result.err ){
      res.status(500).send(result.msg);
    } else {
      var access_token = result.data.access_token;
      var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi'

      if( config.cached.jsapi_ticket && config.cached.jsapi_ticket.timestamp ){
	  	console.log(config.cached.jsapi_ticket, '获取jsapi');
        var ts = config.cached.jsapi_ticket.timestamp;
        if( util.isExpireTimeOut( ts ) ){
			log.info('request jsapi', '重新获取');
          request.get({
            url: url
          }, function( error, httpResponse, body ){ 
            config.cached.jsapi_ticket = JSON.parse( body );
            config.cached.jsapi_ticket.timestamp = util.createTimeStamp();
			log.info(config.cached, '重新获取');
            _callback( config.cached.jsapi_ticket );
          });    
        }else{
          log.info(config.cached.jsapi_ticket,'从缓存中获取jsapi_ticket');
          _callback( config.cached.jsapi_ticket );
        }
      }else{
        request.get({
          url: url
        }, function( error, httpResponse, body ){ 
          config.cached.jsapi_ticket = JSON.parse( body );
          config.cached.jsapi_ticket.timestamp = util.createTimeStamp();
          _callback( config.cached.jsapi_ticket );
        }); 
      }      
    }
  });
}


JSSDK.prototype.calcSignature = function( ticket, noncestr, timestamp, url ){
  var str = 'jsapi_ticket=' + ticket.ticket + '&noncestr=' + noncestr + 
            '&timestamp=' + timestamp + '&url=' + url;
  return sha1( str );
}

// 生成随机数
JSSDK.prototype.createNonceStr = function(){
  return Math.random().toString(36).substr(2,15);
}

// 生成时间戳
JSSDK.prototype.createTimeStamp = function(){
  return parseInt( new Date().getTime()/1000, 10 ) + '';
}

module.exports = JSSDK;
