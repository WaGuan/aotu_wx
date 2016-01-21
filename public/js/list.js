(function($){
  var Robot = {    
    init: function(){
      this.list = $('#J_list');
      this.loadingWrap = $('#J_loadingWrap');
      this.count = $('#count').html();
      this.page = 1;
      // 列表模板
      this.tpl = [
        '<a class="item" href="{{url}}" target="_blank">',
          '<div class="item_info">',
            '<h3 class="item_tit">{{title}}</h3>',
            '<p class="item_desc">{{summary}}</p>',
          '</div>',
        '</a>'
      ].join('');
      this.dealScroll();
    },
    toggleLoading: function(){
      var loadingWrap = this.loadingWrap;
      loadingWrap.hasClass('hide') ? loadingWrap.removeClass('hide') : loadingWrap.addClass('hide');  
    },
    dealScroll: function(){
      var self = this,
          win = $(window),
          doc = $(document),        
          winH = win.height();
      
      win.on('scroll', self.debounce(function(e){        
        var winScrollY = window.scrollY,
            loadingOffsetTop = self.loadingWrap.offset().top;
        if( Math.abs( winScrollY + winH - loadingOffsetTop ) < 50 ){
          if( self.page <= Math.floor(self.count/self.page) ){
            self.getData(self.page++);  
          }else{
            self.loadingWrap.remove();
          }         
        }
        
      }, 300));      
    },
    debounce: function(func, wait, immediate) {
      var timeout;
      return function() {
          var context = this, args = arguments;
          var later = function() {
              timeout = null;
              if (!immediate) func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
      };
    },
    getData: function( page ){
      var self = this;
      var page = page || 0;
      $.ajax({
        //url: $('#searchurl').html() + '&page=' + page + '&length=10',        
        url: $('#searchurl').html().replace('localhost','aotu.jd.com') + '&page=' + page + '&length=10',        
        type: 'GET',
        dataType: 'json',
        success: function( data ){
          var html = self.renderData(self.tpl, data.data);
          self.loadingWrap.before(html.join(''));
        }
      })
    },
    renderData: function( tpl, data ){
      return data.map(function( item,i ){
        return tpl.replace(/{{(\w+)}}/gi, function( $0,$1 ){          
          return item[ $1 ];
        });
      });
    }
  }

  // 启动应用
  Robot.init();
})(Zepto);
