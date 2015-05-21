// If you would like to use a custom loading image or close button reference them in the next two lines.
var loadingImage = 'media/images/loading.gif';
var closeButton = 'media/images/close.gif';		
var overlayImg = 'media/images/overlay.png'
var ie6 = navigator.userAgent.indexOf("MSIE 6")>0 ? true : false;
var safari = navigator.userAgent.indexOf("Safari")>0 ? true : false;

//
// getPageSize()
// Returns array with page width, height and window width, height
// Core code from - quirksmode.org
// Edit for Firefox by pHaez
//
function getPageSize(){
	
	
	var xScroll, yScroll;
	
	if (window.innerHeight && window.scrollMaxY) {	
		xScroll = document.body.scrollWidth;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}
	
	var windowWidth, windowHeight;
	if (self.innerHeight) {	// all except Explorer
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) { // other Explorers
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}	
	
	// for small pages with total height less then height of the viewport
	if(yScroll < windowHeight){
		pageHeight = windowHeight;
	} else { 
		pageHeight = yScroll;
	}

	// for small pages with total width less then width of the viewport
	if(xScroll < windowWidth){	
		pageWidth = windowWidth;
	} else {
		pageWidth = xScroll;
	}

	arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight)
	return arrayPageSize;
}

function overlayKeyProcess(event){
	var data = $A(arguments);
	
	if(event.keyCode == Event.KEY_ESC){
		hideOverlay();
		if(data[1]){
			data[1]()
		}
	}
	var c = event.charCode ? event.charCode : event.keyCode
	
	if(String.fromCharCode(c).toLowerCase() == "x"){
		hideOverlay();
		if(data[1]){
			data[1]()
		}
	}
}

function showOverlay(param){
	var overlay = $("overlay");
	var loadingImg = $("overlayloadingImage")
	if(!overlay){
		// <div id="overlay">
		//		<img id="loadingImage" src="loading" />
		//	</div>
		$(document.body).insert(
			((new Element("div", {id: "overlay"})).setStyle({display: "none", position: "absolute", top: 0, left: 0, zIndex: 90, width: "100%"})).
			insert( (new Element("img", {src: loadingImage, id: "overlayloadingImage"})).setStyle({position: "absolute", zIndex: 91, left: "50%", top: "250px", display: "none", marginLeft: "-63px"}))
		)
		overlay = $("overlay");
		loadingImg = $("overlayloadingImage");
		overlay.observe("click", hideOverlay)
		overlay.observe("click", param.onclose)
		overlayKeyProcess.fix = overlayKeyProcess.bindAsEventListener(overlay, param.onclose);
	}
	Event.observe(document, "keypress", overlayKeyProcess.fix)
	var pageSize = getPageSize();
	var pageScroll = document.viewport.getScrollOffsets();

	// center loadingImage if it exists
	loadingImg.setStyle({
		top: pageScroll[1] + ((pageSize[3] - 35 - loadingImg.getHeight())) / 2,
		left: ((pageSize[0] - 20 - loadingImg.getWidth()) / 2),
		display: "block"
	})
	
	if(param.showLoading == false){
		loadingImg.setStyle({display: "none"});
	}
	
	// set height of Overlay to take up whole page and show
	overlay.setStyle({height: pageSize[1] + "px"});
	if(safari){
		$$("object").each(function(s){s.setAttribute("savedVisibilityStyle", s.getStyle("visibility"));s.setStyle({visibility: "hidden"})})
	}else{
		$$("embed").each(function(s){
			if(s.getAttribute("wmode") != "transparent"){
				s.up().setAttribute("savedVisibilityStyle", s.up().getStyle("visibility"))
				s.up().setStyle({visibility: "hidden"})
			}
		})
		$$("object").each(function(s){
			var wmode = false;
			s.childElements().each(function(ss){
				if(ss.getAttribute("name") == "wmode" && ss.getAttribute("value") == "transparent"){
					wmode = true;
				}
			})
			if(wmode == false){
				if(s.getStyle("visibility") != "hidden"){
					s.setAttribute("savedVisibilityStyle", s.getStyle("visibility"));
					s.setStyle({visibility: "hidden"})
				}
			}
		})
	}
	if(ie6){
		overlay.setStyle({display: "block"});
		$$("select").each(function(s){s.setAttribute("savedVisibilityStyle", s.getStyle("visibility")); s.setStyle({visibility: "hidden"})})
	}else{
		overlay.appear({duration: 0.3});
	}
	Event.observe(window, "resize", adjustOverlay)
}
function adjustOverlay(){
	var pageSize = getPageSize();
	$("overlay").setStyle({height: pageSize[1] + "px"});
}
function hideOverlay(){
	Event.stopObserving(document, "keypress", overlayKeyProcess.fix)
	Event.stopObserving(document, "resize", adjustOverlay)
	$("overlayloadingImage").setStyle({display: "none"})
	if(ie6){
    	window.setTimeout('$$("select").each(function(s){ s.setStyle({visibility: s.getAttribute("savedVisibilityStyle")})})', 200);
    }
	if(safari){
		window.setTimeout('$$("object").each(function(s){ s.setStyle({visibility: s.getAttribute("savedVisibilityStyle")})})', 300);
	}else{
		window.setTimeout('$$("object").each(function(s){ if(s.getAttribute("savedVisibilityStyle")) s.setStyle({visibility: s.getAttribute("savedVisibilityStyle")})})', 300);
	}
    
	$("overlay").fade({duration: 0.3});	
}
function stopOverlayLoading(){
	//update height
	updateOverlayHeight()
	
	$("overlayloadingImage").setStyle({display: "none"})
}
function updateOverlayHeight(){
	var pageSize = getPageSize();
	$("overlay").setStyle({height: pageSize[1]})	
}

function showWindow(param){
	var width = "600px"
	var height = "400px"
	var pageSizes = getPageSize();
	//alert(pageSizes)
	var top = "150px";
	var left = (pageSizes[2] - parseInt(width))/2 + "px";
	showOverlay({onclose: hideWindow})
	var popupWindow = $("popupWindow")
	if(!popupWindow){
		$(document.body).insert(
			((new Element("div", {id: "popupWindow"})).setStyle({position: "absolute", zIndex: 91, display: "none", backgroundColor: "#ffffff", width: width, /*height: height, */top: top, left: left}))
			.insert(
				(new Element("img", {src: closeButton, id: "popupWindowClose"})).setStyle({position: "absolute", top: 0, right: 0, cursor: "pointer"})
			).insert(
				(new Element("div", {id: "popupWindowInnner"})).setStyle({padding: "12px"})
			)
		)		
		popupWindow = $("popupWindow")
	}
	$("popupWindowClose").observe("click", hideWindow)
	if(param.id){
		stopOverlayLoading();
		$("popupWindowInnner").update($(param.id).innerHTML);
		popupWindow.slideDown({duration: 0.2});
	}else if(param.url){
		new Ajax.Request(param.url, {method: "get", 
			onSuccess: function (transport){
				var text = transport.responseText;
				
				if(text.indexOf("<body")>0){
					text = text.substring(text.indexOf("<body"))
					text = text.substring(text.indexOf(">")+1)
				}				
				if(text.indexOf("</body>")>0){
					text = text.substring(0, text.indexOf("</body>"))
				}
				$("popupWindowInnner").update(text);
				stopOverlayLoading();				
				popupWindow.slideDown({duration: 0.2})
			}
		})
	}
	return false;
}
function hideWindow(){
	$("popupWindowClose").stopObserving("click", hideWindow)
	hideOverlay();
	if($("popupWindow").getStyle("display") == "block"){
		$("popupWindow").slideUp({duration: 0.2});
	}
}
