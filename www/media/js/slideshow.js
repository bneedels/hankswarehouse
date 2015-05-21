Element.prototype.triggerEvent = function(eventName, params){
	
    if (document.createEvent){
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, true);

        return this.dispatchEvent(evt);
    }

    if (this.fireEvent){
        return this.fireEvent('on' + eventName);
    }
		
}


document.observe("dom:loaded", function() {
	/* This code is executed after the DOM has been completely loaded */
	
	var totWidth = 0;
	var totCount = $$('#slides .slide').length;	
	var positions = new Array();
	if(totCount == 0){
		return;
	}
	
	$('slides').innerHTML += $('slides').innerHTML;
	
	$$('#slides .slide').each(function(slide, i){
		
		/* Traverse through all the slides and store their accumulative widths in totWidth */
		
		positions[i]= totWidth;
		totWidth += slide.getWidth();
		
		/* The positions array contains each slide's commulutative offset from the left part of the container */
		
		if(!slide.getWidth()){
			alert("Please, fill in width & height for all your images!");
			return false;
		}
	});
	
	$('slides').setStyle({width: totWidth + "px"});

	/* Change the cotnainer div's width to the exact width of all the slides combined */
	
	var menuHTML = "<ul>";
	for(var i = 0; i < totCount; i++){
		menuHTML += '<li><a href="" onclick="return false;">' + (i + 1) + '</a></li>'
	}
	menuHTML += "</ul>";
	
	if(totCount == 1){
		$("menu").hide();
		if($$("#map iframe").length > 0){
			$$("#map iframe")[0].writeAttribute("height", "287")
		}
	}else{
		$("menu").show();
		if($$("#map iframe").length > 0){
			$$("#map iframe")[0].writeAttribute("height", "314")
		}
		var newLeft = 230 - 15*totCount;
		$("menu").update(menuHTML)
		if($$('#menu ul').length > 0){
			$$('#menu ul')[0].setStyle({paddingLeft: newLeft + "px"});
		}
	}
	
	$$('#menu ul li a').invoke('observe', 'click', processClick);
	
	function processClick(e){
		/* On a thumbnail click */
		
		var element = e.element();

		$$('#menu ul li').invoke("removeClassName", 'act').invoke("addClassName", "inact");

		element.up().addClassName('act');

		var newCurrent = element.up().previousSiblings('li').length + 1;
		
		if(newCurrent < current){
			newCurrent += totCount
		}
		
		current = newCurrent;
		
		if( (current - 2) == totCount){
			new Effect.Move($('slides'), {x: - positions[0], mode: 'absolute', duration: 0});
			current -= totCount;
		}
		
		//console.log(current)

		new Effect.Move($('slides'), {x: - positions[current - 1], mode: 'absolute', duration: 0.45});
			
		/* Start the sliding animation */
			
		e.stop();
		/* Prevent the default action of the link */
	}
	
	
		
	$$('#menu ul li')[0].addClassName('act').siblings().each(function(el){el.addClassName('inact')})
	
	/* On page load, mark the first thumbnail as active */
	
	/*****
	 *
	 *	Enabling auto-advance.
	 *
	 ****/
	 
	var current = 1;
	function autoAdvance(){		
		$$('#menu ul li a')[current++ % $$('#menu ul li a').length].triggerEvent('click');
	}

	// The number of seconds that the slider will auto-advance in:
	
	var changeEvery = 5;

	var itvl = setInterval(function(){autoAdvance()}, changeEvery * 1000);

	/* End of customizations */
});