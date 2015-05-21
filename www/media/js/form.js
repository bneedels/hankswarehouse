	function ss_showError(element, show, msg){
		if(!msg){
			msg = "required field"
		}
		if(show){
			element.up().addClassName("ss_reqboxactive");
			if(!$("error_" + element.name)){
				var error = new Element("div", {"class": "ss_error", style: "display: none", id: "error_" + element.name}).update(msg)
				error.className = "ss_error";
				element.up().insertBefore(error, element.nextSibling)
				error.appear({duration: 0.5});
			}else{
				$("error_" + element.name).appear({duration: 0.5})
			}
		}else{
			if(element.up().hasClassName("ss_reqbox")){
				$(element.up()).removeClassName("ss_reqboxactive");
			}
		
			if($("error_" + element.name)){
				$("error_" + element.name).fade({duration: 0.5});
			}
		}
	}

	function ss_checkForm(form){
		var success = true;
		$(form).select("div.ss_reqbox input,div.ss_reqbox textarea,div.ss_reqbox select").each(
			function(element){
				if(element.hasClassName("emailaddress") || element.hasClassName("captcha") || element.hasClassName("password")){
					return;
				}
				
				if(element.readAttribute("type") == "radio"){
					//Process radio only one time for the first element
					if(element != form[element.name][0]){
						return;
					}
					var checked = false;
					for(var i = 0; i < form[element.name].length; i++){
						if(form[element.name][i].checked){
							checked = true;
							break;
						}
					}
					if(checked == false){
						ss_showError(element, true, "required field");
						success = false;
					}else{
						ss_showError(element, false)
					}
				}else if(element.nodeName=="SELECT"){
					if(element.value.length == 0 || element.value == -1){
						ss_showError(element, true, "required field");
						success = false;
					}else{
						ss_showError(element, false)
					}
				}else{
					if(element.value.length == 0){
						ss_showError(element, true, "required field");
						success = false;
					}else{
						ss_showError(element, false)
					}
				}
			}
		);
		$(form).select("div.ss_reqbox input.emailaddress").each(
			function(element){
				var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				
				if (!filter.test(element.value)){
					success = false;
					ss_showError(element, true, "invalid email address")
				}else{
					ss_showError(element, false)
				}
			}
		)
		var passwordElements = $(form).select("div.ss_reqbox input.password");
		if(passwordElements.length > 0){
			var equal = true;
			for(var i = 1; i < passwordElements.length; i++){
				if(passwordElements[i].value != passwordElements[0].value){
					equal = false;
					for(var j = 0; j < passwordElements.length; j++){
						ss_showError(passwordElements[j], true, "not equal passwords")
					}
					break;
				}
			}
			if(equal){
				var minLength = -1;
				if(form.passwordlength){
					minLength = form.passwordlength.value
					if(passwordElements[0].value.length < minLength){
						for(var j = 0; j < passwordElements.length; j++){
							ss_showError(passwordElements[j], true, "too short password")
						}
					}else{
						for(var j = 0; j < passwordElements.length; j++){
							ss_showError(passwordElements[j], false)
						}
					}
				}
			}
		}
		
		$(form).select("input.captcha").each(
			function (element){
				if(element.value.length == 0){
					success = false;
					ss_showError(element, true, "invalid value");
				}else{
					var formtype = "";
					if(form.formtype){
						formtype = "&formtype=" + form.formtype.value
					}
					new Ajax.Request(
						"securimage/checkcapture.php", {
							method: "get",
							parameters: "code=" + element.value + formtype,
							onSuccess: function (transport){
								var result = transport.responseXML.documentElement.childNodes.item(0).nodeValue
								if(result == "valid"){
									ss_showError(element, false)
									if(success){
										form.submit();
									}else{
									}
								}else{
									ss_showError(element, true, "invalid value")
								}
							}
						}
					)
				}
			}
		);
		
		if($(form).select("input.captcha").length == 0){
			return success;
		}
		return false;
	}
function hideContactUs(){
	$('contactus').fade({duration: 0.3});
}
function showContactUs(){
	showOverlay({onclose: hideContactUs});
	var offsets = document.viewport.getScrollOffsets();
	var top = 100 + offsets.top;
	$('contactus').setStyle({top: top + "px"})
	$('contactus').appear({duration: 0.3});
	return false;
}