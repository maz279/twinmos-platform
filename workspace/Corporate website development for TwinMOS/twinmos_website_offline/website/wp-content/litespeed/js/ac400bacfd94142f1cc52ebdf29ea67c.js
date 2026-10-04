(function(global,factory){typeof exports==='object'&&typeof module!=='undefined'?factory(exports):typeof define==='function'&&define.amd?define(['exports'],factory):(factory((global.SpriteSpin={})))}(this,(function(exports){'use strict';var Api=(function(){function Api(data){this.data=data}
return Api}());function extendApi(methods){var api=Api.prototype;for(var key in methods){if(methods.hasOwnProperty(key)){if(api[key]){throw new Error('API method is already defined: '+key)}else{api[key]=methods[key]}}}
return api}
var $$1=window.jQuery||window.$;function getCursorPosition(event){var touches=event.touches;var source=event;if(event.touches===undefined&&event.originalEvent!==undefined){touches=event.originalEvent.touches}
if(touches!==undefined&&touches.length>0){source=touches[0]}
return{x:source.clientX||0,y:source.clientY||0}}
var canvas;var context;function detectionContext(){if(context){return context}
if(!canvas){canvas=document.createElement('canvas')}
if(!canvas||!canvas.getContext){return null}
context=canvas.getContext('2d');return context}
function detectSubsampling(img,width,height){if(!detectionContext()){return!1}
if(width*height<=1024*1024){return!1}
canvas.width=canvas.height=1;context.fillStyle='#FF00FF';context.fillRect(0,0,1,1);context.drawImage(img,-width+1,0);try{var dat=context.getImageData(0,0,1,1).data;return(dat[0]===255)&&(dat[1]===0)&&(dat[2]===255)}catch(err){return!1}}
function getOuterSize(data){var width=Math.floor(data.width||data.frameWidth||data.target.innerWidth());var height=Math.floor(data.height||data.frameHeight||data.target.innerHeight());return{aspect:width/height,height:height,width:width}}
function getComputedSize(data){var size=getOuterSize(data);if(typeof window.getComputedStyle!=='function'){return size}
var style=window.getComputedStyle(data.target[0]);if(!style.width){return size}
size.width=Math.floor(Number(style.width.replace('px','')));size.height=Math.floor(size.width/size.aspect);return size}
function getInnerSize(data){var width=Math.floor(data.frameWidth||data.width||data.target.innerWidth());var height=Math.floor(data.frameHeight||data.height||data.target.innerHeight());return{aspect:width/height,height:height,width:width}}
function getInnerLayout(mode,inner,outer){var isFit=mode==='fit';var isFill=mode==='fill';var isMatch=mode==='stretch';var layout={width:'100%',height:'100%',top:0,left:0,bottom:0,right:0,position:'absolute',overflow:'hidden'};if(!mode||isMatch){return layout}
var aspectIsGreater=inner.aspect>=outer.aspect;var width=inner.width;var height=inner.height;if(isFit&&aspectIsGreater||isFill&&!aspectIsGreater){width=outer.width;height=outer.width/inner.aspect}
if(isFill&&aspectIsGreater||isFit&&!aspectIsGreater){height=outer.height;width=outer.height*inner.aspect}
width=Math.floor(width);height=Math.floor(height);layout.width=width;layout.height=height;layout.top=Math.floor((outer.height-height)/2);layout.left=Math.floor((outer.width-width)/2);layout.right=layout.left;layout.bottom=layout.top;return layout}
var img;function naturalSize(image){if(image.naturalWidth){return{height:image.naturalHeight,width:image.naturalWidth}}
img=img||new Image();img.src=image.src;return{height:img.height,width:img.width}}
function measure(images,options){if(images.length===1){return[measureSheet(images[0],options)]}else if(options.framesX&&options.framesY){return measureMutipleSheets(images,options)}else{return measureFrames(images,options)}}
function measureSheet(image,options){var result={id:0,sprites:[]};measureImage(image,options,result);var frames=options.frames;var framesX=Number(options.framesX)||frames;var framesY=Math.ceil(frames/framesX);var frameWidth=Math.floor(result.width/framesX);var frameHeight=Math.floor(result.height/framesY);var divisor=result.isSubsampled?2:1;for(var i=0;i<frames;i++){var x=(i%framesX)*frameWidth;var y=Math.floor(i/framesX)*frameHeight;result.sprites.push({id:i,x:x,y:y,width:frameWidth,height:frameHeight,sampledX:x/divisor,sampledY:y/divisor,sampledWidth:frameWidth/divisor,sampledHeight:frameHeight/divisor})}
return result}
function measureFrames(images,options){var result=[];for(var id=0;id<images.length;id++){var sheet=measureSheet(images[id],{frames:1,framesX:1,detectSubsampling:options.detectSubsampling});sheet.id=id;result.push(sheet)}
return result}
function measureMutipleSheets(images,options){var result=[];for(var id=0;id<images.length;id++){var sheet=measureSheet(images[id],{frames:undefined,framesX:options.framesX,framesY:options.framesY,detectSubsampling:options.detectSubsampling});sheet.id=id;result.push(sheet)}
return result}
function measureImage(image,options,result){var size=naturalSize(image);result.isSubsampled=options.detectSubsampling&&detectSubsampling(image,size.width,size.height);result.width=size.width;result.height=size.height;result.sampledWidth=size.width/(result.isSubsampled?2:1);result.sampledHeight=size.height/(result.isSubsampled?2:1);return result}
function findSpecs(metrics,frames,frame,lane){var spriteId=lane*frames+frame;var sheetId=0;var sprite=null;var sheet=null;while(!0){sheet=metrics[sheetId];if(!sheet){break}
if(spriteId>=sheet.sprites.length){spriteId-=sheet.sprites.length;sheetId++;continue}
sprite=sheet.sprites[spriteId];break}
return{sprite:sprite,sheet:sheet}}
function indexOf(element,arr){for(var i=0;i<arr.length;i++){if(arr[i]===element){return i}}}
function noop(){}
function preload(opts){var src;var input=opts.source;src=typeof input==='string'?[input]:input;var images=[];var targetCount=(opts.preloadCount||src.length);var onInitiated=opts.initiated||noop;var onProgress=opts.progress||noop;var onComplete=opts.complete||noop;var count=0;var completed=!1;var firstLoaded=!1;var tick=function(){count+=1;onProgress({index:indexOf(this,images),loaded:count,total:src.length,percent:Math.round((count/src.length)*100)});firstLoaded=firstLoaded||(this===images[0]);if(firstLoaded&&!completed&&(count>=targetCount)){completed=!0;onComplete(images)}};for(var _i=0,src_1=src;_i<src_1.length;_i++){var url=src_1[_i];var img=new Image();images.push(img);img.onload=img.onabort=img.onerror=tick;img.src=url}
onInitiated(images)}
function padNumber(num,length,pad){var result=String(num);while(result.length<length){result=String(pad)+result}
return result}
function sourceArray(template,opts){var digits=opts.digits||2;var lPlacer=opts.lanePlacer||'{lane}';var fPlacer=opts.framePlacer||'{frame}';var fStart=0;var fEnd=0;if(opts.frame){fStart=opts.frame[0];fEnd=opts.frame[1]}
var lStart=0;var lEnd=0;if(opts.lane){lStart=opts.lane[0];lEnd=opts.lane[1]}
var result=[];for(var lane=lStart;lane<=lEnd;lane+=1){for(var frame=fStart;frame<=fEnd;frame+=1){result.push(template.replace(lPlacer,padNumber(lane,digits,'0')).replace(fPlacer,padNumber(frame,digits,'0')))}}
return result}
var namespace='spritespin';var eventNames=['mousedown','mousemove','mouseup','mouseenter','mouseover','mouseleave','mousewheel','wheel','click','dblclick','touchstart','touchmove','touchend','touchcancel','selectstart','gesturestart','gesturechange','gestureend'];var callbackNames=['onInit','onProgress','onLoad','onFrameChanged','onFrame','onDraw','onComplete','onDestroy'];var eventsToPrevent=['dragstart'];var defaults={source:undefined,width:undefined,height:undefined,frames:undefined,framesX:undefined,lanes:1,sizeMode:undefined,renderer:'canvas',lane:0,frame:0,frameTime:40,animate:!0,retainAnimate:!1,reverse:!1,loop:!0,stopFrame:0,wrap:!0,wrapLane:!1,sense:1,senseLane:undefined,orientation:'horizontal',detectSubsampling:!0,preloadCount:undefined,responsive:undefined,plugins:['360','drag']};function noop$1(){}
function wrapConsole(type){return console&&console[type]?function(){var args=[];for(var _i=0;_i<arguments.length;_i++){args[_i]=arguments[_i]}
return console.log.apply(console,args)}:noop$1}
var log=wrapConsole('log');var warn=wrapConsole('warn');var error=wrapConsole('error');function toArray(value){return Array.isArray(value)?value:[value]}
function clamp(value,min,max){return(value>max?max:(value<min?min:value))}
function wrap(value,min,max,size){while(value>max){value-=size}
while(value<min){value+=size}
return value}
function prevent(e){e.preventDefault();return!1}
function bind(target,event,func){if(func){target.bind(event+'.'+namespace,function(e){func.apply(target,[e,target.spritespin('data')])})}}
function unbind(target){target.unbind('.'+namespace)}
function isFunction(fn){return typeof fn==='function'}
function pixelRatio(context){var devicePixelRatio=window.devicePixelRatio||1;var backingStoreRatio=context.webkitBackingStorePixelRatio||context.mozBackingStorePixelRatio||context.msBackingStorePixelRatio||context.oBackingStorePixelRatio||context.backingStorePixelRatio||1;return devicePixelRatio/backingStoreRatio}
var _Utils=Object.freeze({$:$$1,getCursorPosition:getCursorPosition,detectSubsampling:detectSubsampling,getOuterSize:getOuterSize,getComputedSize:getComputedSize,getInnerSize:getInnerSize,getInnerLayout:getInnerLayout,measure:measure,findSpecs:findSpecs,naturalSize:naturalSize,preload:preload,sourceArray:sourceArray,noop:noop$1,log:log,warn:warn,error:error,toArray:toArray,clamp:clamp,wrap:wrap,prevent:prevent,bind:bind,unbind:unbind,isFunction:isFunction,pixelRatio:pixelRatio});function applyLayout(data){data.target.attr('unselectable','on').css({width:'',height:'','-ms-user-select':'none','-moz-user-select':'none','-khtml-user-select':'none','-webkit-user-select':'none','user-select':'none'});var size=data.responsive?getComputedSize(data):getOuterSize(data);var layout=getInnerLayout(data.sizeMode,getInnerSize(data),size);data.target.css({width:size.width,height:size.height,position:'relative',overflow:'hidden'});data.stage.css(layout).hide();if(!data.canvas){return}
data.canvas.css(layout).hide();data.canvasRatio=data.canvasRatio||pixelRatio(data.context);if(typeof layout.width==='number'&&typeof layout.height==='number'){data.canvas[0].width=(layout.width*data.canvasRatio)||size.width;data.canvas[0].height=(layout.height*data.canvasRatio)||size.height}else{data.canvas[0].width=(size.width*data.canvasRatio);data.canvas[0].height=(size.height*data.canvasRatio)}
data.context.scale(data.canvasRatio,data.canvasRatio)}
function getState(data,name){data.state=data.state||{};data.state[name]=data.state[name]||{};return data.state[name]}
function getPluginState(data,name){var state=getState(data,'plugin');state[name]=state[name]||{};return state[name]}
function is(data,key){return!!getState(data,'flags')[key]}
function flag(data,key,value){getState(data,'flags')[key]=!!value}
function getPlaybackState(data){return getState(data,'playback')}
function updateLane(data,lane){data.lane=data.wrapLane?wrap(lane,0,data.lanes-1,data.lanes):clamp(lane,0,data.lanes-1)}
function updateAnimationFrame(data){data.frame+=(data.reverse?-1:1);data.frame=wrap(data.frame,0,data.frames-1,data.frames);if(!data.loop&&(data.frame===data.stopFrame)){stopAnimation(data)}}
function updateInputFrame(data,frame){data.frame=Number(frame);data.frame=data.wrap?wrap(data.frame,0,data.frames-1,data.frames):clamp(data.frame,0,data.frames-1)}
function updateAnimation(data){var state=getPlaybackState(data);if(state.handler){updateBefore(data);updateAnimationFrame(data);updateAfter(data)}}
function updateBefore(data){var state=getPlaybackState(data);state.lastFrame=data.frame;state.lastLane=data.lane}
function updateAfter(data){var state=getPlaybackState(data);if(state.lastFrame!==data.frame||state.lastLane!==data.lane){data.target.trigger('onFrameChanged.'+namespace,data)}
data.target.trigger('onFrame.'+namespace,data);data.target.trigger('onDraw.'+namespace,data)}
function updateFrame(data,frame,lane){updateBefore(data);if(frame!=null){updateInputFrame(data,frame)}
if(lane!=null){updateLane(data,lane)}
updateAfter(data)}
function stopAnimation(data){data.animate=!1;var state=getPlaybackState(data);if(state.handler!=null){window.clearInterval(state.handler);state.handler=null}}
function applyAnimation(data){var state=getPlaybackState(data);if(state.handler&&(!data.animate||state.frameTime!==data.frameTime)){stopAnimation(data)}
if(data.animate&&!state.handler){state.frameTime=data.frameTime;state.handler=window.setInterval(function(){return updateAnimation(data)},state.frameTime)}}
function startAnimation(data){data.animate=!0;applyAnimation(data)}
var plugins={};function registerPlugin(name,plugin){if(plugins[name]){error("Plugin name \""+name+"\" is already taken");return}
plugin=plugin||{};plugins[name]=plugin;return plugin}
function registerModule(name,plugin){warn('"registerModule" is deprecated, use "registerPlugin" instead');registerPlugin(name,plugin)}
function getPlugin(name){return plugins[name]}
function applyPlugins(data){fixPlugins(data);for(var i=0;i<data.plugins.length;i+=1){var name_1=data.plugins[i];if(typeof name_1!=='string'){continue}
var plugin=getPlugin(name_1);if(!plugin){error('No plugin found with name '+name_1);continue}
data.plugins[i]=plugin}}
function fixPlugins(data){if(data.mods){warn('"mods" option is deprecated, use "plugins" instead');data.plugins=data.mods;delete data.mods}
if(data.behavior){warn('"behavior" option is deprecated, use "plugins" instead');data.plugins.push(data.behavior);delete data.behavior}
if(data.module){warn('"module" option is deprecated, use "plugins" instead');data.plugins.push(data.module);delete data.module}}
var $$2=$$1;var counter=0;var instances={};function pushInstance(data){counter+=1;data.id=String(counter);instances[data.id]=data}
function popInstance(data){delete instances[data.id]}
function eachInstance(cb){for(var id in instances){if(instances.hasOwnProperty(id)){cb(instances[id])}}}
var lazyinit=function(){lazyinit=function(){};function onEvent(eventName,e){eachInstance(function(data){for(var _i=0,_a=data.plugins;_i<_a.length;_i++){var module_1=_a[_i];if(typeof module_1[eventName]==='function'){module_1[eventName].apply(data.target,[e,data])}}})}
function onResize(){eachInstance(function(data){if(data.responsive){boot(data)}})}
var _loop_1=function(eventName){$$2(window.document).bind(eventName+'.'+namespace,function(e){onEvent('document'+eventName,e)})};for(var _i=0,eventNames_1=eventNames;_i<eventNames_1.length;_i++){var eventName=eventNames_1[_i];_loop_1(eventName)}
var resizeTimeout=null;$$2(window).on('resize',function(){window.clearTimeout(resizeTimeout);resizeTimeout=window.setTimeout(onResize,100)})};function applyEvents(data){var target=data.target;unbind(target);for(var _i=0,eventsToPrevent_1=eventsToPrevent;_i<eventsToPrevent_1.length;_i++){var eName=eventsToPrevent_1[_i];bind(target,eName,prevent)}
for(var _a=0,_b=data.plugins;_a<_b.length;_a++){var plugin=_b[_a];for(var _c=0,eventNames_2=eventNames;_c<eventNames_2.length;_c++){var eName=eventNames_2[_c];bind(target,eName,plugin[eName])}
for(var _d=0,callbackNames_1=callbackNames;_d<callbackNames_1.length;_d++){var eName=callbackNames_1[_d];bind(target,eName,plugin[eName])}}
bind(target,'onLoad',function(e,d){applyAnimation(d)});for(var _e=0,callbackNames_2=callbackNames;_e<callbackNames_2.length;_e++){var eName=callbackNames_2[_e];bind(target,eName,data[eName])}}
function applyMetrics(data){if(!data.images){data.metrics=[]}
data.metrics=measure(data.images,data);var spec=findSpecs(data.metrics,data.frames,0,0);if(spec.sprite){data.frameWidth=spec.sprite.width;data.frameHeight=spec.sprite.height}}
function boot(data){applyPlugins(data);applyEvents(data);applyLayout(data);data.source=toArray(data.source);data.loading=!0;data.target.addClass('loading').trigger('onInit.'+namespace,data);preload({source:data.source,preloadCount:data.preloadCount,progress:function(progress){data.progress=progress;data.target.trigger('onProgress.'+namespace,data)},complete:function(images){data.images=images;data.loading=!1;data.frames=data.frames||images.length;applyMetrics(data);applyLayout(data);data.stage.show();data.target.removeClass('loading').trigger('onLoad.'+namespace,data).trigger('onFrame.'+namespace,data).trigger('onDraw.'+namespace,data).trigger('onComplete.'+namespace,data)}})}
function create(options){var _this=this;var target=options.target;var data=$$2.extend(!0,{},defaults,options);data.source=data.source||[];data.plugins=data.plugins||[];target.find('img').each(function(){if(!Array.isArray(data.source)){data.source=[]}
data.source.push($$2(_this).attr('src'))});target.empty().addClass('spritespin-instance').append("<div class='spritespin-stage'></div>");if(data.renderer==='canvas'){var canvas=document.createElement('canvas');if(!!(canvas.getContext&&canvas.getContext('2d'))){data.canvas=$$2(canvas).addClass('spritespin-canvas');data.context=canvas.getContext('2d');target.append(data.canvas);target.addClass('with-canvas')}else{data.renderer='image'}}
data.target=target;data.stage=target.find('.spritespin-stage');target.data(namespace,data);pushInstance(data);return data}
function createOrUpdate(options){lazyinit();var data=options.target.data(namespace);if(!data){data=create(options)}else{$$2.extend(data,options)}
boot(data);return data}
function destroy(data){popInstance(data);stopAnimation(data);data.target.trigger('onDestroy',data).html(null).attr('style',null).attr('unselectable',null).removeClass(['spritespin-instance','with-canvas']);unbind(data.target);data.target.removeData(namespace)}
function getInputState(data){return getState(data,'input')}
function updateInput(e,data){var cursor=getCursorPosition(e);var state=getInputState(data);state.oldX=state.currentX;state.oldY=state.currentY;state.currentX=cursor.x;state.currentY=cursor.y;if(state.oldX===undefined||state.oldY===undefined){state.oldX=state.currentX;state.oldY=state.currentY}
if(state.startX===undefined||state.startY===undefined){state.startX=state.currentX;state.startY=state.currentY;state.clickframe=data.frame;state.clicklane=data.lane}
state.dX=state.currentX-state.startX;state.dY=state.currentY-state.startY;state.ddX=state.currentX-state.oldX;state.ddY=state.currentY-state.oldY;state.ndX=state.dX/data.target.innerWidth();state.ndY=state.dY/data.target.innerHeight();state.nddX=state.ddX/data.target.innerWidth();state.nddY=state.ddY/data.target.innerHeight()}
function resetInput(data){var input=getInputState(data);input.startX=input.startY=undefined;input.currentX=input.currentY=undefined;input.oldX=input.oldY=undefined;input.dX=input.dY=0;input.ddX=input.ddY=0;input.ndX=input.ndY=0;input.nddX=input.nddY=0}
function extension(option,value){var $target=$$1(this);if(option==='data'){return $target.data(namespace)}
if(option==='api'){var data=$target.data(namespace);data.api=data.api||new Api(data);return data.api}
if(option==='destroy'){return $target.each(function(){var data=$target.data(namespace);if(data){destroy(data)}})}
if(arguments.length===2&&typeof option==='string'){option=(_a={},_a[option]=value,_a)}
if(typeof option==='object'){return createOrUpdate($$1.extend(!0,{target:$target},option)).target}
throw new Error('Invalid call to spritespin');var _a}
$$1.fn[namespace]=extension;extendApi({isPlaying:function(){return getPlaybackState(this.data).handler!=null},isLooping:function(){return this.data.loop},toggleAnimation:function(){if(this.isPlaying()){this.stopAnimation()}else{this.startAnimation()}},stopAnimation:function(){this.data.animate=!1;stopAnimation(this.data)},startAnimation:function(){this.data.animate=!0;applyAnimation(this.data)},loop:function(value){this.data.loop=value;applyAnimation(this.data);return this},currentFrame:function(){return this.data.frame},updateFrame:function(frame){updateFrame(this.data,frame);return this},skipFrames:function(step){var data=this.data;updateFrame(data,data.frame+(data.reverse?-step:+step));return this},nextFrame:function(){return this.skipFrames(1)},prevFrame:function(){return this.skipFrames(-1)},playTo:function(frame,options){var data=this.data;options=options||{};if(!options.force&&data.frame===frame){return}
if(options.nearest){var a=frame-data.frame;var b=frame>data.frame?a-data.frames:a+data.frames;var c=Math.abs(a)<Math.abs(b)?a:b;data.reverse=c<0}
data.animate=!0;data.loop=!1;data.stopFrame=frame;applyAnimation(data);return this}});function pick(target,names){for(var _i=0,names_1=names;_i<names_1.length;_i++){var name_1=names_1[_i];if(target[name_1]||name_1 in target){return name_1}}
return names[0]}
var browser={requestFullscreen:pick(document.documentElement,['requestFullscreen','webkitRequestFullScreen','mozRequestFullScreen','msRequestFullscreen']),exitFullscreen:pick(document,['exitFullscreen','webkitExitFullscreen','webkitCancelFullScreen','mozCancelFullScreen','msExitFullscreen']),fullscreenElement:pick(document,['fullscreenElement','webkitFullscreenElement','webkitCurrentFullScreenElement','mozFullScreenElement','msFullscreenElement']),fullscreenEnabled:pick(document,['fullscreenEnabled','webkitFullscreenEnabled','mozFullScreenEnabled','msFullscreenEnabled']),fullscreenchange:pick(document,['onfullscreenchange','onwebkitfullscreenchange','onmozfullscreenchange','onMSFullscreenChange']).replace(/^on/,''),fullscreenerror:pick(document,['onfullscreenerror','onwebkitfullscreenerror','onmozfullscreenerror','onMSFullscreenError']).replace(/^on/,'')};var changeEvent=browser.fullscreenchange+'.'+namespace+'-fullscreen';function unbindChangeEvent(){$$1(document).unbind(changeEvent)}
function bindChangeEvent(callback){unbindChangeEvent();$$1(document).bind(changeEvent,callback)}
var orientationEvent='orientationchange.'+namespace+'-fullscreen';function unbindOrientationEvent(){$$1(window).unbind(orientationEvent)}
function bindOrientationEvent(callback){unbindOrientationEvent();$$1(window).bind(orientationEvent,callback)}
function requestFullscreenNative(e){e=e||document.documentElement;e[browser.requestFullscreen]()}
function exitFullscreen(){return document[browser.exitFullscreen]()}
function fullscreenEnabled(){return document[browser.fullscreenEnabled]}
function fullscreenElement(){return document[browser.fullscreenElement]}
function isFullscreen(){return!!fullscreenElement()}
function toggleFullscreen(data,opts){if(isFullscreen()){this.apiRequestFullscreen(opts)}else{this.exitFullscreen()}}
function requestFullscreen(data,opts){opts=opts||{};var oWidth=data.width;var oHeight=data.height;var oSource=data.source;var oSize=data.sizeMode;var oResponsive=data.responsive;var enter=function(){data.width=window.screen.width;data.height=window.screen.height;data.source=(opts.source||oSource);data.sizeMode=opts.sizeMode||'fit';data.responsive=!1;boot(data)};var exit=function(){data.width=oWidth;data.height=oHeight;data.source=oSource;data.sizeMode=oSize;data.responsive=oResponsive;boot(data)};bindChangeEvent(function(){if(isFullscreen()){enter();bindOrientationEvent(enter)}else{unbindChangeEvent();unbindOrientationEvent();exit()}});requestFullscreenNative(data.target[0])}
extendApi({fullscreenEnabled:fullscreenEnabled,fullscreenElement:fullscreenElement,exitFullscreen:exitFullscreen,toggleFullscreen:function(opts){toggleFullscreen(this.data,opts)},requestFullscreen:function(opts){requestFullscreen(this.data,opts)}});(function(){var NAME='click';function click(e,data){if(data.loading||!data.stage.is(':visible')){return}
updateInput(e,data);var input=getInputState(data);var half,pos;var target=data.target,offset=target.offset();if(data.orientation==='horizontal'){half=target.innerWidth()/2;pos=input.currentX-offset.left}else{half=target.innerHeight()/2;pos=input.currentY-offset.top}
updateFrame(data,data.frame+(pos>half?1:-1))}
registerPlugin(NAME,{name:NAME,mouseup:click,touchend:click})})();(function(){var NAME='drag';function getState$$1(data){return getPluginState(data,NAME)}
function getAxis(data){if(typeof data.orientation==='number'){return data.orientation*Math.PI/180}
if(data.orientation==='horizontal'){return 0}
return Math.PI/2}
function dragStart(e,data){var state=getState$$1(data);if(data.loading||is(data,'dragging')||!data.stage.is(':visible')){return}
var now=new Date().getTime();if(state.startAt&&(now-state.startAt>200)){e.preventDefault()}
state.startAt=now;state.wasPlaying=!!getPlaybackState(data).handler;state.frame=data.frame||0;state.lane=data.lane||0;flag(data,'dragging',!0);updateInput(e,data)}
function dragEnd(e,data){if(is(data,'dragging')){flag(data,'dragging',!1);resetInput(data);if(data.retainAnimate&&getState$$1(data).wasPlaying){startAnimation(data)}}}
function drag(e,data){var state=getState$$1(data);var input=getInputState(data);if(!is(data,'dragging')){return}
updateInput(e,data);var rad=getAxis(data);var sn=Math.sin(rad);var cs=Math.cos(rad);var x=((input.nddX*cs-input.nddY*sn)*data.sense)||0;var y=((input.nddX*sn+input.nddY*cs)*(data.senseLane||data.sense))||0;state.frame+=data.frames*x;state.lane+=data.lanes*y;var oldFrame=data.frame;var oldLane=data.lane;updateFrame(data,Math.floor(state.frame),Math.floor(state.lane));stopAnimation(data)}
function mousemove(e,data){dragStart(e,data);drag(e,data)}
registerPlugin('drag',{name:'drag',mousedown:dragStart,mousemove:drag,mouseup:dragEnd,documentmousemove:drag,documentmouseup:dragEnd,touchstart:dragStart,touchmove:drag,touchend:dragEnd,touchcancel:dragEnd});registerPlugin('move',{name:'move',mousemove:mousemove,mouseleave:dragEnd,touchstart:dragStart,touchmove:drag,touchend:dragEnd,touchcancel:dragEnd})})();(function(){var NAME='hold';function getState$$1(data){return getPluginState(data,NAME)}
function rememberOptions(data){var state=getState$$1(data);state.frameTime=data.frameTime;state.animate=data.animate;state.reverse=data.reverse}
function restoreOptions(data){var state=getState$$1(data);data.frameTime=state.frameTime;data.animate=state.animate;data.reverse=state.reverse}
function start(e,data){if(is(data,'loading')||is(data,'dragging')||!data.stage.is(':visible')){return}
rememberOptions(data);updateInput(e,data);flag(data,'dragging',!0);data.animate=!0;applyAnimation(data)}
function stop(e,data){flag(data,'dragging',!1);resetInput(data);stopAnimation(data);restoreOptions(data);applyAnimation(data)}
function update(e,data){if(!is(data,'dragging')){return}
updateInput(e,data);var input=getInputState(data);var half,delta;var target=data.target,offset=target.offset();if(data.orientation==='horizontal'){half=target.innerWidth()/2;delta=(input.currentX-offset.left-half)/half}else{half=(data.height/2);delta=(input.currentY-offset.top-half)/half}
data.reverse=delta<0;delta=delta<0?-delta:delta;data.frameTime=80*(1-delta)+20;if(((data.orientation==='horizontal')&&(input.dX<input.dY))||((data.orientation==='vertical')&&(input.dX<input.dY))){e.preventDefault()}}
function onFrame(e,data){data.animate=!0;applyAnimation(data)}
registerPlugin(NAME,{name:NAME,mousedown:start,mousemove:update,mouseup:stop,mouseleave:stop,touchstart:start,touchmove:update,touchend:stop,touchcancel:stop,onFrame:onFrame})})();(function(){var NAME='swipe';function getState$$1(data){return getPluginState(data,NAME)}
function getOption(data,name,fallback){return data[name]||fallback}
function init(e,data){var state=getState$$1(data);state.fling=getOption(data,'swipeFling',10);state.snap=getOption(data,'swipeSnap',0.50)}
function start(e,data){if(!data.loading&&!is(data,'dragging')){updateInput(e,data);flag(data,'dragging',!0)}}
function update(e,data){if(!is(data,'dragging')){return}
updateInput(e,data);var frame=data.frame;var lane=data.lane;updateFrame(data,frame,lane)}
function end(e,data){if(!is(data,'dragging')){return}
flag(data,'dragging',!1);var state=getState$$1(data);var input=getInputState(data);var frame=data.frame;var lane=data.lane;var snap=state.snap;var fling=state.fling;var dS,dF;if(data.orientation==='horizontal'){dS=input.ndX;dF=input.ddX}else{dS=input.ndY;dF=input.ddY}
if(dS>=snap||dF>=fling){frame=data.frame-1}else if(dS<=-snap||dF<=-fling){frame=data.frame+1}
resetInput(data);updateFrame(data,frame,lane);stopAnimation(data)}
registerPlugin(NAME,{name:NAME,onLoad:init,mousedown:start,mousemove:update,mouseup:end,mouseleave:end,touchstart:start,touchmove:update,touchend:end,touchcancel:end})})();(function(){var NAME='wheel';function wheel(e,data){if(!data.loading&&data.stage.is(':visible')){e.preventDefault();var we=e.originalEvent;var signX=we.deltaX===0?0:we.deltaX>0?1:-1;var signY=we.deltaY===0?0:we.deltaY>0?1:-1;updateFrame(data,data.frame+signY,data.lane+signX)}}
registerPlugin(NAME,{name:NAME,wheel:wheel})})();(function(){var template="\n<div class='spritespin-progress'>\n  <div class='spritespin-progress-label'></div>\n  <div class='spritespin-progress-bar'></div>\n</div>\n";function getState$$1(data){return getPluginState(data,NAME)}
var NAME='progress';function onInit(e,data){var state=getState$$1(data);if(!state.stage){state.stage=$$1(template);state.stage.appendTo(data.target)}
state.stage.find('.spritespin-progress-label').text("0%").css({'text-align':'center'});state.stage.find('.spritespin-progress-bar').css({width:"0%"});state.stage.hide().fadeIn()}
function onProgress(e,data){var state=getState$$1(data);state.stage.find('.spritespin-progress-label').text(data.progress.percent+"%").css({'text-align':'center'});state.stage.find('.spritespin-progress-bar').css({width:data.progress.percent+"%"})}
function onLoad(e,data){$$1(getState$$1(data).stage).fadeOut()}
function onDestroy(e,data){$$1(getState$$1(data).stage).remove()}
registerPlugin(NAME,{name:NAME,onInit:onInit,onProgress:onProgress,onLoad:onLoad,onDestroy:onDestroy})})();(function(){var NAME='360';function onLoad(e,data){data.stage.find('.spritespin-frames').detach();if(data.renderer==='image'){$(data.images).addClass('spritespin-frames').appendTo(data.stage)}}
function onDraw(e,data){var specs=findSpecs(data.metrics,data.frames,data.frame,data.lane);var sheet=specs.sheet;var sprite=specs.sprite;if(!sheet||!sprite){return}
var src=data.source[sheet.id];var image=data.images[sheet.id];if(data.renderer==='canvas'){data.canvas.show();var w=data.canvas[0].width/data.canvasRatio;var h=data.canvas[0].height/data.canvasRatio;data.context.clearRect(0,0,w,h);data.context.drawImage(image,sprite.sampledX,sprite.sampledY,sprite.sampledWidth,sprite.sampledHeight,0,0,w,h);return}
var scaleX=data.stage.innerWidth()/sprite.sampledWidth;var scaleY=data.stage.innerHeight()/sprite.sampledHeight;var top=Math.floor(-sprite.sampledY*scaleY);var left=Math.floor(-sprite.sampledX*scaleX);var width=Math.floor(sheet.sampledWidth*scaleX);var height=Math.floor(sheet.sampledHeight*scaleY);if(data.renderer==='background'){data.stage.css({'background-image':"url('"+src+"')",'background-position':left+"px "+top+"px",'background-repeat':'no-repeat','-webkit-background-size':width+"px "+height+"px",'-moz-background-size':width+"px "+height+"px",'-o-background-size':width+"px "+height+"px",'background-size':width+"px "+height+"px"});return}
$(data.images).hide();$(image).show().css({position:'absolute',top:top,left:left,'max-width':'initial',width:width,height:height})}
registerPlugin(NAME,{name:NAME,onLoad:onLoad,onDraw:onDraw})})();(function(){var NAME='blur';function getState$$1(data){return getPluginState(data,NAME)}
function getOption(data,name,fallback){return data[name]||fallback}
function init(e,data){var state=getState$$1(data);state.canvas=state.canvas||$$1("<canvas class='blur-layer'></canvas>");state.context=state.context||state.canvas[0].getContext('2d');state.steps=state.steps||[];state.fadeTime=Math.max(getOption(data,'blurFadeTime',200),1);state.frameTime=Math.max(getOption(data,'blurFrameTime',data.frameTime),16);state.trackTime=null;state.cssBlur=!!getOption(data,'blurCss',!1);var inner=getInnerSize(data);var outer=data.responsive?getComputedSize(data):getOuterSize(data);var css=getInnerLayout(data.sizeMode,inner,outer);state.canvas[0].width=data.width*data.canvasRatio;state.canvas[0].height=data.height*data.canvasRatio;state.canvas.css(css).show();state.context.scale(data.canvasRatio,data.canvasRatio);data.target.append(state.canvas)}
function onFrame(e,data){var state=getState$$1(data);trackFrame(data);if(state.timeout==null){loop(data)}}
function trackFrame(data){var state=getState$$1(data);var ani=getPlaybackState(data);var d=Math.abs(data.frame-ani.lastFrame);d=d>=data.frames/2?data.frames-d:d;state.steps.unshift({frame:data.frame,lane:data.lane,live:1,step:state.frameTime/state.fadeTime,d:d,alpha:0})}
var toRemove=[];function removeOldFrames(frames){toRemove.length=0;for(var i=0;i<frames.length;i+=1){if(frames[i].alpha<=0){toRemove.push(i)}}
for(var _i=0,toRemove_1=toRemove;_i<toRemove_1.length;_i++){var item=toRemove_1[_i];frames.splice(item,1)}}
function loop(data){var state=getState$$1(data);state.timeout=window.setTimeout(function(){tick(data)},state.frameTime)}
function killLoop(data){var state=getState$$1(data);window.clearTimeout(state.timeout);state.timeout=null}
function applyCssBlur(canvas,d){var amount=Math.min(Math.max((d/2)-4,0),2.5);var blur="blur("+amount+"px)";canvas.css({'-webkit-filter':blur,filter:blur})}
function clearFrame(data,state){state.canvas.show();var w=state.canvas[0].width/data.canvasRatio;var h=state.canvas[0].height/data.canvasRatio}
function drawFrame(data,state,step){if(step.alpha<=0){return}
var specs=findSpecs(data.metrics,data.frames,step.frame,step.lane);var sheet=specs.sheet;var sprite=specs.sprite;if(!sheet||!sprite){return}
var src=data.source[sheet.id];var image=data.images[sheet.id];if(image.complete===!1){return}
state.canvas.show();var w=state.canvas[0].width/data.canvasRatio;var h=state.canvas[0].height/data.canvasRatio;state.context.globalAlpha=step.alpha;state.context.drawImage(image,sprite.sampledX,sprite.sampledY,sprite.sampledWidth,sprite.sampledHeight,0,0,w,h)}
function tick(data){var state=getState$$1(data);killLoop(data);if(!state.context){return}
var d=0;clearFrame(data,state);state.context.clearRect(0,0,data.width,data.height);for(var _i=0,_a=state.steps;_i<_a.length;_i++){var step=_a[_i];step.live=Math.max(step.live-step.step,0);step.alpha=Math.max(step.live-0.25,0);drawFrame(data,state,step);d+=step.alpha+step.d}
if(state.cssBlur){applyCssBlur(state.canvas,d)}
removeOldFrames(state.steps);if(state.steps.length){loop(data)}}
registerPlugin(NAME,{name:NAME,onLoad:init,onFrameChanged:onFrame})})();(function(){var max=Math.max;var min=Math.min;var NAME='ease';function getState$$1(data){return getPluginState(data,NAME)}
function getOption(data,name,fallback){return data[name]||fallback}
function init(e,data){var state=getState$$1(data);state.maxSamples=max(getOption(data,'easeMaxSamples',5),0);state.damping=max(min(getOption(data,'easeDamping',0.9),0.999),0);state.abortTime=max(getOption(data,'easeAbortTime',250),16);state.updateTime=max(getOption(data,'easeUpdateTime',data.frameTime),16);state.samples=[];state.steps=[]}
function update(e,data){if(is(data,'dragging')){killLoop(data);sampleInput(data)}}
function end(e,data){var state=getState$$1(data);var samples=state.samples;var last;var lanes=0;var frames=0;var time=0;for(var _i=0,samples_1=samples;_i<samples_1.length;_i++){var sample=samples_1[_i];if(!last){last=sample;continue}
var dt=sample.time-last.time;if(dt>state.abortTime){lanes=frames=time=0;return killLoop(data)}
frames+=sample.frame-last.frame;lanes+=sample.lane-last.lane;time+=dt;last=sample}
samples.length=0;if(!time){return}
state.lane=data.lane;state.lanes=0;state.laneStep=lanes/time*state.updateTime;state.frame=data.frame;state.frames=0;state.frameStep=frames/time*state.updateTime;loop(data)}
function sampleInput(data){var state=getState$$1(data);state.samples.push({time:new Date().getTime(),frame:data.frame,lane:data.lane});while(state.samples.length>state.maxSamples){state.samples.shift()}}
function killLoop(data){var state=getState$$1(data);if(state.handler!=null){window.clearTimeout(state.handler);state.handler=null}}
function loop(data){var state=getState$$1(data);state.handler=window.setTimeout(function(){tick(data)},state.updateTime)}
function tick(data){var state=getState$$1(data);state.lanes+=state.laneStep;state.frames+=state.frameStep;state.laneStep*=state.damping;state.frameStep*=state.damping;var frame=Math.floor(state.frame+state.frames);var lane=Math.floor(state.lane+state.lanes);updateFrame(data,frame,lane);if(is(data,'dragging')){killLoop(data)}else if(Math.abs(state.frameStep)>0.005||Math.abs(state.laneStep)>0.005){loop(data)}else{killLoop(data)}}
registerPlugin(NAME,{name:NAME,onLoad:init,mousemove:update,mouseup:end,mouseleave:end,touchmove:update,touchend:end,touchcancel:end})})();(function(){var NAME='gallery';function getState$$1(data){return getPluginState(data,NAME)}
function getOption(data,name,fallback){return data[name]||fallback}
function load(e,data){var state=getState$$1(data);state.images=[];state.offsets=[];state.frame=data.frame;state.speed=getOption(data,'gallerySpeed',500);state.opacity=getOption(data,'galleryOpacity',0.25);state.stage=getOption(data,'galleryStage',$$1('<div></div>'));state.stage.empty().addClass('gallery-stage').prependTo(data.stage);var size=0;for(var _i=0,_a=data.images;_i<_a.length;_i++){var image=_a[_i];var naturalSize$$1=naturalSize(image);var scale=data.height/naturalSize$$1.height;var img=$$1(image);state.stage.append(img);state.images.push(img);state.offsets.push(-size+(data.width-image.width*scale)/2);size+=data.width;img.css({'max-width':'initial',opacity:state.opacity,width:data.width,height:data.height})}
var innerSize=getInnerSize(data);var outerSize=data.responsive?getComputedSize(data):getOuterSize(data);var layout=getInnerLayout(data.sizeMode,innerSize,outerSize);state.stage.css(layout).css({width:size,left:state.offsets[state.frame]});state.images[state.frame].animate({opacity:1},{duration:state.speed})}
function draw(e,data){var state=getState$$1(data);var input=getInputState(data);var isDragging=is(data,'dragging');if(state.frame!==data.frame&&!isDragging){state.stage.stop(!0,!1).animate({left:state.offsets[data.frame]},{duration:state.speed});state.images[state.frame].animate({opacity:state.opacity},{duration:state.speed});state.frame=data.frame;state.images[state.frame].animate({opacity:1},{duration:state.speed});state.stage.animate({left:state.offsets[state.frame]})}else if(isDragging||state.dX!==input.dX){state.dX=input.dX;state.ddX=input.ddX;state.stage.stop(!0,!0).css({left:state.offsets[state.frame]+state.dX})}}
registerPlugin(NAME,{name:NAME,onLoad:load,onDraw:draw})})();(function(){var NAME='panorama';function getState$$1(data){return getPluginState(data,NAME)}
function onLoad(e,data){var state=getState$$1(data);var sprite=data.metrics[0];if(!sprite){return}
if(data.orientation==='horizontal'){state.scale=data.target.innerHeight()/sprite.sampledHeight;data.frames=sprite.sampledWidth}else{state.scale=data.target.innerWidth()/sprite.sampledWidth;data.frames=sprite.sampledHeight}
var width=Math.floor(sprite.sampledWidth*state.scale);var height=Math.floor(sprite.sampledHeight*state.scale);data.stage.css({'background-image':"url("+data.source[sprite.id]+")",'background-repeat':'repeat-both','-webkit-background-size':width+"px "+height+"px",'-moz-background-size':width+"px "+height+"px",'-o-background-size':width+"px "+height+"px",'background-size':width+"px "+height+"px"})}
function onDraw(e,data){var state=getState$$1(data);var px=data.orientation==='horizontal'?1:0;var py=px?0:1;var offset=data.frame%data.frames;var left=Math.round(px*offset*state.scale);var top=Math.round(py*offset*state.scale);data.stage.css({'background-position':left+"px "+top+"px"})}
registerPlugin(NAME,{name:NAME,onLoad:onLoad,onDraw:onDraw})})();(function(){var NAME='zoom';function getState$$1(data){return getPluginState(data,NAME)}
function getOption(data,name,fallback){return data[name]||fallback}
function onInit(e,data){var state=getState$$1(data);state.source=getOption(data,'zoomSource',data.source);state.doubleClickTime=getOption(data,'zoomDoubleClickTime',500);state.stage=state.stage||$$1("<div class='zoom-stage'></div>");state.stage.css({width:'100%',height:'100%',top:0,left:0,bottom:0,right:0,position:'absolute'}).appendTo(data.target).hide()}
function onDestroy(e,data){var state=getState$$1(data);if(state.stage){state.stage.remove();delete state.stage}}
function updateInput$$1(e,data){var state=getState$$1(data);if(!state.stage.is(':visible')){return}
e.preventDefault();flag(data,'dragging',!1);var cursor=getCursorPosition(e);var x=cursor.x/data.width;var y=cursor.y/data.height;if(state.oldX==null){state.oldX=x;state.oldY=y}
if(state.currentX==null){state.currentX=x;state.currentY=y}
var dx=x-state.oldX;var dy=y-state.oldY;state.oldX=x;state.oldY=y;if(e.type.match(/touch/)){dx=-dx;dy=-dy}
state.currentX=clamp(state.currentX+dx,0,1);state.currentY=clamp(state.currentY+dy,0,1);updateFrame(data,data.frame,data.lane)}
function onClick(e,data){e.preventDefault();var state=getState$$1(data);var clickTime=new Date().getTime();if(!state.clickTime){state.clickTime=clickTime;return}
var timeDelta=clickTime-state.clickTime;if(timeDelta>state.doubleClickTime){state.clickTime=clickTime;return}
state.clickTime=undefined;if(toggleZoom(data)){updateInput$$1(e,data)}}
function onMove(e,data){var state=getState$$1(data);if(state.stage.is(':visible')){updateInput$$1(e,data)}}
function onDraw(e,data){var state=getState$$1(data);var index=data.lane*data.frames+data.frame;var source=state.source[index];var spec=findSpecs(data.metrics,data.frames,data.frame,data.lane);var x=state.currentX;var y=state.currentY;if(x==null){x=state.currentX=0.5;y=state.currentY=0.5}
if(source){x=Math.floor(x*100);y=Math.floor(y*100);state.stage.css({'background-repeat':'no-repeat','background-image':"url('"+source+"')",'background-position':x+"% "+y+"%"})}else if(spec.sheet&&spec.sprite){var sprite=spec.sprite;var sheet=spec.sheet;var src=data.source[sheet.id];var left=-Math.floor(sprite.sampledX+x*(sprite.sampledWidth-data.width));var top_1=-Math.floor(sprite.sampledY+y*(sprite.sampledHeight-data.height));var width=sheet.sampledWidth;var height=sheet.sampledHeight;state.stage.css({'background-image':"url('"+src+"')",'background-position':left+"px "+top_1+"px",'background-repeat':'no-repeat','-webkit-background-size':width+"px "+height+"px",'-moz-background-size':width+"px "+height+"px",'-o-background-size':width+"px "+height+"px",'background-size':width+"px "+height+"px"})}}
function toggleZoom(data){var state=getState$$1(data);if(!state.stage){throw new Error('zoom module is not initialized or is not available.')}
if(state.stage.is(':visible')){state.stage.fadeOut();data.stage.fadeIn()}else{state.stage.fadeIn();data.stage.fadeOut();return!0}
return!1}
registerPlugin(NAME,{name:NAME,mousedown:onClick,touchstart:onClick,mousemove:onMove,touchmove:onMove,onInit:onInit,onDestroy:onDestroy,onDraw:onDraw});extendApi({toggleZoom:function(){toggleZoom(this.data)}})})();var Utils=_Utils;exports.Utils=Utils;exports.sourceArray=sourceArray;exports.Api=Api;exports.extendApi=extendApi;exports.instances=instances;exports.applyEvents=applyEvents;exports.boot=boot;exports.create=create;exports.createOrUpdate=createOrUpdate;exports.destroy=destroy;exports.namespace=namespace;exports.eventNames=eventNames;exports.callbackNames=callbackNames;exports.eventsToPrevent=eventsToPrevent;exports.defaults=defaults;exports.getInputState=getInputState;exports.updateInput=updateInput;exports.resetInput=resetInput;exports.applyLayout=applyLayout;exports.getPlaybackState=getPlaybackState;exports.updateFrame=updateFrame;exports.stopAnimation=stopAnimation;exports.applyAnimation=applyAnimation;exports.startAnimation=startAnimation;exports.registerPlugin=registerPlugin;exports.registerModule=registerModule;exports.getPlugin=getPlugin;exports.applyPlugins=applyPlugins;exports.getState=getState;exports.getPluginState=getPluginState;exports.is=is;exports.flag=flag;Object.defineProperty(exports,'__esModule',{value:!0})})))
;