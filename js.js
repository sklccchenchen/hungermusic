var EventCenter = {
  on:function(type,handler){
    $(document).on(type,handler)
  },
  fire:
  function(type,data){
      $(document).trigger(type,data)
    }
}


var footer = {
  init:function(){
    this.$footer = $('footer')
    this.$box = this.$footer.find('.box')
    this.$ul = this.$footer.find('ul')
    this.$leftBtn = this.$footer.find('.icon-lastpage')
    this.$rightBtn = this.$footer.find('.icon-nextpage') 
    this.isAnimate = false;
    this.bind() 
    this.render()
  },
  bind:function(){
    var _this = this
    var liWidth = _this.$footer.height() 
    var count = Math.floor(_this.$box.width()/liWidth) 
   
    _this.$rightBtn.on('click',function(){
      if(_this.isAnimate)  return
      if(_this.$box.width() - parseFloat(_this.$ul.css('left')) < _this.$ul.width()){
        _this.isAnimate = true
        _this.$ul.animate({
      left:'-='+_this.$box.find('li').outerWidth(true)*count
      },400,function(){
          _this.isAnimate = false
//         console.log(_this.$box.width(),
//           parseFloat(_this.$ul.css('left')))
        })
      }      
    })
    
    _this.$leftBtn.on('click',function(){
      if(_this.isAnimate)  return
      if(parseFloat(_this.$ul.css('left')) < 0){
         _this.isAnimate = true
         _this.$ul.animate({
      left:'+='+_this.$box.find('li').outerWidth(true)*count
      },400,function(){
             _this.isAnimate = false
         })
      }
    })
    
    _this.$footer.on('click','li',function(){
      console.log($(this))
      $(this).addClass('active')
          .siblings().removeClass('active')
//       console.log(1,$this)
      EventCenter.fire('select-album',$(this).attr('channel-id'))
    })
  },
  render:function(){
    var _this = this
    $.ajax({
      url:'http://api.jirengu.com/fm/getChannels.php',
      type:'GET',
      dataType:'json'
    }).done(function(ret){
      console.log(ret)
      ret.channels.forEach(function($node){
        renderfooter($node)
      })
      _this.setStyle()
    }).fail(function(ret){
      console.log('error')
    })
    
    function renderfooter($item){
      var $tpl = '';
      $tpl += '<li channel-id="' + $item.channel_id + '">';
      $tpl += '<div class="pic" style = "background:url(' + "'" + $item.cover_small + "') center center " + '"background-size:cover"' + '></div>' ;
      $tpl += '<p><strong>' + $item.name + '</strong></p></li>' 
      $('footer ul').append($tpl)
    }  
  },
  setStyle:function(){
    var count = this.$footer.find('li').length
    var width = this.$footer.find('li').outerWidth(true)
    this.$footer.find('ul').css({width :count*width + 'px'})
  }
}



var Fm = {
  init:function(){
    this.$container = $('#page-music')
    this.audio = new Audio()
    this.audio.autoplay = true  
    this.bind()
  },
  bind:function(){
    var _this = this
    EventCenter.on('select-album',function(e,channelName){
       _this.channelName = channelName 
       console.log(1,channelName)
       _this.loadMusic(function(){
         _this.setMusic()
       })   
    })
    
    this.$container.find('.btn-pause').on('click',function(){
      $btn = $(this)
//       $btn.toggleClass('icon-play').toggleClass('icon-pause')
      if($btn.hasClass('icon-play')){
        $btn.removeClass('icon-play').addClass('icon-pause')
        _this.audio.play()
      }else{
          $btn.removeClass('icon-pause').addClass('icon-play')
          _this.audio.pause()
        }
    })
    
    this.$container.find('.icon-next').on('click',function(){
      _this.loadMusic(function(){
        _this.setMusic()
      })
    })
    
    this.audio.addEventListener('play',function(){
      clearInterval(_this.statusClock)
      _this.statusClock = setInterval(function(){
        _this.updateStatus()
      },1000)
    })
    this.audio.addEventListener('pause',function(){
      clearInterval(_this.statusClock)
    })
  },
  loadMusic(callback){
    var _this = this
    console.log('Loading...')
    $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel:this.channelId}).done(function(ret){
      console.log(ret)
      _this.song = ret['song'][0]
      _this.setMusic()
      _this.loadLyric()
    })
  },
  
  loadLyric(){
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php',{sid:this.song.sid}).done(function(ret){
      console.log(ret)
      var lyric = ret.lyric
      var lyricObj = {}
      lyric.split('\n').forEach(function(line){
        var times = line.match(/\d{2}:\d{2}/g)
        var str = line.replace(/\[.+?\]/g,'')
        if(Array.isArray(times)){
          times.forEach(function(time){
            lyricObj[time] = str
          })
        }
      })
      _this.lyricObj = lyricObj
    })
  },
  
  setMusic(){
    console.log('setMusic...')
    console.log($(this))
    console.log(this.song)
    this.audio.src = this.song.url
    $('#background').css('background-image','url('+this.song.picture + ')')
    this.$container.find('.aside figure').css('background-image','url('+ this.song.picture + ')')
    this.$container.find('.details .title').text(this.song.title)
    this.$container.find('.details .singer').text(this.song.artist)
//     this.$container.find('.tag').text(this.channelName)
    if(this.$container.find('.btn-pause').hasClass('icon-play')){
      this.$container.find('.btn-pause').addClass('icon-pause').removeClass('icon-play')
    }
  },
  updateStatus(){
//     console.log(this.audio.currentTime)
    var curTime = this.audio.currentTime
    var duration = this.audio.duration
    var sec = Math.floor(curTime%60) + ''
    var min = Math.floor(curTime/60) + ''
    if(min.length < 2){
      min = '0' + min
    }
    if(sec.length < 2){
      sec = '0' + sec
    }
    this.$container.find('.curtime').text(min + ':' + sec)
    this.$container.find('.cur-bar').css('width',curTime/duration*100 + '%')
    var line = this.lyricObj[min + ":" + sec]
    if(line){
      this.$container.find('.cur-lyric').text(line).boomText()
    }
  }
    
}

$.fn.boomText = function(type){
  type = type || 'rollIn'
  this.html(function(){
    var arr = $(this).text()
    .split('').map(function(word){
        return '<span  style="opacity:0;display:inline-block">'+ word + '</span>'
    })
    return arr.join('')
  })
  
  var index = 0
  var $boomTexts = $(this).find('span')
  var clock = setInterval(function(){
    $boomTexts.eq(index).addClass('animated ' + type)
    index++
    if(index >= $boomTexts.length){
      clearInterval(clock)
    }
  }, 300)
}


footer.init()
Fm.init()

