/**
 * This file contains all the pre-configurable settings and public method to control on Embedded Window flow from Parent page.
 * You can change the pre0configurable settings below. However, please dont change the functionalities unless you absolutely know what you are doing.
 * To make it works, you need to change the correct reference to your iFrame resource
 * 	lpCWTagConst.CHAT_BASE_URL - your base URL domain
 * 	lpCWTagConst.CHAT_LOCATION_URI - your URI referencing to the resources of iFrame
 **/
 
window.lpCWTagUI = window.lpCWTagUI || {};

/**
 * Logger - to provide printing statement and JSON object to browser console.
 * Usage:
 * 		logger = new lpCWTagUI.LPChatWidgetLogger();
 * 		logger.debug("string or json object", "string or json object")
 * Output:
 *		time_stamp : LOGGER NAME : string or json object : string or json object
 * @version: 0.9
 */
lpCWTagUI.LPChatWidgetLogger = lpCWTagUI.LPChatWidgetLogger || function LPChatWidgetLogger() {
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
			console.log(date + " " + pLogName + " : " + pData + (pData2 == "" ? "" : (" : " + pData2)));
		}
	}
	
	/**
	 * print debug statement to console only if DEBUG_ENABLE is true
	 * @param dataOrMessage - string or JSON
	 * @param dataOrMessage2 - string or JSON
	 */
	cwLogger.debug = function(dataOrMessage, dataOrMessage2){
		print_to_log(lpCWTagConst.LOGGER_NAME_BOOTSTAP, dataOrMessage || "", dataOrMessage2 || "", lpCWTagConst.DEBUG_ENABLE);
	}	
	
	/**
	 * print info statement to console
	 * @param dataOrMessage - string or JSON
	 * @param dataOrMessage2 - string or JSON
	 */
	cwLogger.info = function(dataOrMessage, dataOrMessage2){
		print_to_log(lpCWTagConst.LOGGER_NAME_BOOTSTAP, dataOrMessage || "", dataOrMessage2 || "", lpCWTagConst.INFO_ENABLE);
	}	
}

/**
 * LPChatWidgetUI is providing the wrapper functionality to create chat iFrame and all communication to the iFrame via postMessage.
 * This class also receiving postMessage (command) from iFrame to resize the PCI as well as other functionalities to support the wrapper behavior
 * Usage:
 * 		chatUI = new lpCWTagUI.LPChatWidgetUI(window);
 * 		chatUI.loadChat()
 * Output:
 *		will load the Embedded Window widget
 * @version: 0.9
 */
lpCWTagUI.LPChatWidgetUI = lpCWTagUI.LPChatWidgetUI|| function LPChatWidgetUI(window) {
	var myUI = this;
	var webserviceTimer;
	var logger = new lpCWTagUI.LPChatWidgetLogger();
	var chatWinLoaded = false;
	var isChatActive = false;
	var isDock = true;
	var lpVisitorSessionId = "";
	var originalSiteTitle="";
	var chatMaximize = false;
	var lpPCIGenIDEnable = lpCWTagConst.WS_ENABLE;
	var chatWizContainer, chatiFrameContainer, chatiFrame, dragManager, draManagerSession;
	var isPciVisible = false;
	var chatFrameLoaded = false;
	var previousTop=0, previousLeft = 0;
	
	function getElement(id){
		return document.getElementById(id);	
	}
	
	function removeElement(element){
		if(element && element.parentNode)
			element.parentNode.removeChild(element);	
	}
	
	function showElement(idObj){
		if(typeof idObj != "undefined")
			idObj.style.display = "block";	
	}
	
	function showElementById(id){
		showElement(getElement(id));
	}
	
	function hideElement(idObj){
		if(typeof idObj != "undefined")
			idObj.style.display = "none";	
	}
	
	function hideElementById(id){
		hideElement(getElement(id));	
	}
	
	function deleteAppendStyleClassById(elementId, classToRemove, classToAdd){
		return deleteAppendStyleClass(getElement(elementId), classToRemove, classToAdd);
	}
	
	/**
	 * remove the css class and then append new css class
	 * @param element - element to modify
	 * @param classToRemove - css class to remove from the exist element
	 * @param classToAdd - css class to append/add to the exist element
	 */
	function deleteAppendStyleClass(element, classToRemove, classToAdd){
		logger.debug("deleteAppendStyleClass", "classToRemove="+classToRemove+", classToAdd="+classToAdd);
		
		var newClassName = "";      	
    if(typeof element != "undefined" && element && element.className){
	    var classes = element.className.split(/\s/g);  //split by whitespace
	    if(classes.length > 0){
		    for(var i = 0; i < classes.length; i++) {
		    	if(classes[i] != "" && classes[i] !== classToRemove && classes[i] !== classToAdd) {
		    		if(newClassName != "")
		    			newClassName += " ";
		        newClassName += classes[i];
		      }
		    }
		  }
	  }
	  
	  if(newClassName != "")
			newClassName += " ";
    newClassName += classToAdd;
    logger.debug("deleteAppendStyleClass", "newClassName="+newClassName);
    return newClassName;
	}
	
	/**
	 * Retrieve the offset of the element
	 * @param element
	 */
	function getOffset(element) {
		var left = 0, top = 0;
    while( element && !isNaN( element.offsetLeft ) && !isNaN( element.offsetTop ) ) {
        left += element.offsetLeft - element.scrollLeft;
        top += element.offsetTop - element.scrollTop;
        element = element.offsetParent;
    }
    return { top: top, left: left };
	}

	/**
	 * Bind event to DOM. Supporting IE8 +
	 * @param element to bind
	 * @param eventName - event name to bind
	 * @param callback - callback method
	 */
	function bindEvent(element, eventName, callback) {
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, false);
	} else {
        element.attachEvent("on" + eventName, callback);
    }
	}
	
	/**
	 * Unbinds method from DOM
	 * @param element to unbind
	 * @param eventName - event name to unbind
	 * @param callback - callback method
	 */
	function unBindEvent(element, eventName, callback) {
    if (element.addEventListener) {
        element.removeEventListener(eventName, callback, false);
    } else {
        element.detachEvent("on" + eventName, callback);
    }
	}

	/**
	 * Buid the iFrame of Embedded Chat Window and mark if the DIV has created to avoid creating multiple embedded window.
	 */
	function lpChatBuildFrame() {
		if(!chatWinLoaded){
			logger.debug("lpChatBuildFrame", "...");
			var body = document.body;
			try{
				//register to receive PostMessage prior create iFrame in case of iFrame will fireback the msg to show the container
				myUI.registerOnMessage();
				logger.debug("lpChatBuildFrame", "registerOnMessage");
				
				// 1. create outtermost container DIV '<div id="lpChatWizContainer" style="display:none;"></div>'
				chatWizContainer = document.createElement('div');
				chatWizContainer.id = 'lpChatWizContainer1';
				chatWizContainer.style.display="none";
				
				function appendChatContainer(chatWizContainer){
					logger.debug("lpChatBuildFrame", "appendChatContainer");
					getElement("lpChatWizContainerNew").appendChild(chatWizContainer);
					getElement("lpChatWizContainerNew").style.cssText = 'width:'+lpQueryParams.adWidth+'px; height:'+lpQueryParams.adHeight+'px; position: absolute; z-index:-1;display:none;';
				}
				appendChatContainer(chatWizContainer);
				
				// 2. create Title contain for draggable. When chat is minize, only this title contain stay 'on' 
				chatWizContainer.innerHTML = makeHeader();
			
				// 3. create a iframe holder area '<div id="lpChatiFrameContainer" class="lpPosRel"></div>'
				chatiFrameContainer = document.createElement('div');
				chatiFrameContainer.id = 'lpChatiFrameContainer';
				chatiFrameContainer.className ="lpPosRel";
				chatWizContainer.appendChild(chatiFrameContainer);
			
				// 4. attach the iframe to lpChatiFrameContainer
				chatiFrame = document.createElement("iframe");
				chatiFrame.id = 'lpChatiFrame';
				chatiFrame.className = 'lpChatiFrame';
				chatiFrame.src = getFrameSource();
				chatiFrame.scrolling = 'no';
				chatiFrame.frameBorder = '0';
				chatiFrame.style.border = "none";
				chatiFrame.style.width = "100%";
				chatiFrame.style.height = "100%";
				chatiFrame.setAttribute('allowtransparency', 'true');
				
				chatiFrameContainer.appendChild(chatiFrame);
				logger.debug("lpChatBuildFrame", "getFrameSource: " + getFrameSource());
				bindEvent(chatiFrame, "load", flagChatFrameLoaded);
				chatWinLoaded = true;
				//bind all events to this chat
				myUI.bindEvents();
			
			}catch(excp){
				logger.debug("lpChatBuildFrame", "Exception occurred", excp);
			}
		}else{
			logger.debug("lpChatBuildFrame", "chat window already loaded");
		}
	}
	
	function flagChatFrameLoaded(){
		logger.debug("flagChatFrameLoaded", "method invoke");
		chatFrameLoaded = true;
	}
	
	function getTargetForChatFrame(){
		var iFrameURL = getFrameSource();
		return iFrameURL.indexOf('https') > -1 ? 'https://' + iFrameURL.substr(8).split('/')[0] : 'http://'+ iFrameURL.substr(7).split('/')[0];
        }
	
	function getChatBaseDomain() {
		return lpCWTagConst.CHAT_BASE_URL.replace(/,\s*$/, "");	
	}
	
	function getFrameSource() {
		var frameURL = getChatBaseDomain() + lpCWTagConst.CHAT_LOCATION_URI
				+ lpCWTagConst.CHAT_LOCATION_URI2 + "lpChatWireFrame.html?v" + lpCWTagConst.VERSION+"&lpAccNumber="+lpQueryParams.lpAccNumber+"&chatStyle="+lpQueryParams.ChatStyle;
		return frameURL;
	}
	
	function isSameOrigin(respDomain) {
		logger.debug("isSameOrigin respDomain=" + respDomain , "targetDomain: " + getTargetForChatFrame());
		return getTargetForChatFrame() == respDomain ? true : false;
	}
	
	/**
	 * Send postMessage to iFrame
	 * @param jsonData - json data to send to iFrame
	 */
	function sendPostMessage(jsonData){
		logger.debug("parentFrame sending postmsg to ="+getTargetForChatFrame(), jsonData);
		
		if (getLPChatiFrameObj().postMessage)
			getLPChatiFrameObj().postMessage(JSON.stringify(jsonData), getTargetForChatFrame());	
		else  
			throw new Error ("Your browser does not support the postMessage method!"); 
	    
	}
	
	function getLPChatiFrameObj() {
		var x = document.getElementById("lpChatiFrame");
		return (x.contentWindow || x.contentDocument);
	}
	
	//hide embedded chat window
	function hideLPChat() {
		hideElement(chatWizContainer);
	}
	
	//show embedded chat window
	function showLPChat() {
		showElement(chatWizContainer);
	}
	
	//LP Web Service send data
	function sendChatReq(){
		logger.debug("WebService", "execute lpSendData..");
		lpSendData('page','lpChatRequest','true');
	}
	
	//checking LP web service data for completion
	function sendDataCheckWebService(){
		logger.debug("WebService", "execute sendDataCheckWebService..");
		lpSendData('page','lpDataCheck','true');
	}
	
	/**
	 * When chat now button is clicked, this method will fire and gather all preset data from RE 
	 * and pass it along to iFrame via postMessage
	 */
	function fireLPChat() {
		logger.debug("fireLPChat", "...");
		var defaultSkill = 'sales-english';//sales-english,offline
		var siteContainer = "";
		var offlineSurveyNameOverride = ""; //use for override on OfflineChatSurvey
		var preChatSurveyNameOverride = ""; //use for override on PreChatSurvey
		var exitChatSurveyNameOverride = ""; //use for override on ExitChatSurvey
		var webserviceFailureOfflineSurveyNameOverride = ""; //use for this value to display in case Web Services failed
		var nonInteractiveChatSurveyNameOverride = ""; //value to hold the None Interactive Chat Survey Name
		
		if (typeof window.lpChatSkill != "undefined") {
			defaultSkill = window.lpChatSkill;
		}
		
		if (typeof window.lpOfflineSurveyNameOverride != "undefined") {
			offlineSurveyNameOverride = window.lpOfflineSurveyNameOverride;
		}
		
		if (typeof window.lpPreChatSurveyNameOverride != "undefined") {
			preChatSurveyNameOverride = window.lpPreChatSurveyNameOverride;
		}
		
		if (typeof window.lpExitChatSurveyNameOverride != "undefined") {
			exitChatSurveyNameOverride = window.lpExitChatSurveyNameOverride;
		}
		
		if (typeof window.lpPCIGenID  != "undefined") {
			lpPCIGenIDEnable = window.lpPCIGenID;
		}
		
		if (window.lpMTagConfig  != "undefined" && window.lpMTagConfig.FPC_CONT) {
			siteContainer = window.lpMTagConfig.FPC_CONT;
		}
		
		if (window.lpMTagConfig && window.lpMTagConfig.LPSID_VAR) {
			lpVisitorSessionId = window.lpMTagConfig.LPSID_VAR;
		}
		
		if (typeof window.lpWebserviceFailureOfflineSurveyNameOverride != "undefined") {
			webserviceFailureOfflineSurveyNameOverride = window.lpWebserviceFailureOfflineSurveyNameOverride;
		}
		
		if(typeof window.lpNonInteractiveChatSurveyNameOverride != "undefined"){
			nonInteractiveChatSurveyNameOverride = window.lpNonInteractiveChatSurveyNameOverride;
		}
					
		var lpChatWizButtonName = lpMTagConfig.chatWizButtonName?lpMTagConfig.chatWizButtonName:"";
		
		sendPostMessage({"lpEmbChatWiz": "LPNVCF", "CMD" : "CONTROL", "value" : "lpStartChatButtonClicked", "skill" : defaultSkill, "lpChatWizButtonName" : lpChatWizButtonName, "lpVisitorSessionId": lpVisitorSessionId, "WS_ENABLE": lpPCIGenIDEnable, "siteContainer": siteContainer, "offlineSurveyNameOverride" : offlineSurveyNameOverride, "preChatSurveyNameOverride": preChatSurveyNameOverride, "exitChatSurveyNameOverride":exitChatSurveyNameOverride, "webserviceFailureOfflineSurveyNameOverride":webserviceFailureOfflineSurveyNameOverride, "nonInteractiveChatSurveyNameOverride": nonInteractiveChatSurveyNameOverride});
	}
	
	//invokes when close button on the title bar is clicked  
	function closeButtonClicked(){
		logger.debug("closeButtonClicked", "method is invoked");
		sendPostMessage({"lpEmbChatWiz": "LPNVCF", "CMD" : "CONTROL", "value" : "HIDE_CONTAINER"});
	}
	
	/**
	 * Handle the end chat
	 */
	function endChat(){
		logger.debug("endChat", "method is invoked");
		isChatActive = false;
		showChatWizContainerVisibility(false);
	}
	
	//make embedded window visible
	function showChatWizContainerVisibility(bVal){
		logger.debug("showChatWizContainerVisibility", "...");
		
		if(bVal){
			showElement(chatWizContainer);
			hideElementById(lpQueryParams.dynamicButtonName);
                        getElement("lpChatWizContainerNew").style.display = "block";
			getElement("lpChatWizContainerNew").style.zIndex = "1";
		}else{
			hideElement(chatWizContainer);
			showButtonOnDelay(0);
                        getElement("lpChatWizContainerNew").style.display = "none";
			getElement("lpChatWizContainerNew").style.zIndex = "-1";
		}
		
	}
	
	/* make html for blue header with dock, minimize and close button */
	function makeHeader() {
		var headerStr = '<div id="lpChatTitleContainer" class="lpRight">'
				+ '<div id="lpChatTitleDragArea" class="lpLeft"><div class="lpLeft"><span class="lpChatTitleContainerLogo lpLeft lpCustSpriteBackground lpCustChatLogoSmall" ></span></div>'
				+ '<div id="lpChatTitleTxt" class="lpLeft lpChatHeaderText noselect" unselectable="on">' + lpCWTagConst.lpChatTitleVal + '</div></div>'
				+ '<div class="lpRight lpHeaderActionbuttonsContainer" style="">' ;
				if(lpCWTagConst.enableDockUnDock){
					headerStr	+= '<div class="lpHeaderActionbuttons lpHoverButton lpPointer" data-msg="' + lpCWTagConst.lpChatTitleUndock 
						+ '" id="lpChatPopOutBtn" ><span id="lpChatPopOutBtnImg" class="lpPointer lpCustSpriteBackground lpCustChatIconPopOut" ></span></div>'
				}
				headerStr += '<div class="lpHeaderActionbuttons lpHoverButton lpPointer" data-msg="Minimize" id="lpChatMinizeBtn" >'
				+ '<span id="lpChatMinizeBtnImg" class="lpPointer lpCustSpriteBackground lpCustChatIconMinimize" ></span></div>'
				+ '<div class="lpHeaderActionbuttons lpHoverButton lpPointer" data-msg="' + lpCWTagConst.lpChatTitleClose 
				+ '" id="lpChatEndChatBtn" ><span class="lpPointer lpCustSpriteBackground lpCustChatIconClose" ></span></div>'
				+ '</div><div class="lpClear"></div>'
				+ '</div><div class="lpClear"></div>';
				return headerStr;
	}
	
	
	/* make hover message for dock, minimize and close button */
	function makeHoverDiv(msg, pDownArrow) {
		removeMouseOverToolTip();
		
		var messageDiv = document.createElement('div');
		messageDiv.className = pDownArrow?'lpBubbleUp':'lpBubbleDown';
		messageDiv.id = "lpToolTipContent";
		messageDiv.innerHTML = msg;
		return messageDiv;
	}
	
	// remove hover tool-tip div
	function removeMouseOverToolTip() {
		logger.debug("removeMouseOverToolTip", "delete tooltip");
		removeElement(getElement("lpToolTipContent"));
	}
	
	
	myUI.endChatRequest = function(){
		closeButtonClicked();
	}
	
	myUI.debugEnable = function(){
		lpCWTagConst.DEBUG_ENABLE = true;
		sendPostMessage({"lpEmbChatWiz": "LPNVCF", "CMD" : "DEBUG", "value" : "ENABLE"});
	}
	
	myUI.debugDisable = function(){
		lpCWTagConst.DEBUG_ENABLE = false;
		sendPostMessage({"lpEmbChatWiz": "LPNVCF", "CMD" : "DEBUG", "value" : "DISABLE"});
	}
	
	myUI.debug = function(pLogName, pData) {
		logger.debug(pLogName, pData);
	}

	myUI.loadChat  = function() {
		logger.debug("loadChat", "method invoked");
		lpChatBuildFrame();
		
		if(!isChatActive){
			logger.debug("loadChat", "an active chat session not found, about fireChat");
			var iFrameContentTimerCounter = 0;
			var iFrameContentTimer = setInterval(function(){
				iFrameContentTimerCounter += 500;
				if(iFrameContentTimerCounter >= 10000){
					clearInterval(iFrameContentTimer);
					logger.info("loadChat", "iframe content exceeded maximun load time of " + iFrameContentTimerCounter + " seconds. Suggest to reload page");
				}else{
					logger.debug("loadChat", "waiting for iFrame content to load..chatFrameLoaded="+chatFrameLoaded);	
					if(chatFrameLoaded){
						logger.debug("loadChat", "iFrame content fully loaded");	
						fireLPChat();
						clearInterval(iFrameContentTimer);
					}
				}
			}, 500);
		}else{
			showChatWizContainerVisibility(true);
			//logger.debug("loadChat", "an active chat session found. do nothing");
			logger.debug("loadChat", "an active chat session found. Continuing the existing session");
		}
	}
	
	myUI.chatOnPageLoad  = function() {
		logger.info("chatOnPageLoad", "starting...");
		lpChatBuildFrame();
	}
	
	myUI.registerOnMessage = function() {
		if (window.addEventListener){
			window.addEventListener("message", myUI.receiveChatPostMessage, false)
		} else {
			window.attachEvent("onmessage", myUI.receiveChatPostMessage)
		}
	}
	
	myUI.receiveChatPostMessage  = function(e) {
		if (lpCWTagConst.DEBUG_ENABLE && isSameOrigin(e.origin)) {
			logger.debug("receiveChatPostMessageParent", e.data);
		}
		
		try{
			var msgData = JSON.parse(e.data);
			if(msgData.lpEmbChatWiz == "LPNVPF"){
				if(msgData.CMD == "FLASHING"){
					if(msgData.value == 'START'){
						flashingStart();
					}else{
						flashingStop();
					}
				}else if(msgData.CMD == "CONTROL"){
					if(msgData.value == 'SHOW_CONTAINER'){
						showChatWizContainerVisibility(true);
					}else if(msgData.value == 'END_CHAT'){
						endChat();
					}else if(msgData.value == 'HIDE_CONTAINER'){
						showChatWizContainerVisibility(false);
					}else if(msgData.value == 'CHAT_STATE_ACTIVE'){
						isChatActive = true;
					}else if(msgData.value == 'CHAT_STATE_INACTIVE'){
						isChatActive = false;
					}
				}
			}
		}catch (excp) { 
			logger.debug("lpReceiveChatPostMessage. Exception occurred", excp);
		}
		
		return;
	}
	
	myUI.bindEvents = function() {
		logger.debug("bindEvents", "...");
		bindEvent(getElement("lpChatEndChatBtn"), "click", closeButtonClicked);	
		logger.debug("bindEvents", "complete");						
	}
	
	myUI.isChatWinLoaded = function() {
		return chatWinLoaded;
	}
	
	myUI.webServicesEnable = function(){
		lpPCIGenIDEnable = true;
	}
	
	myUI.webServicesDisable = function(){
		lpPCIGenIDEnable = false;
	}
	
	myUI.embeddedChatVersion = function(){
		return lpCWTagConst.VERSION;
	}
}

lpChatWidgetUI = new lpCWTagUI.LPChatWidgetUI(window);

/*** BELOW METHODs AVAILABLE MAIN WINDOW ***/

/**
 * invoke this method if you want to end chat. This is particular useful when a user clicks to log out and 
 * you code needs to call this method to end the chat as well.
 */
function lpEndChat(){
	lpChatWidgetUI.endChatRequest();
}

/**
 * invoke this method to start embedded chat. This is required to call this method when users click on 'chat now' button
 */
function lpLoadChat() {
	lpChatWidgetUI.loadChat();
}

/**
 * invoke when bootstrap.js is included and once the page is loaded
 */
function lpChatOnPageLoad() {
	lpChatWidgetUI.chatOnPageLoad();
}

function lpChatWizInfo(){
	new lpCWTagUI.LPChatWidgetLogger().info("Initializing Chat Widget Bootstrap", "Version ["+lpCWTagConst.VERSION+"]");
}

//show info to console that Embedded Chat Window is included.
lpChatWizInfo();