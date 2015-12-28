var express = require('express');
var router = express.Router();
var log = require('log4js').getLogger('feedback');

// 反馈页面
router.get('/', function(req, res, next) {
  res.render('page/feedback');
});

// 处理反馈页面
router.post('/', function(req, res, next) {
  var postData = req.body;
  if( postData.feedback_txt ){
    // 将反馈写入feedback.log里面，后续用自动任务定时获取里面的内容
    log.info('反馈postData: ' + JSON.stringify(postData));
    
    res.render('page/feedback',{'msg':'您的反馈小凹已经收到，谢谢~'})
  } else {
    res.render('page/feedback',{'err':'哦哦，您似乎发了一个空的反馈给小凹~'});
  }
});

module.exports = router;
