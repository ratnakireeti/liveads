/**
 * This file define a few classes to assist Embedded Window on iFrame.
 * Please dont change these unless you absolutely know what you are doing.
 **/
 
window.lpCWTag = window.lpCWTag || {};
window.lpCWTagConst = window.lpCWTagConst || {};


/**
 * Logger - to provide printing statement and JSON object to browser console.
 * Usage:
 * 		logger = new lpCWTagUI.LPChatWidgetLogger();
 * 		logger.isSessionStorageSupported()
 * Output:
 *		boolean - true | false
 * @version: 0.9
 */
lpCWTag.LPChatWidgetLogger = lpCWTag.LPChatWidgetLogger || function LPChatWidgetLogger() {
	var cwLogger = this;
	
	/**
	 * adding leading zeros
	 * @param num - actual number
	 * @param size - length of actual number needs for leading zeros
	 */
	function padZeros(num, size) {
	    var temp = "000" + num;
	    return temp.substr(temp.length-size);
	}

	/**
	 * printing to browser console if supported
	 * @param pLogName - logger name
	 * @param pData - a simple string or complex JSOn data type
	 * @param pData2 - a simple string or complex JSOn data type
	 * @param pDebugOn - output to console only if true
	 */
	function print_to_log(pLogName, pData, pData2, pDebugOn) {
		if (pDebugOn) {
			var date = new Date();
			try {
				pData = typeof pData === 'string' ? pData : JSON.stringify(pData);
				pData2 = typeof pData2 === 'string' ? pData2 : JSON.stringify(pData2);
			} catch (exc) {
				pData = exc;
				pData2 = "...";
			}
			date = "" + padZeros(date.getHours(), 2) + ":" + padZeros(date.getMinutes(), 2) 
						+ ":" + padZeros(date.getSeconds(), 2) + ":" + padZeros(date.getMilliseconds(), 3);
			if(!(window.console && console.log)) {
			  console = {
			    log: function(){},
			    debug: function(){},
			    info: function(){},
			    warn: function(){},
			    error: function(){}
			  };
			}
			console.log(date + " " + new Date().getTime() + " " + pLogName + " : " + pData + (pData2 == "" ? "" : (" : " + pData2)));
		}
	}
	
	/**
	 * print debug statement to console only if DEBUG_ENABLE is true
	 * @param dataOrMessage - string or JSON
	 * @param dataOrMessage2 - string or JSON
	 */
	cwLogger.debug = function(dataOrMessage, dataOrMessage2){
		print_to_log(lpCWTagConst.LOGGER_NAME_IFRAME, dataOrMessage || "", dataOrMessage2 || "", lpCWTagConst.DEBUG_ENABLE);
	}	
	
	/**
	 * print info statement to console
	 * @param dataOrMessage - string or JSON
	 * @param dataOrMessage2 - string or JSON
	 */
	cwLogger.info = function(dataOrMessage, dataOrMessage2){
		print_to_log(lpCWTagConst.LOGGER_NAME_IFRAME, dataOrMessage || "", dataOrMessage2 || "", lpCWTagConst.INFO_ENABLE);
	}	
}

/**
 * LPChatWidgetAssist is providing the basic/common functionalities for the Embedded Window including creating the dynamic screen, detecting 
 * browser user agent, encode html content, etc.
 * Usage:
 * 		cwa = new lpCWTag.LPChatWidgetAssist();
 * 		cwa.debug("string or json object", "string or json object")
 * Output:
 *		time_stamp : LOGGER NAME : string or json object : string or json object
 * @version: 0.9
 */
lpCWTag.LPChatWidgetAssist = lpCWTag.LPChatWidgetAssist || function LPChatWidgetAssist(window) {
	var cwAssist = this;
	var logger = new lpCWTag.LPChatWidgetLogger();
			
	function htmlEncode(text){
		return $('<div/>').text(text).html();
	}
	
	function htmlDecode(text){
		return $('<div/>').html(text).text();
	}
	
	/**
	 * retrieves values from session storage
	 * @param pKey - key
	 */
	cwAssist.getValueFromSessionStorage = function(pKey){
		var val = "";
		if(typeof sessionStorage != "undefined"){
			var value = sessionStorage.getItem(pKey);
			val = typeof value != "undefined"? value: "";
		}
		return val;
	}

	/**
	 * update values to session storage
	 * @param pKey - key
	 * @param pVal - value
	 */
	cwAssist.setValueToSessionStorage = function(pKey, pVal){
		if(typeof sessionStorage != "undefined"){
			sessionStorage.setItem(pKey, pVal);
		}
	}
	
	/**
	 * deletes key from session storage
	 * @param pKey - key
	 */
	cwAssist.deleteValueToSessionStorage = function(pKey){
		if(typeof sessionStorage != "undefined"){
			sessionStorage.removeItem(pKey);
		}
	}

	/**
	 * return true if user agent is IE 10 or IE 11 and false otherwise
	 */
	cwAssist.isIE10n11 = function(){
		var browserAgent = cwAssist.detectUserAgent();
		var browserType = browserAgent.browser;
		var browserVersion = browserAgent.version;
		
		logger.debug("isIE10n11", browserAgent);
		
		if(browserType.toUpperCase() == "MSIE" || browserType.toUpperCase() == "IE"){
			var browserVersion = parseInt(browserVersion);
			if(browserVersion == 10 || browserVersion == 11){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * detect user browser agent 
	 */
	cwAssist.detectUserAgent = function(){
		var userAgent = navigator.userAgent, temp, matchPattern;
    var matchBrowser = {};
    
    matchPattern= userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(matchPattern[1])){
        temp=  /\brv[ :]+(\d+)/g.exec(userAgent) || [];
        matchBrowser.browser = "IE";
				matchBrowser.version = temp[1] || '';
				if(!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)){
					matchBrowser.browser = "IE";
					matchBrowser.version = "11";
					return matchBrowser;
	    	}
    }
    
    if(matchPattern[1]=== 'Chrome'){
        var temp= userAgent.match(/\bOPR\/(\d+)/)
        if(temp!= null) {
        	matchBrowser.browser = "Opera";
					matchBrowser.version = temp[1] || '';
        }
    }
    
    matchPattern= matchPattern[2]? [matchPattern[1], matchPattern[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((temp= userAgent.match(/version\/(\d+)/i))!= null) {
    	matchPattern.splice(1, 1, temp[1]);
    }

    matchBrowser.browser = matchPattern[ 0 ] || "";
		matchBrowser.version = matchPattern[ 1 ] || "0";
		return matchBrowser;
	};	 
	
	/**
	 * return true if browser is supported sessionStorage 
	 */
	cwAssist.isSessionStorageSupported = function(){
		var sessionStorageFound = false;
		try{
			if(typeof sessionStorage != "undefined" && sessionStorage != null){
				sessionStorageFound = true;
			}
		} catch(excpt){}
			
		logger.debug("sessionStorage " + (sessionStorageFound?"is": "is NOT"), "available");
		return sessionStorageFound;
	}
	
	/**
	 * return true if browser is supported JSON
	 */
	cwAssist.isJSONSupported = function(){
		var jsonFound = false;
		try{
			if (JSON && typeof JSON.parse === 'function') {
				jsonFound = true;
			}else if (typeof JSON === 'object' && typeof JSON.parse === 'function') {
				jsonFound = true;
			}
		} catch(excpt){}
			
		logger.debug("JSON " + (jsonFound?"is": "is NOT"), "available");
		return jsonFound;
	}
	
	/**
	 * return true if browser is supported postMessage
	 */
	cwAssist.isPostMessageSupported = function(){
		var postMsgFound = false;
		try{
			if (typeof window.postMessage === 'function') {
				postMsgFound = true;
			}else if (typeof window.postMessage != 'undefined') {
				postMsgFound = true;
			}
		} catch(excpt){}
			
		logger.debug("PostMessage " + (postMsgFound?"is": "is NOT"), "available");
		return postMsgFound;
	}
	
	/**
	 * return true if browser is supported for technologies embedded window required
	 */
	cwAssist.isBrowserCompatible = function(){
		return cwAssist.isJSONSupported() && cwAssist.isPostMessageSupported() && cwAssist.isSessionStorageSupported() ? true: false;
	}
	
	/**
	 * check if browser is supported 
	 */
	cwAssist.isBrowserSupported = function(){
		var browser = cwAssist.detectUserAgent();
		if(browser.browser.toUpperCase() == "CHROME" && browser.version >= 31)
			return true;
		else if((browser.browser.toUpperCase() == "IE" || browser.browser.toUpperCase() == "MSIE")  && browser.version >= 8)
			return true;
		else if(browser.browser.toUpperCase() == "FIREFOX" && browser.version >= 31)
			return true;
		else if(browser.browser.toUpperCase() == "SAFARI" && browser.version >= 5)
			return true;
		else
			return false;
	}
	
	/**
	 * make html for a question based on type
	 * @param dataTypes - data type structure
	 * @param question - question structure in JSON format
	 * @param i - index
	 *
	 * @return HTML content 
	 */
	cwAssist.makeInputSection = function(dataTypes, question, i){
		//var surveyContainer = cwAssist.makeHiddenInput("lpSurveyQuestionID"+ i, question.id);
		var surveyContainer = "";
		if (question.type == dataTypes.TEXT) {
			surveyContainer += cwAssist.makeTextBoxHtml(question, i);
		} else if (question.type == dataTypes.CHECKBOX) {
			surveyContainer += cwAssist.makeCheckbox(question, i)
		} else if (question.type == dataTypes.RADIO) {
			surveyContainer += cwAssist.makeRadioButton(question, i)
		} else if (question.type == dataTypes.RADIO_SIDE) {
			surveyContainer += cwAssist.makeRadioButtonSideBySide(question, i);
		} else if (question.type == dataTypes.NUMERIC) {
			surveyContainer += cwAssist.makeNumericTextBoxHtml(question, i);
		} else if (question.type == dataTypes.TEXT_AREA) {
			surveyContainer += cwAssist.makeTextAreaHtml(question, i);
		} else if (question.type == dataTypes.DROPDOWN) {
			surveyContainer += cwAssist.makeSelectBoxHtml(question, i);
		}
		return surveyContainer;
	}

	/* make html string for hidden input tag */
	cwAssist.makeHiddenInput = function(name, value){
		return "<input type='hidden' id='" + name + "' name ='" + name + "' value = '" + value + "' />";
	}

	/* make html for simple input text box */
	cwAssist.makeTextBoxHtml = function(question, i){
		return '<div class="lpAnswerOptions"><input type="text" id="lpSurveyQuestionAns'+ i +'" value=""></div>';
	}

	/* make html for text area */
	cwAssist.makeTextAreaHtml = function(question, i){
		return '<div class="lpAnswerOptions">'
				+ '<textarea type="text" id="lpSurveyQuestionAns'+ i + '" cols="40"></textarea>' + '</div>';
	}

	/* make html for HTML 5 number input box */
	cwAssist.makeNumericTextBoxHtml = function(question, i){
		return '<div class="lpAnswerOptions"><input type="number" id="lpSurveyQuestionAns'+ i + '" value=""></div>';
	}

	/* make html for select box */
	cwAssist.makeSelectBoxHtml = function(question, i){
      var surveyContainer = '<div class="lpAnswerOptions">' + '<select class="lpAnswerOptionSelect" id="lpSurveyQuestionAns' + i + '">';
      surveyContainer += '<option value="">' + lpCWTagConst.lpTxt_SelectOne + '</option>';
      for ( var i=0; i<question.entry.length; i++ ) {
          var option = question.entry[i];
          surveyContainer += '<option value = "' + option.value
                  + '" ';
          if (option.checked) {
              surveyContainer += 'selected ';
          }
          surveyContainer += '>' + option.displayValue + '</option>'
      }
      surveyContainer += '</select>' + '</div>';
      return surveyContainer;
  }
        
	/* make html for checkbox. Use <label> to handle label click */
	cwAssist.makeCheckbox = function(question, i){
      var id = "lpSurveyQuestionAns" + i;
      
      var surveyContainer = '<div class="lpAnswerOptions" id="' + id + '" >';
      for ( var i=0; i<question.entry.length; i++ ) {
          var option = question.entry[i];
          surveyContainer += '<label>';
          surveyContainer += '<input type="checkbox" class="lpAnserOptionsRadio" name="' + id + '" ' + 'value="' + option.value + '" ';
          if (option.checked) {
              surveyContainer += 'checked="true" ';
          }
					surveyContainer += '/><div class="lpAnserOptionsDesc">' + option.displayValue +'</div>';
					surveyContainer += '<div style="clear:both;"/>';
					surveyContainer += '</label>';
      }
      surveyContainer += '</div>';
      return surveyContainer;   
  }

	/* make html for radio buttons one below the other. Use <label> to handle label click */
	cwAssist.makeRadioButton = function(question, i){
      var id = "lpSurveyQuestionAns" + i;
      
      var surveyContainer = '<div class="lpAnswerOptions" id="' + id + '" >';
      for ( var i=0; i<question.entry.length; i++ ) {
          var option = question.entry[i];
          surveyContainer += '<label>';
          surveyContainer += '<input type="radio" class="lpAnserOptionsRadio" name="' + id + '" ' + 'value="' + option.value + '" ';
          if (option.checked) {
              surveyContainer += 'checked="true" ';
          }
					surveyContainer += '/><div class="lpAnserOptionsDesc">' + option.displayValue +'</div>';
					surveyContainer += '<div style="clearclear:both;"/>';
					surveyContainer += '</label>';
      }
      surveyContainer += '</div>';
      return surveyContainer;   
  }

	/* make html for radio buttons side by side */
	cwAssist.makeRadioButtonSideBySide = function(question, i){
      return cwAssist.makeRadioButton(question, i);
  }

	/* change focus to the right field */
	cwAssist.focusOnElement = function(question ){
		var  questionContainerDiv = '#lpChatSurveySectionQ' + question.order ;
		if($(questionContainerDiv).find("textarea").length){
			$(questionContainerDiv).find("textarea").focus();
		}else if($(questionContainerDiv).find("select").length){
			$(questionContainerDiv).find("select").focus();
		}else{
			$(questionContainerDiv).find("input:visible:first").focus();
		}
	}
	
	/* insert Required Error Message in window */
	cwAssist.insertRequiredErrorMessage = function(question, focusElement){
		var surveyContainerQErrorDiv = '#lpChatSurveySectionQError' + question.order;
		$(surveyContainerQErrorDiv).html('<div class="lpErrorExclamation"><span>!</span></div><div class="lpErrorTxtMsg">' + lpCWTagConst.lpMsg_CompTheRequiredField + '</div>');
		$(surveyContainerQErrorDiv).show();
		
		if(focusElement){
			cwAssist.focusOnElement(question)
		}
	}
	
	/**
	 * show survey css to indicate the question is required
	 */
	cwAssist.surveyQuestionShowRequired = function(dataTypes, question){
		if(question && question.mandatory){
			var elemErrorId = "#lpChatSurveySectionQError"+question.order;
			if (question.type == dataTypes.TEXT || question.type == dataTypes.NUMERIC || question.type == dataTypes.TEXT_AREA){
				var elemId = "#lpSurveyQuestionAns"+question.order;
				$(elemId).removeClass().addClass("lpQuestionErrorBorder");
			}else{
				var elemId = "#lpChatSurveySectionQ"+question.order;
				$(elemId).addClass("lpQuestionErrorBorder");
			}
			
			cwAssist.insertRequiredErrorMessage(question, false);
		}
	}
	
	/**
	 * hide survey css to indicate the question is not required
	 */
	cwAssist.surveyQuestionHideRequired = function(dataTypes, question, bClearValue){
		if(question && question.mandatory){
			var elemErrorId = "#lpChatSurveySectionQError"+question.order;
		
			if (question.type == dataTypes.TEXT || question.type == dataTypes.NUMERIC || question.type == dataTypes.TEXT_AREA){
				var elemId = "#lpSurveyQuestionAns"+question.order;
				if(bClearValue)
					$(elemId).val("");
				$(elemId).removeClass();
			}else{
				var elemId = "#lpChatSurveySectionQ"+question.order;
				$(elemId).removeClass().addClass("lpChatSurveySectionQ");
			}
			
			$(elemErrorId).empty();
			$(elemErrorId).hide();
		}
	}
	
	/**
	 * hide survey border red of the question
	 */
	cwAssist.surveyQuestionHideReqRedBorder = function(dataTypes, question, bClearValue){
		$("#lpChatSurveySectionQ"+question.order).hide();
		
		if (question.type == dataTypes.CHECKBOX) {
			if(bClearValue){
				$("#lpSurveyQuestionAns"+ question.order).removeAttr('checked');
			}
		} else if (question.type == dataTypes.RADIO || question.type == dataTypes.RADIO_SIDE) {
			if(bClearValue){
				$('input[name="lpSurveyQuestionAns'+question.order+'"]').prop('checked', false);
			}
		} else if (question.type == dataTypes.DROPDOWN) {
			if(bClearValue){
				$("#lpSurveyQuestionAns"+ question.order).prop('selectedIndex',0);
			}
		}
		
	}
	
	/* insert invalid Error Message in  window */
	cwAssist.insertInvalidErrorMessage = function(question  , focusElement){
		
		var surveyContainerQErrorDiv = '#lpChatSurveySectionQError' + question.order;
		$(surveyContainerQErrorDiv).html('<div class="lpErrorExclamation"><span>!</span></div><div class="lpErrorTxtMsg">' + lpCWTagConst.lpMsg_NotHaveValidVal + '</div>');
		$(surveyContainerQErrorDiv).show();
		
		if(focusElement){
			cwAssist.focusOnElement(question)
		}
	}
	
	/* html for visitor's message */
	cwAssist.lpChatMakeInfoNotificationMessage = function(title, msg, lpChatFontSize){
		return '<div class="lpChatInfoTextLine"><div class="lpChatMsg" style="font-size:' + lpChatFontSize
					+ 'px"><span class="lpChatInfoTextLabel">Info:</span> ' + htmlEncode(msg) + '</div></div>';
  }
  
	/* html for visitor's message */
	cwAssist.lpChatMakeRightSideMessage = function(title, msg, lpChatFontSize){
  	return '<div class="lpMessage lpTextRight">'
              + '<div class="messageSender">' + title
              + '</div><div class="lpGreenBg lpPosRel lpBubble lpRightBubble">'
              + '<div class="lpChatMsg" style="font-size:' + lpChatFontSize
              + 'px">' + htmlEncode(msg) + '</div>' + '</div></div>';
  }

	/* html for agent's message */
	cwAssist.lpChatMakeLeftSideMessage = function(title, msg, lpChatFontSize){
  	return '<div class="lpMessage">' + '<div class="messageSender">' + title
            + '</div><div class="lpBlueBg lpLeftBubble lpPosRel lpBubble">'
            + '<div class="lpChatMsg" style="font-size:' + lpChatFontSize
            + 'px">' + msg + '</div>' + '</div></div>';
  }


	/* make pre / post chat survey container Html */
	cwAssist.lpChatMakeSurveyContainerHtml = function(pPostChat){
		return '<div id="lpPreChatMessagesSection" class="lpMiddleSection" >'
				+ '<div class=""><div id="lpPreChatSurveySectionTitle" class=" ">'
				+ '<span class="lpPosRel lpChatSurveySectionLogo lpLeft sprite-bg" ></span>'
				+ '<div class="lpLeft lpPosRel ' + (pPostChat?'lpChatSurveySectionTextPost':'lpChatSurveySectionText') +'"></div>'
				+ '<div class="lpClear"></div></div>'
				+ '<div class="lpLine"></div>'
				+ '<div class="lpHeight298 lpYscroll"><div id="lpSurveyQuestionsContainer" class="lpPadLeftRight19"></div>'
				+ '<div id="lpChatSurveySectionBtn" class="lpTextCenter">'
				+ '<div id="lpPreChatSurveySubmitBtn" class="lpBlueButton lpPointer">' + lpCWTagConst.lpBtn_StartChat + '</div>'
				+ '<input type="hidden" value="" id="lpSurveyID">'
				+ '<input type="hidden" value="" id="lpSurveyTotalQuestNum">'
				+ '</div></div></div></div>';
	}
	
	/* make html for loading screen */
	cwAssist.lpChatMakeLoadingScreenHtml = function() {
		return '<div id="lpChatLoadingSection" class="lpMiddleSection lpTextCenter lpHeight364">'
				+ '<div class="lpPadLeftRight19" >'
				+ '<div class="lpLogo79">'
				+ '<!-- <span class="lpChatLoadingSectionLogo sprite-bg sprite-company-logo-large" ></span>-->'
				+ '</div><div class="lpLoadingMsg">' + lpCWTagConst.lpTxt_WS_Est_Connection + '</div>'
				+ '<div class="lpPaddingTopBottom20">'
				+ '<img src="img/loader.gif" class="lpChatLoadingSectionLoadingIcon" />'
				+ '</div></div></div>'
	}
	
	/* make html for screen for offline survey */
	cwAssist.lpChatMakeOfflineSurveySection = function(data){
		var div = '<div id="lpChatEndChatSection" class="lpMiddleSection lpTextCenter lpHeight364 lpYscroll">'
				+ '<div class="lpPadLeftRight19"><div class="lpPadTop25">'
				+ '<!-- <span class="lpChatLoadingSectionLogo sprite-bg sprite-company-logo-large" ></span>-->'
				+ '</div><div class="lpLoadingMsg">'
				+ '</div>'
				+ '<div class="lpPaddingTopBottom20 lpLoadingMsg lpTextCenter">'
				+ data.survey.header
				+ '</div>';
		
		if (data.survey.questions != null) {	
				div += '<div class="lpLine"></div>'
					+ '<div><div id="lpSurveyQuestionsContainer" class="lpPadLeftRight19"></div>'
					+ '<div id="lpChatSurveySectionBtn" class="lpTextCenter">'
					+ '<div id="lpOfflineSurveySubmitBtn" class="lpBlueButton lpPointer">Submit</div>'
					+ '<input type="hidden" value="" id="lpSurveyID">'
					+ '<input type="hidden" value="" id="lpSurveyTotalQuestNum">'
					+ '</div></div>' ;
		}
		div +='</div></div>';
		return div;
	}
	
	/* make html for offline screen - mostly use by static content set in config file*/
	cwAssist.lpChatMakeOfflineScreenHtml = function(msg) {
		return '<div id="lpChatLoadingSection" class="lpMiddleSection lpTextCenter lpHeight364">'
				+ '<div class="lpPadLeftRight19" >'
				+ '<div class="lpLogo79">'
				+ '<!-- <span class="lpChatLoadingSectionLogo sprite-bg sprite-company-logo-large" ></span>-->'
				+ '</div><div class="lpLoadingMsgError">'
				+ 'We were unable to establish a chat connection</div>'
				+ '<div class="lpPaddingTopBottom20 lpLoadingMsg">' + msg + '</div></div></div>';
	}
	
	/* html for chat window to hold agent / visitor messages */
	cwAssist.lpChatMakeMessageSection = function(pAudioOn) {
	    return '<div id="lpChatMainMessageSection" ><div>'
	            + '<div id="lpChatMenuSection" class="lpMiddleSection">'
	            + '<div id="lpChatMenuSection" ><div class="lpMenutButtonContainer" >'
	            + '<div class="lpLeft lpMenuButton lpPointer" >'
	            + '<span id="lpChatMenuItemFontDecreaseBtn"  class="lpHoverButton sprite-bg sprite-font-decrease" data-msg="' + lpCWTagConst.lpTxt_DecrFontSize + '" ></span>'
	            + '</div><div class="lpLeft lpMenuButton lpPointer" >'
	            + '<span id="lpChatMenuItemFontIncreaseBtn"  class="lpHoverButton sprite-bg sprite-font-increase" data-msg="' + lpCWTagConst.lpTxt_IncrFontSize + '" ></span>'
	            + '</div><div class="lpLeft lpMenuButton lpPointer" >'
	            + '<span id="lpChatMenuItemAudioBtn"   class="lpHoverButton sprite-bg ' + (pAudioOn?"sprite-font-sound-on": "sprite-font-sound-off") + '" data-msg="' + lpCWTagConst.lpTxt_TurnOffSound +'" ></span></div>'
	            + '<div class="lpClear"></div></div></div></div></div>'
	            + '<div id="lpChatMessagesSection" class="lpYscroll">'
	            + '<div class="lpSystemMessageDiv">'
	           	+ '</div></div>'
	            + '<div class="lpTextLeft ">'
	            + '<span id="lpChatAgentType" class="lpChatAgentType">' + lpCWTagConst.lpTxt_AgentTyping + '</span></div>'
	            + '<div id="lpChatInputFieldSection">'
	            + '<textarea placeholder="' + lpCWTagConst.lpTxt_ChatInput + '" id="lpChatInputTextField" class="lpChatInputTextField" disabled rows="3">'
	            + '</textarea></div><div class="lpClear"></div></div>';
	}
	
	/* make html for screen when chat gets disconnected */
	cwAssist.lpChatMakeEndChatSection = function() {
		//var tmpEndChatMsg = lpChatWidget.isInterativeChat()?"":
		var tmpEndChatMsg = "Although we didn&#39;t have an opportunity to chat with you today, please try again in the future.";
		return '<div id="lpChatEndChatSection" class="lpMiddleSection lpTextCenter lpHeight364">'
				+ '<div class="lpPadLeftRight19"><div class="lpLogo79">'
				+ '<!-- <span class="lpChatLoadingSectionLogo sprite-bg sprite-company-logo-large" ></span>-->'
				+ '</div><div class="lpLoadingMsg">'
				+ 'We are ending the chat session.</div>'
				+ '<div class="lpPaddingTopBottom20 lpLoadingMsg lpTextCenter">'
				+ tmpEndChatMsg
				+ '</div></div></div>';
	}
	
	/* make html for unsupported / old browser screen */
	cwAssist.lpChatMakeUpdateBrowserSection = function(){
		return '<div id="lpChatEndChatSection" class="lpMiddleSection lpTextCenter lpHeight364">'
				+ '<div class="lpPadLeftRight19"><div class="lpLogo79">'
				+ '<!-- <span class="lpChatLoadingSectionLogo sprite-bg sprite-company-logo-large" ></span>-->'
				+ '</div><div class="lpLoadingMsg">' + lpCWTagConst.lpMsg_UpdateBrowser
				+ '</div>' + '</div></div>';
	}
	
	/* make html for hover message over menu buttons */
	cwAssist.lpMakeHoverDiv = function(msg){
		$(".lpHoverDiv").remove();
		return '<div class="lpHoverDiv">' + '<div class="lpPosRel lpArrowUp" ></div>'
				+ '<div class="lpPosRel lpMessage">' + msg + '</div>' + '</div>';
	
	}
	
	/* make html for footer section */
	cwAssist.lpMakeFooterMsg = function(){
		return lpCWTagConst.lpMsg_PrivacyStatement;
	}
	
	/* open a popup window*/
	cwAssist.openPopupWin = function(url){
		window.open(url, "", lpCWTagConst.privacyWinOption);
	}
	
	/* open a privacy statement winow */
	cwAssist.openPrivacyStmnt = function(){
		cwAssist.openPopupWin(lpCWTagConst.lpPrivacyStatementUrl);
	}
}	

/**
 * LPChatWidgetNotification is providing the basic functionalities for the Embedded Window to show 
 * the notification in the middle of the Embedde Window screen for credit card masking detected & system error message.
 * Please note only 1 instance of notification is being use. Otherwise, notification message will display on top of each other.
 *
 * Usage:
 * 		cwa = new lpCWTag.LPChatWidgetNotification();
 * 		cwa.open("some message", false);
 * Output:
 *		inline html message will display on the screen
 *
 * @version: 0.9
 */
lpCWTag.LPChatWidgetNotification = lpCWTag.LPChatWidgetNotification || function LPChatWidgetNotification(window) {
	var dialogID = "notificationDialog";
	var myDialog = this;
	var openStatus = false;
	var notificationTimer;
	var useTimer = true;
	var notificationTimeCounter = 0;
	
	/**
	 * reset time counter 
	 */
	function resetTimeCounter(){
		notificationTimeCounter = 0;
	}
	
	/**
	 * close notification and clear out the timer and reset html content
	 */
	myDialog.close = function(){
		var elem = document.getElementById(dialogID);
		$(elem).hide(); 
		$(elem).html("");
		if(lpCWTagConst.lpChatNotification_ClickOutsideToClose){
			$(document).off("click.menu-outside");
		}
		if(useTimer)
			clearInterval(notificationTimer);
		resetTimeCounter();
		openStatus = false;
	}
	
	/**
	 * return true is another notification is already used 
	 */
	myDialog.isOpen = function(){ return openStatus; }
	
	/**
	 * Display notification on the center of Embedded Chat Window
	 * @param msg - message to display
	 * @param pUseTimer - true if use timer false otherwise. If timer is user, the notification will be dismissed after X sec that configured by lpChatNotification_Timeout
	 */
	myDialog.open = function(msg, pUseTimer){
		var elem = "#"+dialogID;
		$(elem).html('<div><p>' + msg + '</p></div>');
		$(elem).show();
		
		if(myDialog.isOpen()){
			resetTimeCounter();
		}else
			openStatus = true;
	
		if(pUseTimer){
			useTimer = pUseTimer;
			notificationTimer = setInterval(function(){ 
					notificationTimeCounter += 500;
					if(notificationTimeCounter >= lpCWTagConst.lpChatNotification_Timeout){
						//clearInterval(notificationTimer);
						myDialog.close();
					}
				}, 500);
		}
		
		if(lpCWTagConst.lpChatNotification_ClickOutsideToClose){
			$(document).on("click.menu-outside", function(event){
			    if(!($(event.target).is(elem) || $(event.target).parents().is(elem))){
			    	myDialog.close();
			    }
				});
		}
			
	}
}

/**
 * LPChatWidgetSessionManager is providing the basic mechanism to create/update/delete key/values to/from sessionStorage
 * Below is the structure of each of the parameter that will be saving to session storage
 *
 *	chatWizParam: {"lpChatSkill":"", "lpsuid":"", "lpWizChatState":"", "lpVisitorSessionId":"", 
 										"lpVisitorId":"", "lpAudio":"ON", "lpFontSize":"13", "lpMinimized":"N"};
 *	chatWizSurveyParam: {"lpPreChatSurveyNameOverride":"", "lpOfflineSurveyNameOverride":"", "lpExitSurveyNameOverride":"" };
 *
 * Usage:
 * 		sm = new lpCWTag.LPChatWidgetSessionManager(window);
 * 		sm.reloadDataFromSessionStorage();
 * Output:
 *		retriev data from session storage and save into the session manager session
 *
 * @version: 0.9
 */
lpCWTag.LPChatWidgetSessionManager = lpCWTag.LPChatWidgetSessionManager || function LPChatWidgetSessionManager(window){
	var sessionMgr = this;
	var timer;
	var logger = new lpCWTag.LPChatWidgetLogger();
	var cwAssist = new lpCWTag.LPChatWidgetAssist(window);
	var chatWizParam = {"lpChatSkill":"", "lpsuid":"", "lpWizChatState":"", "lpVisitorSessionId":"", "lpVisitorId":"", "lpAudio":"ON", "lpFontSize":"13", "lpMinimized":"N"};
	var chatWizSurveyParam = {"lpPreChatSurveyNameOverride":"", "lpOfflineSurveyNameOverride":"", "lpExitSurveyNameOverride":"" };
	var chatWizStarted= false;
	var chatLastUpdate="";
	
	/**
	 * contructs the unique session storage key with specified LP account
	 */
	function getSessionStorageKey(pKeyName){
		return	pKeyName+lpCWTagConst.lpChatAccountNumber;
	}
	
	/**
	 * reset session manager data
	 */
	sessionMgr.reset = function(){
		logger.debug("sessionMgr.reset", "....");
		chatWizStarted= false;
		chatLastUpdate="";
		chatWizParam = {};
		chatWizParam[lpCWTagConst.lpConst_SM_chatSkill] = "";
		chatWizParam[lpCWTagConst.lpConst_SM_SUID] = "";
		chatWizParam[lpCWTagConst.lpConst_SM_chatState] = "";
		chatWizParam[lpCWTagConst.lpConst_SM_visitorSessionId] = "";
		chatWizParam[lpCWTagConst.lpConst_SM_visitorId] = "";
		chatWizParam[lpCWTagConst.lpConst_SM_audio] = "ON";
		chatWizParam[lpCWTagConst.lpConst_SM_fontSize] = "13";
		chatWizParam[lpCWTagConst.lpConst_SM_minimized] = "N";
		chatWizSurveyParam = {};
		chatWizSurveyParam[lpCWTagConst.lpConst_SM_offlineSurveyNameOverride] = "";
		chatWizSurveyParam[lpCWTagConst.lpConst_SM_preChatSurveyNameOverride] = "";
		chatWizSurveyParam[lpCWTagConst.lpConst_SM_exitSurveyNameOverride] = "";
	}
	
	/** initiatlize to check for any abandon session and remove it **/
	sessionMgr.initialize = function(){
		logger.debug("sessionMgr.initialize", "...."+chatWizSurveyParam);
		
		if(cwAssist.isSessionStorageSupported()){
			var sKey = getSessionStorageKey(lpCWTagConst.lpConst_SM_chatWizParam);
			var tempChatWizParam = cwAssist.getValueFromSessionStorage(sKey);
			if(tempChatWizParam != null ){
				sessionMgr.deleteChatSessionStorage();
			}
			sessionMgr.reset();
		}
	}
	
	/**
	 * invokes this method to start session (start polling and updating timestamp)
	 */
	sessionMgr.start = function(){
		logger.debug("sessionMgr.start", "");
		sessionMgr.saveChatStartedToStorage();
		sessionMgr.saveChatLastUpdateToStorage();
		sessionMgr.startPolling();
	}
	
	/**
	 * stop session & stop polling data
	 */
	sessionMgr.stop = function(){
		logger.debug("sessionMgr.stop", "");
		sessionMgr.stopPolling();
		sessionMgr.deleteChatSessionStorage();	
	}
	
	/**
	 * stop polling to update data to session storage
	 */
	sessionMgr.stopPolling = function(){
		//stop polling
		if(typeof timer != "undefined"){
			logger.debug("sessionMgr.stopPolling", "....");
			clearInterval(timer);	
		}
	}
	
	/**
	 * start polling data and update to session storage
	 */
	sessionMgr.startPolling = function(){
		logger.debug("sessionMgr.startPolling", "...,");
		
		timer = setInterval(function(){ 
				if(sessionMgr.isActiveChatSession()){
					sessionMgr.saveChatLastUpdateToStorage();
				}else{
					sessionMgr.stopPolling();
				}
			}, lpCWTagConst.lpSessionMgr_RefreshInterval);	
			
	}

	sessionMgr.getChatSkill = function(){
		return chatWizParam[lpCWTagConst.lpConst_SM_chatSkill]
	}	
	
	sessionMgr.getSUID = function(){
		return chatWizParam[lpCWTagConst.lpConst_SM_SUID]
	}	
	
	sessionMgr.getVisitorSessionID = function(){
		return chatWizParam[lpCWTagConst.lpConst_SM_visitorSessionId]
	}	
	
	sessionMgr.getVisitorID = function(){
		return chatWizParam[lpCWTagConst.lpConst_SM_visitorId]
	}
	
	sessionMgr.isAudioOn = function(){
		return chatWizParam[lpCWTagConst.lpConst_SM_audio]=="ON"?true:false;
	}	
	
	sessionMgr.getFontSize = function(){
		return chatWizParam[lpCWTagConst.lpConst_SM_fontSize]==""?13:parseInt(chatWizParam[lpCWTagConst.lpConst_SM_fontSize]);
	}	
	
	sessionMgr.isMinimized = function(){
		return chatWizParam[lpCWTagConst.lpConst_SM_minimized]=="N"?true:false;
	}
	
	sessionMgr.getChatState = function(){
		return chatWizParam[lpCWTagConst.lpConst_SM_chatState];
	}
	
	sessionMgr.getPreChatSurveyNameOverride = function(){
		return chatWizSurveyParam[lpCWTagConst.lpConst_SM_preChatSurveyNameOverride]
	}
	
	sessionMgr.getOfflineChatSurveyNameOverride = function(){
		return chatWizSurveyParam[lpCWTagConst.lpConst_SM_offlineSurveyNameOverride]
	}
	
	sessionMgr.getExitChatSurveyNameOverride = function(){
		return chatWizSurveyParam[lpCWTagConst.lpConst_SM_exitSurveyNameOverride]
	}
	
	sessionMgr.isChatStarted = function(){
		return chatWizStarted;
	}
	
	/**
	 * return true if session is an active session. An active session is when the last update data is less than the keepAlive value
	 */
	sessionMgr.isActiveChatSession = function(){
		var currentTime = $.now();
		var timeDiff = 1+lpCWTagConst.lpSessionMgr_KeepAlive;
		
		if(chatLastUpdate != "")
			timeDiff  = currentTime - chatLastUpdate;
		return timeDiff <= lpCWTagConst.lpSessionMgr_KeepAlive?true:false;
	}
	
	/**
	 * save chatWizParam to session storage
	 */
	sessionMgr.setChatWizParam = function(pChatSkill, pSUid, pVisitorSessionId){
		chatWizParam[lpCWTagConst.lpConst_SM_chatSkill] = pChatSkill;
		chatWizParam[lpCWTagConst.lpConst_SM_SUID] = pSUid;
		chatWizParam[lpCWTagConst.lpConst_SM_visitorSessionId] = pVisitorSessionId;
		sessionMgr.saveChatWizParamToStorage();
		
	}
	
	/**
	 * save chatWizSurveyParam to session storage
	 */
	sessionMgr.setChatWizSurveyParam = function(lpPreChatSurveyNameOverride, lpOfflineSurveyNameOverride, lpExitSurveyNameOverride){
		chatWizSurveyParam[lpCWTagConst.lpConst_SM_preChatSurveyNameOverride] = lpPreChatSurveyNameOverride;
		chatWizSurveyParam[lpCWTagConst.lpConst_SM_offlineSurveyNameOverride] = lpOfflineSurveyNameOverride;
		chatWizSurveyParam[lpCWTagConst.lpConst_SM_exitSurveyNameOverride] = lpExitSurveyNameOverride;
		sessionMgr.saveChatWizSurveyParamToStorage();
	}
	
	sessionMgr.setChatState = function(pState){
		chatWizParam[lpCWTagConst.lpConst_SM_chatState] = pState;
		sessionMgr.saveChatWizParamToStorage();
	}
	
	sessionMgr.setAudio = function(pIsOn){
		chatWizParam[lpCWTagConst.lpConst_SM_audio] = pIsOn?"ON":"OFF";
		sessionMgr.saveChatWizParamToStorage();
	}
	
	sessionMgr.setFontSize = function(pFontSize){
		chatWizParam[lpCWTagConst.lpConst_SM_fontSize] = pFontSize;
		sessionMgr.saveChatWizParamToStorage();
	}
	
	sessionMgr.setMinimized = function(pIsMinimized){
		chatWizParam[lpCWTagConst.lpConst_SM_minimized] = pIsMinimized?"Y":"N";
		sessionMgr.saveChatWizParamToStorage();
	}
	
	sessionMgr.setVisitorID = function(pVisitorID){
		if(pVisitorID != chatWizParam[lpCWTagConst.lpConst_SM_visitorId]){
			chatWizParam[lpCWTagConst.lpConst_SM_visitorId] = pVisitorID;
			sessionMgr.saveChatWizParamToStorage();
		}
	}
	
	sessionMgr.saveChatLastUpdateToStorage = function(){
		var sKey = getSessionStorageKey(lpCWTagConst.lpConst_SM_chatLastUpdate);
		chatLastUpdate = $.now();
		cwAssist.setValueToSessionStorage(sKey, chatLastUpdate);
	}
	
	sessionMgr.saveChatStartedToStorage = function(){
		var sKey = getSessionStorageKey(lpCWTagConst.lpConst_SM_chatStarted);
		chatWizStarted = "true";
		cwAssist.setValueToSessionStorage(sKey, chatWizStarted);
	}
	
	sessionMgr.saveChatWizParamToStorage = function(){
		var sKey = getSessionStorageKey(lpCWTagConst.lpConst_SM_chatWizParam);
		cwAssist.setValueToSessionStorage(sKey, JSON.stringify(chatWizParam));
	}
	
	sessionMgr.saveChatWizSurveyParamToStorage = function(){
		var sKey = getSessionStorageKey(lpCWTagConst.lpConst_SM_chatWizSurveyParam);
		cwAssist.setValueToSessionStorage(sKey, JSON.stringify(chatWizSurveyParam));
	}
	
	/**
	 * remove chat session storage
	 */
	sessionMgr.deleteChatSessionStorage = function(){
		logger.debug("sessionMgr.deleteChatSessionStorage", "...");
		chatWizStarted = false;
		chatLastUpdate ="";
		if(cwAssist.isSessionStorageSupported()){
			cwAssist.deleteValueToSessionStorage(getSessionStorageKey(lpCWTagConst.lpConst_SM_chatStarted)); 
			cwAssist.deleteValueToSessionStorage(getSessionStorageKey(lpCWTagConst.lpConst_SM_chatLastUpdate)); 
			cwAssist.deleteValueToSessionStorage(getSessionStorageKey(lpCWTagConst.lpConst_SM_chatWizParam));
			cwAssist.deleteValueToSessionStorage(getSessionStorageKey(lpCWTagConst.lpConst_SM_chatWizSurveyParam));
		}
	}
	
	/**
	 * sync up the data in session storage. This is useful when reloading the page or navigation from page to page.
	 */
	sessionMgr.reloadDataFromSessionStorage = function(){
		logger.debug("sessionMgr.reloadDataFromSessionStorage", "...");
		
		if(cwAssist.isSessionStorageSupported()){
			var sKey_ChatStarted = getSessionStorageKey(lpCWTagConst.lpConst_SM_chatStarted);
			var sKey_ChatLastUpdate = getSessionStorageKey(lpCWTagConst.lpConst_SM_chatLastUpdate);
			var sKey_ChatWizParam = getSessionStorageKey(lpCWTagConst.lpConst_SM_chatWizParam);
			var sKey_ChatWizSurveyParam = getSessionStorageKey(lpCWTagConst.lpConst_SM_chatWizSurveyParam);
			
			var tempChatWizStarted = cwAssist.getValueFromSessionStorage(sKey_ChatStarted);
			var temChatLastUpdate = cwAssist.getValueFromSessionStorage(sKey_ChatLastUpdate);
			var temChatWizParam = cwAssist.getValueFromSessionStorage(sKey_ChatWizParam);
			var temChatWizSurveyParam = cwAssist.getValueFromSessionStorage(sKey_ChatWizSurveyParam);
			
			if(tempChatWizStarted != null && tempChatWizStarted != ""){
				chatWizStarted = tempChatWizStarted;
			}
			
			if(temChatLastUpdate != null && temChatLastUpdate != "")
				chatLastUpdate = temChatLastUpdate;
				
			if(cwAssist.isJSONSupported()){
				if(temChatLastUpdate != null )
					chatWizParam = JSON.parse(temChatWizParam);
				
				if(temChatWizSurveyParam != null )
					chatWizSurveyParam = JSON.parse(temChatWizSurveyParam);
			}
		}
	}
}

