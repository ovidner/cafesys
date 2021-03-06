/*************************************************
**  jQuery Masonry version 1.2.0
**  copyright David DeSandro, licensed GPL & MIT
**  http://desandro.com/resources/jquery-masonry
**************************************************/
;(function($){var n=$.event,resizeTimeout;n.special["smartresize"]={setup:function(){$(this).bind("resize",n.special.smartresize.handler)},teardown:function(){$(this).unbind("resize",n.special.smartresize.handler)},handler:function(a,b){var c=this,args=arguments;a.type="smartresize";if(resizeTimeout)clearTimeout(resizeTimeout);resizeTimeout=setTimeout(function(){jQuery.event.handle.apply(c,args)},b==="execAsap"?0:100)}};$.fn.smartresize=function(a){return a?this.bind("smartresize",a):this.trigger("smartresize",["execAsap"])};$.fn.masonry=function(l,m){function getBricks(a,b){a.$bricks=b.itemSelector==undefined?b.$brickParent.children():b.$brickParent.find(b.itemSelector)}function placeBrick(a,b,c,d,e,f){var g=0;for(i=0;i<b;i++){if(c[i]<c[g])g=i}var h={left:e.colW*g+e.posLeft,top:c[g]};if(e.masoned&&f.animate){a.animate(h,{duration:f.animationOptions.duration,easing:f.animationOptions.easing,complete:f.animationOptions.complete,step:f.animationOptions.step,queue:f.animationOptions.queue,specialEasing:f.animationOptions.specialEasing})}else{a.css(h)}for(i=0;i<d;i++){e.colY[g+i]=c[g]+a.outerHeight(true)}};function masonrySetup(a,b,c){getBricks(c,b);if(b.columnWidth==undefined){c.colW=c.masoned?a.data('masonry').colW:c.$bricks.outerWidth(true)}else{c.colW=b.columnWidth}c.colCount=Math.floor(a.width()/c.colW);c.colCount=Math.max(c.colCount,1)};function masonryArrange(e,f,g){if(!g.masoned)e.css('position','relative');if(!g.masoned||f.appendedContent!=undefined){g.$bricks.css('position','absolute')}var h=$('<div />');e.prepend(h);g.posTop=Math.round(h.position().top);g.posLeft=Math.round(h.position().left);h.remove();if(g.masoned&&f.appendedContent!=undefined){g.colY=e.data('masonry').colY;for(i=e.data('masonry').colCount;i<g.colCount;i++){g.colY[i]=g.posTop}}else{g.colY=[];for(i=0;i<g.colCount;i++){g.colY[i]=g.posTop}}if(f.singleMode){g.$bricks.each(function(){var a=$(this);placeBrick(a,g.colCount,g.colY,1,g,f)})}else{g.$bricks.each(function(){var a=$(this);var b=Math.ceil(a.outerWidth(true)/g.colW);b=Math.min(b,g.colCount);if(b==1){placeBrick(a,g.colCount,g.colY,1,g,f)}else{var c=g.colCount+1-b;var d=[0];for(i=0;i<c;i++){d[i]=0;for(j=0;j<b;j++){d[i]=Math.max(d[i],g.colY[i+j])}}placeBrick(a,c,d,b,g,f)}})}g.wallH=0;for(i=0;i<g.colCount;i++){g.wallH=Math.max(g.wallH,g.colY[i])}var k={height:g.wallH-g.posTop};if(g.masoned&&f.animate){e.animate(k,{duration:f.animationOptions.duration,easing:f.animationOptions.easing,complete:f.animationOptions.complete,step:f.animationOptions.step,queue:f.animationOptions.queue,specialEasing:f.animationOptions.specialEasing})}else{e.css(k)}if(!g.masoned)e.addClass('masoned');m.call(g.$bricks);e.data('masonry',g)};function masonryResize(a,b,c){c.masoned=a.data('masonry')!=undefined;var d=a.data('masonry').colCount;masonrySetup(a,b,c);if(c.colCount!=d)masonryArrange(a,b,c)};return this.each(function(){var a=$(this);var b=$.extend({},$.masonry);b.masoned=a.data('masonry')!=undefined;var c=b.masoned?a.data('masonry').options:{};var d=$.extend({},b.defaults,c,l);b.options=d.saveOptions?d:c;m=m||function(){};if(b.masoned&&d.appendedContent!=undefined){d.$brickParent=d.appendedContent}else{d.$brickParent=a}getBricks(b,d);if(b.$bricks.length){masonrySetup(a,d,b);masonryArrange(a,d,b);var e=c.resizeable;if(!e&&d.resizeable){$(window).bind('smartresize.masonry',function(){masonryResize(a,d,b)})}if(e&&!d.resizeable)$(window).unbind('smartresize.masonry')}else{return this}})};$.masonry={defaults:{singleMode:false,columnWidth:undefined,itemSelector:undefined,appendedContent:undefined,saveOptions:true,resizeable:true,animate:false,animationOptions:{}},colW:undefined,colCount:undefined,colY:undefined,wallH:undefined,masoned:undefined,posTop:0,posLeft:0,options:undefined,$bricks:undefined,$brickParent:undefined}})(jQuery);

/**
 * @author Samele Artuso <samuele.a@gmail.com>
 */
(function($) {
	$.fn.unselectable = function() {
		return this.each(function() {
			
			$(this)
				.css('-moz-user-select', 'none')		// FF
				.css('-khtml-user-select', 'none')		// Safari, Google Chrome
				.css('user-select', 'none');			// CSS 3
			
			if ($.browser.msie) {						// IE
				$(this).each(function() {
					this.ondrag = function() {
						return false;
					};
				});
				$(this).each(function() {
					this.onselectstart = function() {
						return (false);
					};
				});
			} else if($.browser.opera) {
				$(this).attr('unselectable', 'on');
			}
		});
	};
})(jQuery);

/**
 * jQuery.timers - Timer abstractions for jQuery
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2009/10/16
 *
 * @author Blair Mitchelmore
 * @version 1.2
 *
 **/

jQuery.fn.extend({
	everyTime: function(interval, label, fn, times) {
		return this.each(function() {
			jQuery.timer.add(this, interval, label, fn, times);
		});
	},
	oneTime: function(interval, label, fn) {
		return this.each(function() {
			jQuery.timer.add(this, interval, label, fn, 1);
		});
	},
	stopTime: function(label, fn) {
		return this.each(function() {
			jQuery.timer.remove(this, label, fn);
		});
	}
});

jQuery.extend({
	timer: {
		global: [],
		guid: 1,
		dataKey: "jQuery.timer",
		regex: /^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,
		powers: {
			// Yeah this is major overkill...
			'ms': 1,
			'cs': 10,
			'ds': 100,
			's': 1000,
			'das': 10000,
			'hs': 100000,
			'ks': 1000000
		},
		timeParse: function(value) {
			if (value == undefined || value == null)
				return null;
			var result = this.regex.exec(jQuery.trim(value.toString()));
			if (result[2]) {
				var num = parseFloat(result[1]);
				var mult = this.powers[result[2]] || 1;
				return num * mult;
			} else {
				return value;
			}
		},
		add: function(element, interval, label, fn, times) {
			var counter = 0;
			
			if (jQuery.isFunction(label)) {
				if (!times) 
					times = fn;
				fn = label;
				label = interval;
			}
			
			interval = jQuery.timer.timeParse(interval);

			if (typeof interval != 'number' || isNaN(interval) || interval < 0)
				return;

			if (typeof times != 'number' || isNaN(times) || times < 0) 
				times = 0;
			
			times = times || 0;
			
			var timers = jQuery.data(element, this.dataKey) || jQuery.data(element, this.dataKey, {});
			
			if (!timers[label])
				timers[label] = {};
			
			fn.timerID = fn.timerID || this.guid++;
			
			var handler = function() {
				if ((++counter > times && times !== 0) || fn.call(element, counter) === false)
					jQuery.timer.remove(element, label, fn);
			};
			
			handler.timerID = fn.timerID;
			
			if (!timers[label][fn.timerID])
				timers[label][fn.timerID] = window.setInterval(handler,interval);
			
			this.global.push( element );
			
		},
		remove: function(element, label, fn) {
			var timers = jQuery.data(element, this.dataKey), ret;
			
			if ( timers ) {
				
				if (!label) {
					for ( label in timers )
						this.remove(element, label, fn);
				} else if ( timers[label] ) {
					if ( fn ) {
						if ( fn.timerID ) {
							window.clearInterval(timers[label][fn.timerID]);
							delete timers[label][fn.timerID];
						}
					} else {
						for ( var fn in timers[label] ) {
							window.clearInterval(timers[label][fn]);
							delete timers[label][fn];
						}
					}
					
					for ( ret in timers[label] ) break;
					if ( !ret ) {
						ret = null;
						delete timers[label];
					}
				}
				
				for ( ret in timers ) break;
				if ( !ret ) 
					jQuery.removeData(element, this.dataKey);
			}
		}
	}
});

jQuery(window).bind("unload", function() {
	jQuery.each(jQuery.timer.global, function(index, item) {
		jQuery.timer.remove(item);
	});
});

/*
 * jQuery Asynchronous Plugin 1.0 RC1
 *
 * Copyright (c) 2008 Vincent Robert (genezys.net)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 */
(function($){

// opts.delay : (default 10) delay between async call in ms
// opts.bulk : (default 500) delay during which the loop can continue synchronously without yielding the CPU
// opts.test : (default true) function to test in the while test part
// opts.loop : (default empty) function to call in the while loop part
// opts.end : (default empty) function to call at the end of the while loop
$.whileAsync = function(opts)
{
    var delay = Math.abs(opts.delay) || 10,
        bulk = isNaN(opts.bulk) ? 500 : Math.abs(opts.bulk),
        test = opts.test || function(){ return true; },
        loop = opts.loop || function(){},
        end  = opts.end  || function(){};
    
    (function(){

        var t = false, 
            begin = new Date();
            
        while( t = test() )
        {
            loop();
            if( bulk === 0 || (new Date() - begin) > bulk )
            {
                break;
            }
        }
        if( t ) 
        {
            setTimeout(arguments.callee, delay);
        }
        else
        {
            end();
        }
        
    })();
}

// opts.delay : (default 10) delay between async call in ms
// opts.bulk : (default 500) delay during which the loop can continue synchronously without yielding the CPU
// opts.loop : (default empty) function to call in the each loop part, signature: function(index, value) this = value
// opts.end : (default empty) function to call at the end of the each loop
$.eachAsync = function(array, opts)
{
    var i = 0, 
        l = array.length, 
        loop = opts.loop || function(){};
    
    $.whileAsync(
        $.extend(opts, {
            test: function(){ return i < l; },
            loop: function()
            { 
                var val = array[i];
                return loop.call(val, i++, val);
            }
        })
    );
}

$.fn.eachAsync = function(opts)
{
    $.eachAsync(this, opts);
    return this;
}

})(jQuery);

(function(h){var f={pint:/[\d]/,"int":/[\d\-]/,pnum:/[\d\.]/,money:/[\d\.\s,]/,num:/[\d\-\.]/,hex:/[0-9a-f]/i,email:/[a-z0-9_\.\-@]/i,alpha:/[a-z_]/i,alphanum:/[a-z0-9_]/i};var c={TAB:9,RETURN:13,ESC:27,BACKSPACE:8,DELETE:46};var a={63234:37,63235:39,63232:38,63233:40,63276:33,63277:34,63272:46,63273:36,63275:35};var e=function(j){var i=j.keyCode;i=h.browser.safari?(a[i]||i):i;return(i>=33&&i<=40)||i==c.RETURN||i==c.TAB||i==c.ESC};var d=function(j){var i=j.keyCode;var l=j.charCode;return i==9||i==13||(i==40&&(!h.browser.opera||!j.shiftKey))||i==27||i==16||i==17||(i>=18&&i<=20)||(h.browser.opera&&!j.shiftKey&&(i==8||(i>=33&&i<=35)||(i>=36&&i<=39)||(i>=44&&i<=45)))};var b=function(j){var i=j.keyCode||j.charCode;return h.browser.safari?(a[i]||i):i};var g=function(i){return i.charCode||i.keyCode||i.which};h.fn.keyfilter=function(i){return this.keypress(function(m){if(m.ctrlKey||m.altKey){return}var j=b(m);if(h.browser.mozilla&&(e(m)||j==c.BACKSPACE||(j==c.DELETE&&m.charCode==0))){return}var o=g(m),n=String.fromCharCode(o),l=true;if(!h.browser.mozilla&&(d(m)||!n)){return}if(h.isFunction(i)){l=i.call(this,n)}else{l=i.test(n)}if(!l){m.preventDefault()}})};h.extend(h.fn.keyfilter,{defaults:{masks:f},version:1.7});h(document).ready(function(){var i=h("input[class*=mask],textarea[class*=mask]");for(var j in h.fn.keyfilter.defaults.masks){i.filter(".mask-"+j).keyfilter(h.fn.keyfilter.defaults.masks[j])}})})(jQuery);
