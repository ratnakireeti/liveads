/**
 * This file define a class-like structure for Embedded Window on iFrame.
 * Please dont change these unless you absolutely know what you are doing.
 **/
 
/* Define NameSpace for Chat Widget Implementation */
window.lpCWTag = window.lpCWTag || {};
window.lpCWTagConst = window.lpCWTagConst || {};
var lpMTagConfig = lpMTagConfig || {}; lpMTagConfig.vars = lpMTagConfig.vars || [];

/**
 * LPChatWidget is the driver of the embedded window. This component is responsible for connecting to LP platform using different set of LP APIs.
 * Most business logic is implemented in this class. Therefore, a deep understand is required before modifying anything in this class.
 *
 * Usage:
 * 		cw = new lpCWTagUI.LPChatWidget();
 * 		cw.reEstChatConnection()
 * Output:
 *		embedded window will establish an exist connection/session
 *
 * @version: 0.9
 */
lpCWTag.LPChatWidget = lpCWTag.LPChatWidget || function LPChatWidget(window) {
			var myChatWiz = this;
			var lpCWAssist = new lpCWTag.LPChatWidgetAssist(window);
			var logger = new lpCWTag.LPChatWidgetLogger();
			var sessionMgr, notificationDialog;
			
			var lpChatWinMinimized = false; //indicates window whether minimize or maximize
			var lpChatFlashingStarted = false; //indicates flashing started or not
			
			// indicator whether to show slide-out or not. Default is not show
			var isSlideOutShow = false;

			// the original height when not minimize
			var lpChatUnMinizeHeight = "600px";

			// the height when minimize
			var lpChatMinizeHeight = "180px";

			// the width of the ChatWizFrameContainer (this is on the parent
			// page) when the slide-out is hidden
			var lpChatWizFrameContainerOriginalWidth = "300px";

			// the width of the ChatiFrame (this is on the parent page)
			var lpChatiFrameOriginalWidth = "300px";

			//the width of the ChatWizFrameContainer (on the parent page) when the slid-out appears
			var slideOutOnWidthSize = "300px";

			var isAudioOn = true;
			var skill = "offline"; // chatSkill, SMC-english
			var offlineSurveyNameOverride = ""; //display offline message by SurveyName - override feature
			var preChatSurveyNameOverride = ""; //display prechat message by SurveyName - override feature
			var exitSurveyNameOverride = ""; //display exit message by SurveyName - override feature
			var webserviceFailureOfflineSurveyNameOverride = ""; //use for this value to display in case Web Services failed
			var nonInteractiveChatSurveyNameOverride = ""; //use this value to display survey form for non-interactive chat
			var lpSUID = "";//store uniqued ID for chat session
			
			var chatState, screenState='', windowState='';
			var tabIndex = 7;
			
			var surveyResult; // hold prechat survey results
			var visitorId; // hold visitorId
			var webserviceLoadComplete = true;//webservice load indicator
			var webserviceLoadResult = false;//webservice load result
			var chat, collaborationApi, chatInstanceReady = false, collaborationInstanceReady=false; // API instances

			var LP_CHAT_FONT_SIZE_MIN = 11;
			var LP_CHAT_FONT_SIZE_MAX = 15;
			var lpChatFontSize = 13;
			
			var lpChatWizButtonName = ""; //request ButtonName param
			var lpVisitorSessionId = ""; //request visitorSessionId param
			var webserviceTimer; //web service timer
			var webserviceEnable = true;
			var chatWinCloseable = true;
			var lpSiteContainer = ""; 
			var lpInteractiveChat = false;  //indicate if there is an interactive msg from a visitor
			var lpVisitorTypingMsg = false;
			var lpChatStartWebStorageKey = "LP_NV_EW";
			
			//available data types for pre chat and post chat. these are used to decide what validation type needs to by applied 
			var dataTypes = {
				CHECKBOX : 'Checkbox',
				RADIO : 'Radio Button',
				RADIO_SIDE : 'Radio Button (side by side)',
				TEXT : 'Text Field',
				TEXT_AREA : 'Text Area',
				NUMERIC : 'Numeric Field',
				DROPDOWN : 'Dropdown Box'
			}
			
			var screenStateType = {NONE:'', PRECHATSURVEY:'PRECHAT_SURVEY', CHATTING:'CHATTING', EXITSURVEY:'EXIT_SURVEY'}
			var windowStateType = {READY: 'READY', DESTRUCTION: 'DESTRUCTION' }

			/*****************DEFINE THE HTML IDs **************************/
			var lpChatID_lpChatiFrame = "lpChatiFrame"; // this is the iFrame id
			var lpChatID_lpChatWizContainer = "lpChatWizContainer"; //this is the  wrapper DIV on the parent  page

			var lpChatID_lpChatWizFrameContainer = "lpChatWizFrameContainer"; //this is the main chat DIV in the iFrame
			var lpChatID_lpChatBodySection = "lpChatBodySection"
			var lpChatID_lpChatAgentType = "lpChatAgentType"; //the chatAgentTyping element
			var lpChatID_lpChatMessagesSection = "lpChatMessagesSection"; //the ChatMessageSection div
			var lpChatID_lpChatInputTextField = "lpChatInputTextField"; //the lpChatInputTextField textarea where vistor can type in
			var lpChatID_lpChatCloseChatBtn = "lpPreChatCloseBtn"; //close button in footer
			var lpChatID_lpChatSendChatBtn = "lpSendChatBtn"; //send button in footer
			var lpChatID_lpChatMenuSection = "lpChatMenuSection"; //the chatmenu DIV
			var lpChatID_lpChatInputFieldSection = "lpChatInputFieldSection"; // the chat  input field DIV
			var lpChatID_lpChatMenuItemFontDecreaseBtn = "lpChatMenuItemFontDecreaseBtn";
			var lpChatID_lpChatMenuItemFontIncreaseBtn = "lpChatMenuItemFontIncreaseBtn";
			var lpChatID_lpChatSurveyQuestionNum = "lpSurveyTotalQuestNum"; //no of questions
			var lpChatID_lpChatSurveyId = "lpSurveyID"; // survey id
			var lpChatID_lpChatSurveyQuestionsContainer = "lpSurveyQuestionsContainer"; //survey questions container
			var lpChatID_lpChatMainMessageSection = "lpChatMainMessageSection";
			var lpChatClass_lpChatSystemMessageSection = ".lpSystemMessageDiv" ;
			var lpChatID_lpChatSlideOutContainer = "lpChatSlideOutContainer";
			var lpChatClass_lpChatSurveySectionText = ".lpChatSurveySectionText" ;
			var lpChatID_lpPreChatMessagesSection = "lpPreChatMessagesSection";
			var lpChatID_lpChatAudioButton = "lpChatMenuItemAudioBtn";
			
			/***************** PRIVATE METHODS **************************/
			
			//use to reset all variable to default
			function resetAll(){
				logger.debug("Resetting all variables");
				isAudioOn = true;
				lpChatFontSize = 13;
				chatWinCloseable = true;
				lpInteractiveChat = false;
				lpVisitorTypingMsg = false;
			 	offlineSurveyNameOverride = "";
				preChatSurveyNameOverride = "";
				exitSurveyNameOverride = "";
				screenState = '';
				windowState = windowStateType.READY;
				chatInstanceReady = false;
				collaborationInstanceReady=false;
			}
			
			//delete API instances
			function deleteAPI_instance(){
				collaborationApi = null;
				chat = null;
				delete collaborationApi;
				delete chat;
			}
			
			function jqe(pElem) {
				return "#" + pElem;
			}
			
			function getTargetForParenChatFrame(){
				var parentURL = (window.location != window.parent.location) ? document.referrer : document.location.href;
				return parentURL.indexOf('https') > -1 ? 'https://' + parentURL.substr(8).split('/')[0] : 'http://'
						+ parentURL.substr(7).split('/')[0];
			}

			// remove leading/trailing spaces
			function getTrimmedValue(inputId, clearValue) {
				var elementVal = $.trim($(jqe(inputId)).val());
				if (clearValue)
					$(jqe(inputId)).val("");
				return elementVal;
			}
			
			// hide the ChatWizContainer (on the parent page)
			function hideChatWizContainer() {
				sendPostMessage({"lpEmbChatWiz": "LPNVPF", "CMD" : "CONTROL", "value" : "HIDE_CONTAINER"});
			}

			// show the ChatWizContainer (on the parent page)
			function showChatWizContainer() {
				logger.debug("showChatWizContainer");
				sendPostMessage({"lpEmbChatWiz": "LPNVPF", "CMD" : "CONTROL", "value" : "SHOW_CONTAINER"});
			}

			//when chat is over, unbind all events
			function chatOverHandler(){
				logger.debug("chatOverHandler");
				if(chat){
					try{
						chat.unbind("onLoad", null, chatOnloadEvent);	
						chat.unbind("onInit", null, chatOnInitEvent);
						chat.unbind("onInfo", null, onInfoEvent);	
						chat.unbind("onLine", null, addLines);	
						chat.unbind("onState", null, updateChatState);	
						chat.unbind("onStart", null, onStartEvent);
						chat.unbind("onAgentTyping", null, agentTyping);
						chat.unbind("onExitSurvey", null, onExitSurveyEvent);
						chat.unbind("onPreChatSurvey", null, onPreChatSurveyEvent);
						chat.unbind("onVisitorDisposed", null, onVisitorDisposedEvent);
						chat.unbind("onRequestChat", null, onRequestChatEvent);				
						chat.unbind("onStop", null, stopCollaborationSession);	
						logger.debug("chatOverHandler unbind successfully");
					}catch(excp){
						logger.debug("chatOverHandler exception found: "+excp);
					}
				}
			}
			
			// update the chat State
			function updateChatState(data) {
				logger.debug("updateChatState", data);
				
				if(windowState != windowStateType.DESTRUCTION){
					var previousChatState = chatState;
					chatState = data.state;
					
					if(data.state && previousChatState != data.state){
						//update a new State
						sessionMgr.setChatState(data.state);
					}
					
					if (chatState == chat.chatStates.CHATTING) {
						screenState = screenStateType.CHATTING;
						chatWinCloseable = false;
						bindChatInputTextFieldEvent();
						bindAllButtonEvents();
						showChatWizContainer();
					} else if (chatState == chat.chatStates.ENDED) {
						endChatHandler();
					} else if (chatState == chat.chatStates.RESUMING) {
						lpChatShowView(lpCWAssist.lpChatMakeMessageSection(isAudioOn), true);
						showChatWizContainer();
						chatWinCloseable = false;
					}else if (chatState == chat.chatStates.NOTFOUND) {
						logger.debug("updateChatState screenState ", screenState);
						
						if(screenState == screenStateType.CHATTING){
							//show message in chat that chat session has ended
							addInfoMessageToChatMessages(lpCWTagConst.lpMsg_ChatSessionEnded);
							chatWinCloseable = true; //allow window to close
						}else if(screenState == screenStateType.PRECHATSURVEY || screenState == screenStateType.EXITSURVEY){
							//do nothing, will handle at the submit event
						}else{
							logger.debug("updateChatState unexpected state");
							chatOverHandler();
							endChatHandler();
						}
					}
				}else{
					logger.debug("updateChatState skip as widget currently in ", windowStateType.DESTRUCTION);
				}
			}

			// show the agent typing
			function agentTyping(data) {
				logger.debug("agentTyping", data);
				if (data.agentTyping) {
					$(jqe(lpChatID_lpChatAgentType)).css("visibility","visible");
				} else {
					$(jqe(lpChatID_lpChatAgentType)).css("visibility", "hidden");
				}

			}

			// Get formatted time with AM/PM
			function getFormattedTime(dateTimeString) {
				var date = new Date(dateTimeString);
				var hours = date.getHours();
				var minutes = date.getMinutes();
				var ampm = hours >= 12 ? 'PM' : 'AM';
				hours = hours % 12;
				hours = hours ? hours : 12;
				minutes = minutes < 10 ? '0' + minutes : minutes;
				var strTime = hours + ':' + minutes + ' ' + ampm;
				return strTime;
			}

			// create a chat line HTML for Info/Agent/Visitor
			function createLine(line) {
				var newFormattedChatLine = "";
				
				if (line.source == 'system') {
					var text = line.text;
					if (text.indexOf("You are now chatting with") > -1) {
						text = "<div style='padding:5px 0;font-weight:bold;'>"
								+ text + "</div>"
					}
					newFormattedChatLine = "<div class='lpChatInfoText'>"
							+ text + "</div>";
				} else if (line.source == 'visitor') {
					newFormattedChatLine = lpCWAssist.lpChatMakeRightSideMessage("You", line.text, lpChatFontSize);
				} else if (line.source == 'agent') {
					newFormattedChatLine = lpCWAssist.lpChatMakeLeftSideMessage(line.by, line.text, lpChatFontSize);
				}

				return newFormattedChatLine;
			}

			// add ChatLine to MessageSection DOM
			function addLineToDom(line, pPlaysound) {
				$(jqe(lpChatID_lpChatMessagesSection)).append(line);
				if (pPlaysound)
					playAudio();
			}

			// scroll to bottom of the MessageSection DOM if scrolling existing
			function scrollToBottom() {
				logger.debug("scrollToBottom");
				if($(jqe(lpChatID_lpChatMessagesSection)).length){
					$(jqe(lpChatID_lpChatMessagesSection))
						.animate( { scrollTop : $(jqe(lpChatID_lpChatMessagesSection))[0].scrollHeight }, 1000);
				}
			}

			// add a line data to Chat Content DIV
			function addLines(data) {
				logger.debug("addLines", data);
				var linesAdded = false;
				if(typeof data.lines != "undefined"){
					for (var i = 0; i < data.lines.length; i++) {
						var line = data.lines[i];
						
						if(line.source == 'visitor' && !lpInteractiveChat){
							lpInteractiveChat = true; 
						}
						
						if (line.source != 'visitor' || chatState != chat.chatStates.CHATTING) {
							var chatLine = createLine(line);
							if (line.source == 'system') {
								var $lpSystemMessageDiv = $(lpChatClass_lpChatSystemMessageSection + ":last");
								if(!$(lpChatClass_lpChatSystemMessageSection).is(":last-child")){
									$(jqe(lpChatID_lpChatMessagesSection)).append('<div class="lpSystemMessageDiv"></div>');
									$lpSystemMessageDiv = $(lpChatClass_lpChatSystemMessageSection + ":last");
								}
								$lpSystemMessageDiv.append(chatLine);
							} else {
								addLineToDom(chatLine, true);
							}
							linesAdded = true;
						}
						
					}
					if (linesAdded) {
						scrollToBottom(); 
						lpChatWinNotifyFlashingStart(); 
					}
				}
			}

			/**
			 * Detecting if there is any matching credit card pattern
			 */
			function ccMasking(strText){
				var maskingChar = "****************";
				var ccPattern1 = /[0-9]{13,16}/;
				var ccPattern2 = /[0-9]{4}[\-\x20\.][0-9]{4}[\-\x20\.][0-9]{4}[\-\x20\.][0-9]{4}/;
				var ccPattern3 = /[0-9]{4}[\-\x20\.][0-9]{6}[\-\x20\.][0-9]{5}/;
				var ccPattern4 = /[0-9]{3}[\-\x20\.][0-9]{4}[\-\x20\.][0-9]{4}[\-\x20\.][0-9]{2}/;
				var ccPattern5 = /[0-9]{4}[\-\x20\.][0-9]{4}[\-\x20\.][0-9]{3}[\-\x20\.][0-9]{2}/;
				return !lpCWTagConst.CC_MASKING_ENABLE?strText:strText.replace(ccPattern1, maskingChar)
											.replace(ccPattern2, maskingChar)
											.replace(ccPattern3, maskingChar)
											.replace(ccPattern4, maskingChar)
											.replace(ccPattern5, maskingChar);
			}
			
			//add info message to the chat screen
			function addInfoMessageToChatMessages(infoMsg){
				var infoMsgLine = lpCWAssist.lpChatMakeInfoNotificationMessage("Info", infoMsg, lpChatFontSize)
				$(jqe(lpChatID_lpChatMessagesSection)).append(infoMsgLine);
				scrollToBottom();
			}
			
			// send visitor chat lines
			function sendLine() {
				var text = getTrimmedValue(lpChatID_lpChatInputTextField, true);
				var valABeforeCCMasking = text;
			
				text = ccMasking(text);
				if (text && chat && text != "Type here..."
						&& chatState == chat.chatStates.CHATTING) {
					var line = createLine({
						by : chat.getVisitorName(),
						text : text,
						source : 'visitor',
						time : new Date().toString()
					});

					chat.addLine({
						text : text,
						error : function() {
							line.className = "error";
						}
					});
					if(valABeforeCCMasking != text){
						addInfoMessageToChatMessages(lpCWTagConst.lpMsg_CreditCardPatternDetected_InChat);
					}
					addLineToDom(line, false);
					scrollToBottom();
				}
			}

			// bind the event for visitor to hit 'Enter' key to send chat lines
			function keyChanges(e) {
				e = e || window.event;
				var key = e.keyCode || e.which;
				if (key == 13) {
					if (e.type == "keyup") {
						sendLine();
						setVisitorTyping(false);
					}
					return false;
				} else {
					var text = getTrimmedValue(lpChatID_lpChatInputTextField, false);
					if(!lpVisitorTypingMsg && text != ""){
						setVisitorTyping(true);
					} else if(lpVisitorTypingMsg && text == ""){
						setVisitorTyping(false);
					}
					
				}
			}

			// send line to chat server and stop broadcasting visitor is typing... 
			function sendChatBtn() {
				sendLine();
				setVisitorTyping(false);
			}
			
			// broadcast to agent console that visitor is typing...
			function setVisitorTyping(typing) {
				if (chat && chatState == chat.chatStates.CHATTING) {
					logger.debug("visitor is typing");
					chat.setVisitorTyping({typing : typing});
					lpVisitorTypingMsg = typing?true:false;
				}
			}

			/*
			 * indicates if this is an interative chat. 
			 */
			function isInterativeChat(){
				return lpInteractiveChat ? true: false;
			}
			
			function onStartEvent(data){
				logger.debug("onStart", data);
			}
			
			/**
			 * create chat API instances
			 */
			function createChatInstance() {
				logger.debug("createChatInstance");
				logger.debug("Starting lpChatAccountNumber: "+lpCWTagConst.lpChatAccountNumber +", lpChatAppKey: "+ lpCWTagConst.lpChatAppKey);
				
				if (lpCWTagConst.lpChatAccountNumber && lpCWTagConst.lpChatAppKey) {
					if (!chat) {
						try {
							
							var chatInstanceParam = {
								lpNumber : lpCWTagConst.lpChatAccountNumber,
								appKey : lpCWTagConst.lpChatAppKey,
								domain : lpCWTagConst.domain,
								sessionUID: lpSUID,
								onLoad : chatOnloadEvent, 
								onInit : chatOnInitEvent,
								onInfo : onInfoEvent,
								onLine : addLines,
								onState : updateChatState,
								onStart : onStartEvent,
								onStop : stopCollaborationSession,
								onAgentTyping : agentTyping,
								onExitSurvey : onExitSurveyEvent,
								onPreChatSurvey : onPreChatSurveyEvent,
								onSubmitExitSurvey : onSubmitExitSurveyEvent,
								onVisitorDisposed : onVisitorDisposedEvent,
								onRequestChat : onRequestChatEvent,
								context: myChatWiz
								 };
							logger.debug("createChatInstance param", chatInstanceParam);	 
							chat = new lpTag.taglets.ChatOverRestAPI(chatInstanceParam);
								
						} catch (exc) {
							logger.debug("ERROR", "Failed to create ChatOverRestAPI instance! " + exc);
							return;
						}

					}
				}
			}
			
			function onVisitorDisposedEvent(data){
				logger.debug("onVisitorDisposed", data);
			}
			
			function onSubmitExitSurveyEvent(data){
				logger.debug("onSubmitExitSurvey", data);
			}
			
			function onPreChatSurveyEvent(data){
				logger.debug("onPreChatSurvey", data);
			}
			
			function onExitSurveyEvent (data){
				logger.debug("onExitSurvey", data);
			}
			
			function onInfoEvent(data){
				logger.debug("onInfo", data); 
				//defect N-58. Itai's suggestion
				if(data.error){
					notificationDialog.open(lpCWTagConst.lpMsg_OnInfoEventErrorMsg, true);
				}
			}
			
			function chatOnloadEvent(data){
				logger.debug("onLoad", data);
				chatState = data.state; //update chat state - to handle the lpChatSkill = "offline"
			}
			
			function sendPostMessageChatInActive(){
				sendPostMessage({"lpEmbChatWiz": "LPNVPF", "CMD" : "CONTROL", "value" : "CHAT_STATE_INACTIVE"});
			}
			
			/**
			 * when chat api is in initialized state, execute per logic below
			 */
			function chatOnInitEvent(data){
				logger.debug("onInit", data); 
				
				chatInstanceReady = true; //mark chat instance initialized
				if(windowState == windowStateType.DESTRUCTION){
					cleanupPreviousSession();
				}else{
					if(data.init){
						//indicate chat started
						sendPostMessage({"lpEmbChatWiz": "LPNVPF", "CMD" : "CONTROL", "value" : "CHAT_STATE_ACTIVE"});
					}
					
					if(chatState == "uninitialised" && data.init && sessionMgr.getChatState()==""){
						//handle on the start button clicked & chat instance is ready
						if(skill=="offline"){
							if(offlineSurveyNameOverride == ""){
								//present offline page if skill is defaulted to 'offline'
								showOfflineScreenBySkill(skill);
							}else if(offlineSurveyNameOverride != ""){
								//if there is an override in offlineSurveyNameOverride, display offline by SurveyName
								showOfflineScreenBySurveyName(offlineSurveyNameOverride);
							}
						}else{
							if(!webserviceEnable){
								checkAgentAvailability(); // proceed to
							} 
						}
						//dont do anything if webserviceEnable=true because timer in loadWebServiceChat() is still running and it will make decision there
					}
				}
			}

			/**
			 * cleanup the abandoned session
			 */
			function cleanupPreviousSession(){
				logger.debug("cleanupPreviousSession", "...");
				logger.debug("cleanupPreviousSession", "chatInstanceReady="+chatInstanceReady
												+ " collaborationInstanceReady="+collaborationInstanceReady
												+ " windowState = " + windowState);
				if(windowState == windowStateType.DESTRUCTION){
					if(chatInstanceReady && collaborationInstanceReady){
						logger.debug("cleanupPreviousSession start to clean previous session", "...");
						if(collaborationApi)
							collaborationApi.stopSession();
						if(chat)
							chat.disposeVisitor();
						chatOverHandler();
						deleteAPI_instance();
						sessionMgr.stop();
						resetAll();
						logger.debug("cleanupPreviousSession complete cleaning previous session", "...");
					}
				}else{
					logger.debug("cleanupPreviousSession not ready to clean up previous session", "...");
				}
			}
			
			/**
			 * start collaboration session
			 */
			function startSession() {
				var req = {
						 error: function(data) { showAPICallFailure(data, lpCWTagConst.lpMsg_APICallFailure) }
					};
					
				if (visitorId) {
					req.visitorId = visitorId;
				}
				
				if(lpVisitorSessionId)
					req.rtSessionId = lpVisitorSessionId;
				
				logger.debug("startSession reqParam", req);
				var failedRequest = collaborationApi.createSession(req);
				if(failedRequest && failedRequest.error){  
				    logger.debug("Collab startSession error", failedRequest.error); 
				    showAPICallFailure(failedRequest, lpCWTagConst.lpMsg_APICallFailure); 
				}  			
			}

			/**
			 * stop collaboration session
			 */
			function stopCollaborationSession() {
				logger.debug("stopSession", "....");
				if(collaborationApi){
					var failedRequest = collaborationApi.stopSession();
					if(failedRequest && failedRequest.error){  
						logger.debug("Collab stopSession error", failedRequest.error); 
					} 
					logger.debug("stopSession", " successfully");
				}
			}
			
			/**
			 * Add PCI form to the slide out widget
			 */
			function addPCIDataToSlideOut(PCIData) {
				PCIData.frame.style.height = "100%";
				PCIData.frame.style.width = "100%";
				PCIData.frame.frameBorder = 0;
				PCIData.frame.scrolling = "yes";

				$(jqe(lpChatID_lpChatSlideOutContainer)).empty();
				$(jqe(lpChatID_lpChatSlideOutContainer)).html(PCIData.frame);
			}
			
			/**
			 * when PCI form is arrived, slideout the widget and display form
			 */
			function onPCIFormArrivedSlideOut(PCIData) {
				logger.debug("onPCIFormArrived", "...");
				
				if(windowState != windowStateType.DESTRUCTION){
					if (typeof PCIData != "undefined" && PCIData.frame) {
						logger.debug("onPCIFormArrived", " sliding out container...");
						
						//if already slide out, just show. Otherwise, update with  new data and show it
						lpChatWinNotifyFlashingStart();
						if ($(jqe(lpChatID_lpChatSlideOutContainer)).length) { //exist
							logger.debug("onPCIFormArrived", "previous PCI already displayed");
							addPCIDataToSlideOut(PCIData);
							$(jqe(lpChatID_lpChatSlideOutContainer)).show();
							
						} else { //not exist
							logger.debug("onPCIFormArrived", "no previous PCI displayed found");
							sendPostMessage({"lpEmbChatWiz": "LPNVPF", "CMD" : "CONTROL", "value" : "UPDATE_DRAG_AREA_SHOW_PCI"});
							$(jqe(lpChatID_lpChatWizFrameContainer)).prepend('<div id="lpChatSlideOutContainer" style="display:none"></div>');
							
							$(jqe(lpChatID_lpChatSlideOutContainer)).toggle("slide", {
								direction : "right"
							}, 1000, function() {
								addPCIDataToSlideOut(PCIData);
							});
						}
					}
				}else{
					debug("onPCIFormArrived skip",  windowStateType.DESTRUCTION);	
				}
			}
			
			/**
			 * when PCI form is submitted and confirmed, slidein the widget
			 */
			function onPCIFormSubmittedSlideOut(submittedData) {
				logger.debug("onPCIFormSubmitted", "");
				
				if (submittedData && submittedData.frame) {
					//addInfoMessageToChatMessages(lpCWTagConst.lpMsg_PCIFormSubmitted);		 
					// slide in and clear the form 
					$(jqe(lpChatID_lpChatSlideOutContainer)).empty();
					submittedData.frame = null;
					submittedData = null;
						
          if(lpCWAssist.isIE10n11()){  
          	//handle the scenario where in IE10 & IE11 the chat textarea froze after pci form submit. It appears IE requires user to double click behavior
          	// and for some reason, only select() would reenable the textarea     
	          var taObj = document.getElementById(lpChatID_lpChatInputTextField );
	          var textLen = taObj.value.length;
	          taObj.readOnly = false;
						taObj.select();
						taObj.focus();
						taObj.setSelectionRange(textLen, textLen);
					}
					
					$(jqe(lpChatID_lpChatSlideOutContainer)).toggle("slide", {
						direction : "right"
					}, 1000, function() {
						closeSlideOut();
					});
				}
			}
			
			/**
			 * Handle when chat request failure
			 */
			function establishRequestChatFailure(){
				chatWinCloseable = true;
				if(offlineSurveyNameOverride != "")
						checkOfflineBySurveyName(offlineSurveyNameOverride);
					else
						checkOfflineBySkill(skill);
			}
			
			// Establish requestChat from the API
			function establishRequestChat(surveyResult) {
				logger.debug("establishRequestChat with surveyResults", surveyResult);
				if (chat) {
					//preChatLines : lpCWTagConst.customPreChatLines,
					var chatRequest = {
						success : function(data) {
									isAudioOn = true;
									startSession();
								} ,
						error : function(data){
								logger.debug("checkForPreChatSurvey.error", data);
								establishRequestChatFailure();
							},
						context: myChatWiz
					};
					
					if(typeof surveyResult != "undefined" && surveyResult != null && surveyResult.question && surveyResult.question.length > 0)
						chatRequest.survey = surveyResult;
						
					chatRequest.skill = skill;
					//chatRequest.buttonName = lpChatWizButtonName;
					chatRequest.chatReferrer = lpChatWizButtonName;
					chatRequest.visitorSessionId = lpVisitorSessionId;
					chatRequest.siteContainer = lpSiteContainer;
					chatRequest.runWithRules = true;
					//chatRequest.invitation = true;  /* this flag have to be added to the chat request to highlight that this is a chat request based on the inivtation */
					
					// add this for Collaboration Getting the visitorId if we have one
					if (visitorId) {
						chatRequest.visitorId = visitorId;
					}

					logger.debug("chatRequest parameters: ", chatRequest);
					chatWinCloseable = false; //not allow to close
					var failedRequest = chat.requestChat(chatRequest);
					
					sessionMgr.start();
					
					if (failedRequest && failedRequest.error) {
						logger.debug("checkForPreChatSurvey.error2", failedRequest);
						establishRequestChatFailure();
					}
				}
				
			}
			
			/* check the chatRequest's respose to ensure agent availability */
			function onRequestChatEvent(respData){
				logger.debug("onRequestChatEvent", respData);
				setGlobalVisitorId(respData);
				if(typeof respData != "undefined" && typeof respData.error != "undefined" 
					&& typeof respData.error.reason != "undefined" && respData.error.reason=="no-available-agents"){
						if(offlineSurveyNameOverride != ""){
							showOfflineScreenBySurveyName(offlineSurveyNameOverride);
						}else{
							showOfflineScreenBySkill(skill);
						}
				}
				
			}
			
			/* notify parent to hide container, reset all variables */
			function disposeEndChat(){
				logger.info("dispose end chat", "...");
				sendPostMessage({"lpEmbChatWiz": "LPNVPF", "CMD" : "CONTROL", "value" : "END_CHAT"}); //notify parent to end chat
				lpChatShowView("", true);
				chatOverHandler();
				deleteAPI_instance();
				resetAll();
			}
			
			
			/* will close the PCI Slide out if already exists */
			function closeSlideOut(){
				//$(jqe(lpChatID_lpChatSlideOutContainer)).remove();
				sendPostMessage({"lpEmbChatWiz": "LPNVPF", "CMD" : "CONTROL", "value" : "UPDATE_DRAG_AREA_HIDE_PCI"}); //notify parent to increase drag area
				$(jqe(lpChatID_lpChatSlideOutContainer)).remove();
			}
			
			/* event handler for close button in footer click */
			function lpChatCloseChatBtnClick() {		
				logger.debug("lpChatCloseChatBtnClick", "...chatWinCloseable="+chatWinCloseable);
				
				if(typeof webserviceTimer != "undefined")
					clearInterval(webserviceTimer);
				
				//close the PCI if visible
				closeSlideOut();
				
				if(chatWinCloseable){
					//case when not in chat
					sessionMgr.deleteChatSessionStorage();
					disposeEndChat();
				}else{
					//case when in chat
					if(chatState == chat.chatStates.WAITING){
						chatWinCloseable = true;
						lpChatShowView("", true); //clear screen
						hideChatWizContainer();
					}
					
					endChat();
				}
			}

			/**
			 * invoke to handle end chat and set to do cleanup the abandon session
			 */
			function endChatHandlerSelfDestruction(){
				logger.debug("endChatHandlerSelfDestruction", "...");
				lpChatShowView("", true);
				if(collaborationApi)
					collaborationApi.stopSession();
				if(chat)
					chat.disposeVisitor();
				chatOverHandler();
				deleteAPI_instance();
				sessionMgr.stop();
				resetAll();
			}
			
			/* API will send the event for end-chat and this method will invoke */
			function endChatHandler(){
				logger.debug("endChatHandler", "...");
				sendPostMessageChatInActive();
				sessionMgr.stop();
				
				//close the PCI if visible
				closeSlideOut();
				
				if(chatWinCloseable){
					disposeEndChat();
				}else{
					checkForPostChatSurvey();
				}
				
				if(collaborationApi)
					collaborationApi.stopSession();
				if(chat)
					chat.disposeVisitor();
			}
			
			/* end current chat session */
			function endChat() {
				logger.debug("endChat", "...chatState="+chatState);
				
				if (chat && (chatState == chat.chatStates.CHATTING || chatState == chat.chatStates.RESUMING 
					|| chatState == chat.chatStates.WAITING)) { //|| chatState == chat.chatStates.NOTFOUND
					
					var endChatParam = {
								disposeVisitor : true,
								context : myChatWiz,
								skill : skill,
								error: function(data) {
									logger.debug("endChat.error", data);
									chatWinCloseable = true;
									endChatHandler();	
								}
							}
					/* send endChat request and waiting for endChat event call back */
					var failedRequest = chat.endChat(endChatParam);
							
					if (failedRequest && failedRequest.error) {
						logger.debug("endChat.error2", failedRequest);
						chatWinCloseable = true;
						endChatHandler();	
					}
				}else if(chatState == chat.chatStates.INITIALISED){
					endChatHandler();
				}
				
			}

			/* increase font size button click handler */
			function increaseFontSize() {
				lpChatFontSize = (lpChatFontSize == LP_CHAT_FONT_SIZE_MAX) ? LP_CHAT_FONT_SIZE_MAX
						: (2 + lpChatFontSize);
				changeFontSize();
			}

			/* decrease font size button click handler */
			function decreaseFontSize() {
				lpChatFontSize = (lpChatFontSize == LP_CHAT_FONT_SIZE_MIN) ? LP_CHAT_FONT_SIZE_MIN
						: (lpChatFontSize - 2);
				changeFontSize();
			}    

			/* update font size in chat window */
			function changeFontSize() {
				var newFontSize = lpChatFontSize + "px";
				sessionMgr.setFontSize(lpChatFontSize);
				$("div.lpChatMsg").css("font-size", newFontSize); //$("lpChatMsg").css("font-size", newFontSize);
			}

			/* Toggle sound button click handler */
			function changeAudioSetting() {
				logger.debug("changeAudioSetting", isAudioOn);
				isAudioOn = isAudioOn ? false : true;
				sessionMgr.setAudio(isAudioOn);
				if (isAudioOn) {
					$(".sprite-font-sound-off").addClass("sprite-font-sound-on").removeClass("sprite-font-sound-off")
					$(jqe(lpChatID_lpChatAudioButton)).attr('data-msg', lpCWTagConst.lpTxt_TurnOffSound);
				} else {
					$(".sprite-font-sound-on").addClass("sprite-font-sound-off").removeClass("sprite-font-sound-on")
					$(jqe(lpChatID_lpChatAudioButton)).attr('data-msg', lpCWTagConst.lpTxt_TurnOnSound);
				}
			}

			/* check & play audio */
			function playAudio() {
				if (isAudioOn) {
					try {
						isHTML5 = typeof document.createElement("audio").play == "undefined" ? false
								: true;
						// jQuery('<audio>').attr('src', 'http://file.ogg');
						myBeepAudio = new Audio('sound/incomingMessage.mp3');
						myBeepAudio.play();
					} catch (ex) {
						isHTML5 = false;
					}

					try {
						isIE = navigator.userAgent.toLowerCase()
								.indexOf("msie") > -1 ? true : false;
					} catch (ex) {
						isIE = false;
					}
				}
			}
	
			/**
			 * Generic function to register for event
			 */
			function registerEventHandler(pElementId, pEventType, pHandler){
				logger.debug("registerEventHandler", pElementId + " " + pEventType);
				try{
					$(jqe(pElementId)).on(pEventType, pHandler);
				}	catch(excp){
					logger.debug("Exception in registerEventHandler elementID="+pElementId+", EventType="
						+pEventType +" & error message", excp);
				}
			}
			
			/**
			 * Generic function to unregister for event
			 */
			function unregisterEventHandler(pElementId, pEventType, pHandler){
				logger.debug("unregisterEventHandler", pElementId + " " + pEventType);
				try{
					$(jqe(pElementId)).off(pEventType, pHandler);
				}	catch(excp){
					logger.debug("Exception in unregisterEventHandler elementID="+pElementId+", EventType="
						+pEventType +" & error message", excp);
				}
			}
			
			/**
			 * bind chat input text field event so when user hit 'Enter' it will send chat messages
			 */
			function bindChatInputTextFieldEvent(){
				if ($(jqe(lpChatID_lpChatInputTextField)).attr("disabled") != "undefined") {
					$(jqe(lpChatID_lpChatInputTextField)).removeAttr('disabled');
				}
				
				if ($(jqe(lpChatID_lpChatInputTextField)).attr("onKeyup") != "undefined") {
					unregisterEventHandler(lpChatID_lpChatInputTextField, "keyup", keyChanges);
					registerEventHandler(lpChatID_lpChatInputTextField, "keyup", keyChanges);
				}
				
			}
			
			/**
			 * bind close chat event
			 */
			function bindCloseButtonEvent(){
				try{
					logger.debug("bindCloseButtonEvent", "remove existing events");
					unregisterEventHandler(lpChatID_lpChatCloseChatBtn, "click", lpChatCloseChatBtnClick);
					registerEventHandler(lpChatID_lpChatCloseChatBtn, "click", lpChatCloseChatBtnClick);
					
					if(!lpCWAssist.isPostMessageSupported()){
						logger.debug("bindCloseButtonEvent", "remove existing events");
						$(jqe(lpChatID_lpChatCloseChatBtn)).hide();
					}
				}catch(excp){
					logger.debug("Exception in bindCloseButtonEvent, error message", excp);
				}
			}
			
			
			/**
			 * bind all buttons event within embedded window
			 */
			function bindAllButtonEvents() {
				logger.debug("bindAllButtonEvents", "binding...");
				
				bindCloseButtonEvent();
				unregisterEventHandler(lpChatID_lpChatMenuItemFontDecreaseBtn, "click", decreaseFontSize);
				unregisterEventHandler(lpChatID_lpChatMenuItemFontIncreaseBtn, "click", increaseFontSize);
				unregisterEventHandler(lpChatID_lpChatAudioButton, "click", changeAudioSetting);
				unregisterEventHandler(lpChatID_lpChatSendChatBtn, "click", sendChatBtn);
				
				registerEventHandler(lpChatID_lpChatMenuItemFontDecreaseBtn, "click", decreaseFontSize);
				registerEventHandler(lpChatID_lpChatMenuItemFontIncreaseBtn, "click", increaseFontSize);
				registerEventHandler(lpChatID_lpChatAudioButton, "click", changeAudioSetting);
				registerEventHandler(lpChatID_lpChatSendChatBtn, "click", sendChatBtn);

				$(".lpHoverButton").on("mouseover",
						function() {
							$("body").append( lpCWAssist.lpMakeHoverDiv($(this).attr("data-msg")));
							var top = $(this).offset().top + $(this).height();
							var left = $(this).offset().left - ($(".lpHoverDiv").width() / 2) + ($(this).width() / 2);
							if (left <= 0) {
								var arrowShift = left;
								left = 0;
								$(".lpHoverDiv .lpArrowUp").css({left : arrowShift });
							}
							$(".lpHoverDiv").css({ top : top, left : left });
						}).on("mouseout", function() { $(".lpHoverDiv").remove(); });
			}

			/**
			 * When API call failure for any reason, display offline message
			 */
			function showAPICallFailure(data, msg){
				logger.debug("showAPICallFailure", data);
				lpChatShowView(lpCWAssist.lpChatMakeOfflineScreenHtml(msg), true);
				showChatWizContainer();
			}
			
			/**
			 * When API call failure for any reason, display offline message in a notification
			 */
			function showAPICallFailureInPopup(data, msg){
				logger.debug("showAPICallFailureInPopup", data);
				notificationDialog.open(msg, true);
			}

			/**
			 * show offline by survey name
			 */
			function showOfflineScreenBySurveyName(pSurveyName){
				checkOfflineBySurveyName(pSurveyName);
			}
			
			/**
			 * show offline by skill id
			 */
			function showOfflineScreenBySkill(pSkill){
				checkOfflineBySkill(pSkill);
			}
			
			/**
			 * make API call to retrieve offline by skill
			 */
			function checkOfflineBySkill(pSkill){
				var offlineRequestParam = {
					skill : pSkill,
					success : myChatWiz.showOverrideOfflineScreen,
					error : function(data) { showAPICallFailure(data, lpCWTagConst.lpMsg_APICallFailure) },
					context : myChatWiz
				}
				
				logger.debug("checkOfflineBySkill", "requeParam="+pSkill);
				var failedRequest = chat.getOfflineSurvey(offlineRequestParam);
				if (failedRequest && failedRequest.error) {
					showAPICallFailure(failedRequest, lpCWTagConst.lpMsg_APICallFailure);
				}
			}
			
			/**
			 * make API call to retrieve offline by survey name
			 */
			function checkOfflineBySurveyName(pSurveyName){
				logger.debug("checkOfflineBySurveyName", "surveyName="+pSurveyName);
				var failedRequest = chat.getOfflineSurvey({
					surveyName : pSurveyName,
					success : myChatWiz.showOverrideOfflineScreen,
					error : function(data) { showAPICallFailure(data, lpCWTagConst.lpMsg_APICallFailure)  },
					context : myChatWiz
				});
				
				if (failedRequest && failedRequest.error) {
					showAPICallFailure(failedRequest, lpCWTagConst.lpMsg_APICallFailure);
				}
			}
			
			/**
			 * make API call to retrieve exit survey
			 */
			function checkForPostChatSurvey() {
				var exitChatSurveyParam = {
					success : myChatWiz.showPostChatSurvey,
					error : myChatWiz.noPostChatSurvey,
					context : myChatWiz
				};
				
				if (isInterativeChat()){
					if(exitSurveyNameOverride != ""){
						exitChatSurveyParam.surveyName = exitSurveyNameOverride;
					}else{
						exitChatSurveyParam.skill = skill;
					}
				}else{
					exitChatSurveyParam.surveyName = nonInteractiveChatSurveyNameOverride;
				}
				
				logger.debug("checkForPostChatSurvey param", exitChatSurveyParam);
				
				var failedRequest = "";
				
				if (isInterativeChat()){
					logger.debug("checkForPostChatSurvey", "interactive chat detected");
					failedRequest = chat.getExitSurvey(exitChatSurveyParam);
				}else{
					logger.debug("checkForPostChatSurvey", "none-interative chat detected");
					chatWinCloseable = true; //allow to close chat window
					failedRequest = chat.getExitSurvey(exitChatSurveyParam);
				}
				
				if (failedRequest && failedRequest.error) {
					showAPICallFailure(failedRequest, lpCWTagConst.lpMsg_APICallFailure_Exit);
				}
			}
						
			/**
			 * make API call to retrieve prechat survey
			 */
			function checkForPreChatSurvey() {
				logger.debug("checkForPreChatSurvey", "...");
				var preChatSurveyParam = {
								success : myChatWiz.showPreChatSurvey,
								error : myChatWiz.noPreChatSurvey,
								context : myChatWiz
							};
									
				if(preChatSurveyNameOverride != ""){
					preChatSurveyParam.surveyName = preChatSurveyNameOverride;
				}else{
					preChatSurveyParam.skill = skill;
				}
					
				logger.debug("checkForPreChatSurvey w/ param", preChatSurveyParam);
				
				var failedRequest = chat.getPreChatSurvey(preChatSurveyParam);

				if (failedRequest && failedRequest.error) {
					logger.debug("checkForPreChatSurvey.error", failedRequest);
					if(offlineSurveyNameOverride != "")
							checkOfflineBySurveyName(offlineSurveyNameOverride);
						else
							checkOfflineBySkill(skill);
				}
			}
			
			/**
			 * handle when offline survey submit button is clicked
			 */
			function lpOnOfflineSurveySubmit(data) {
				logger.debug("lpOnOfflineSurveySubmit", "...");
				var question = lpChatGetSurveyAnswers(data);
				var surveyResult = {
					id : getTrimmedValue("lpSurveyID", false),
					question : question
				}
				logger.debug("lpOnOfflineSurveySubmit.surveyResult", surveyResult);
				var submitSurveySuccess = function(result) { disposeEndChat();}
				var chatRequest = {
					survey : surveyResult,
					success : submitSurveySuccess,
					error: function(data) { showAPICallFailureInPopup(data, lpCWTagConst.lpMsg_APICallFailure_SubmitSurvey) }
				};
				var failedRequest = chat.submitOfflineSurvey(chatRequest);
				if (failedRequest.error) {
					showAPICallFailureInPopup(failedRequest, lpCWTagConst.lpMsg_APICallFailure_SubmitSurvey);
				}
			}
			
			/* start chat after submitting pre chat */
			function lpOnPreChatSurveySubmit(data) {
				logger.debug("lpOnPreChatSurveySubmit", data);
				if(chatState == chat.chatStates.NOTFOUND && screenState == screenStateType.PRECHATSURVEY){
					logger.debug("lpOnPreChatSurveySubmit", "with NOT FOUND status");
					if(offlineSurveyNameOverride != "")
						checkOfflineBySurveyName(offlineSurveyNameOverride);
					else
						checkOfflineBySkill(skill);
				}else{
					var question = lpChatGetSurveyAnswers(data);
					var surveyResult = {
							id : getTrimmedValue("lpSurveyID", false),
							question : question
						};
					logger.debug("lpOnPreChatSurveySubmit surveyResult", surveyResult);
					$(jqe(lpChatID_lpPreChatMessagesSection)).hide();
					$(jqe(lpChatID_lpPreChatMessagesSection)).remove();
					
					lpPrepareChat(surveyResult);
				}
			}


			/* fetch answeres to all questions */
			function lpChatGetSurveyAnswers(data) {
				logger.debug("lpChatGetSurveyAnswers", "...");
				var question = new Array();
				var activeQuestionTemp = new Array();
				var index = 0;
				if (data.survey && data.survey.questions && data.survey.questions.question && data.survey.questions.question.length > 0) {
					for (var i = 0; i < data.survey.questions.question.length; i++) {
						var thisQuestion = data.survey.questions.question[i];
						var chatSurveySectionQDiv = "#lpChatSurveySectionQ" + thisQuestion.order;	
						if($(chatSurveySectionQDiv).is(":visible")){
							activeQuestionTemp.push(thisQuestion.id);
							var id = "#lpSurveyQuestionAns" + thisQuestion.order ;
							if ($(id).length) {
								question[index++] = {
									id : thisQuestion.id,
									answer : lpChatGetAnswer(thisQuestion, thisQuestion.order)
								};
							}
						}
					}
				}
				logger.debug("Active Questions ID List Answered", activeQuestionTemp);
				return question;
			}

			/* load chat window */
			function lpPrepareChat(surveyResult) {
				logger.debug("lpPrepareChat", "....")
				lpChatShowView(lpCWAssist.lpChatMakeMessageSection(isAudioOn));
				
				logger.debug("lpOnPreChatSurveySubmit.surveyResult", surveyResult);
				/* if there is survey, show below only after survey is submitted */
				//createCollaborationInstance();
				establishRequestChat(surveyResult);
				bindAllButtonEvents();
			}

			/**
			 * handle when exit survey submit button is clicked
			 */
			function lpPostChatSurveySubmit(data) {
				logger.debug("lpPostChatSurveySubmit", "....");
				var question = lpChatGetSurveyAnswers(data);

				if(chatState == chat.chatStates.NOTFOUND && screenState == screenStateType.EXITSURVEY){
					logger.debug("lpPostChatSurveySubmit", "with NOT FOUND state");
					disposeEndChat();
				}else{
					var surveyResult = {
						id : getTrimmedValue("lpSurveyID", false),
						question : question
					}
					
					//logger.debug("lpPostChatSurveySubmit.surveyResult", surveyResult);
					var submitSurveySuccess = function(result) {
						disposeEndChat();
					}
					
					var exitSurveyParam = {
						skill : skill,
						survey : surveyResult,
						context : myChatWiz,
						success : submitSurveySuccess,
						error: function(data) { showAPICallFailureInPopup(data, lpCWTagConst.lpMsg_APICallFailure_SubmitSurvey) }
					};
					
					exitSurveyParam.visitorSessionId = lpVisitorSessionId;
					
					logger.debug("exitSurvey parameters: ", exitSurveyParam);
					var failedRequest = chat.submitExitSurvey(exitSurveyParam);
					if(failedRequest.error ){
						showAPICallFailureInPopup(failedRequest, lpCWTagConst.lpMsg_APICallFailure_SubmitSurvey);
					}
				}
			}
			
			/**
			 * update visitor id
			 */
			function setGlobalVisitorId(data) {
				logger.debug("setGlobalVisitorId visitorId=", visitorId);
				if (visitorId) {
					logger.debug("setGlobalVisitorId visitorId=", visitorId +" already exist");
					return;
				}
				
				if (data && data.info && data.info.visitorId) {
					visitorId = data.info.visitorId;
					logger.debug("setGlobalVisitorId visitorId[1]",
							data.info.visitorId);
				} else if (data && data.visitorId) {
					visitorId = data.visitorId;
					logger.debug("setGlobalVisitorId visitorId[2]", data.visitorId);
				}
				
				sessionMgr.setVisitorID(visitorId);
				scrollToBottom();
			}
			
			/**
			 * handle when prechat survey submit button is clicked
			 */
			function prechatSurveyBtnClick(data){
				logger.debug("prechatSurveyBtnClick", "submitted");
				if(notificationDialog.isOpen()){
					logger.debug("showPreChatSurvey", "notification is on");
					notificationDialog.close();
				}
				myChatWiz.validateSurvey(data, lpOnPreChatSurveySubmit);
			}
			
			/**
			 * handle when offline survey submit button is clicked
			 */
			function offlineSurveyBtnClick(data){
				logger.debug("offlineSurveyBtnClick", "submitted");
				myChatWiz.validateSurvey(data, lpOnOfflineSurveySubmit);
			}
			
			/**
			 * handle when exit survey submit button is clicked
			 */
			function exitSurveyBtnClick(data){
				logger.debug("exitSurveyBtnClick", "submitted");
				myChatWiz.validateSurvey(data, lpPostChatSurveySubmit); 
			}
			
			/************************** EXPOSURE METHODS  **********************/
			myChatWiz.init = function() {
				logger.debug("initializing...");
				chat = null;
				windowState = windowStateType.READY;
				notificationDialog = new lpCWTag.LPChatWidgetNotification();
				sessionMgr = new lpCWTag.LPChatWidgetSessionManager(window);
			}

			// get the ChatWizContainer element
			myChatWiz.getChatWizContainerElement = function() {
				return window.parent.$(jqe(lpChatID_lpChatWizContainer));
			}

			// get the iFrameElment object on the parent page. Return JS object
			myChatWiz.getiFrameElement = function() {
				return window.parent.$(jqe(lpChatID_lpChatiFrame))[0];
			}

			/*
			 * get the ChatWizContainer element object on the paret page. return
			 * jQuery object
			 */
			myChatWiz.getChatWizFrameContainerElement = function() {
				return window.parent.$(jqe(lpChatID_lpChatWizFrameContainer));
			}

			/**
			 * show offline survey screen
			 */
			myChatWiz.showOverrideOfflineScreen = function(data){
				logger.debug("showOverrideOfflineScreen", data );
				lpChatShowView(lpCWAssist.lpChatMakeOfflineSurveySection(data), true);
				bindCloseButtonEvent();
				if (data.survey.questions != null) {
					// build html survey container
					makeQuestionsHtml(data);
					$(jqe(lpChatID_lpChatSurveyId)).val(data.survey.id);
					$(jqe(lpChatID_lpChatSurveyQuestionNum)).val(data.survey.questions?data.survey.questions.question.length:0);
					
					unregisterEventHandler("lpOfflineSurveySubmitBtn", "click", function() { offlineSurveyBtnClick(data) } );
					registerEventHandler("lpOfflineSurveySubmitBtn", "click", function() {offlineSurveyBtnClick(data) } );
				
				}
				//stop the sessionMgr to stop polling
				sessionMgr.stop();
				showChatWizContainer();
			}

			/**
			 * go straight to estable chat if no prechat survey found
			 */
			myChatWiz.noPreChatSurvey = function() {
				logger.debug("noPreChatSurvey", "...");
				//if no survey, make a new chat request, bind events, and show chat window
				lpChatShowView(lpCWAssist.lpChatMakeMessageSection(isAudioOn), true);
				establishRequestChat(null);
				bindAllButtonEvents();
				showChatWizContainer(); //Kireeti
			}
			
			/* show pre chat survey questions */
			myChatWiz.showPreChatSurvey = function(data) {
				logger.debug("showPreChatSurvey", data);
				screenState = screenStateType.PRECHATSURVEY;
				
				lpChatShowView(lpCWAssist.lpChatMakeSurveyContainerHtml(false), true);
				// build html survey container 
				
				makeQuestionsHtml(data);
				$(jqe(lpChatID_lpPreChatMessagesSection)).find(lpChatClass_lpChatSurveySectionText).html(data.survey.header);
				$(jqe(lpChatID_lpChatSurveyId)).val(data.survey.id);
				$(jqe(lpChatID_lpChatSurveyQuestionNum)).val(data.survey.questions?data.survey.questions.question.length:0);
				logger.debug("showPreChatSurvey", "before bind close button event");
				bindCloseButtonEvent();
				logger.debug("showPreChatSurvey", "after bind close button event");
				
				unregisterEventHandler("lpPreChatSurveySubmitBtn", "click", function() { prechatSurveyBtnClick(data); });
				registerEventHandler("lpPreChatSurveySubmitBtn", "click", function() { prechatSurveyBtnClick(data); } );
				
				showChatWizContainer();

			}

			/**
			 * dismiss the embedded window if no exit survey found
			 */
			myChatWiz.noPostChatSurvey = function() {
				logger.debug("noPostChatSurvey", "...");
				disposeEndChat(); // if no survey, end chat
			}

			/* load post chat survey questions */
			myChatWiz.showPostChatSurvey = function(data) {
				logger.debug("showPostChatSurvey", data);
				chatWinCloseable = true; //allow usr to click one more x/close to dismiss the chat window
				screenState = screenStateType.EXITSURVEY;
				$(jqe("lpChatLoadingSection")).remove(); //remove loading screen
				var tempAllowSubmitButton = data.survey.questions && data.survey.questions.question.length > 0 ? true: false;
				
				if(tempAllowSubmitButton){
					lpChatShowView(lpCWAssist.lpChatMakeSurveyContainerHtml(true), true);
					$(jqe("lpPreChatSurveySubmitBtn")).text(lpCWTagConst.lpBtn_Submit);
					$(jqe("lpPreChatSurveySectionTitle")).addClass("lpPostChatTitleHeader");
					makeQuestionsHtml(data);
					$(jqe(lpChatID_lpPreChatMessagesSection)).find(".lpChatSurveySectionTextPost").html(data.survey.header);
					$(jqe(lpChatID_lpChatSurveyId)).val(data.survey.id);
					$(jqe(lpChatID_lpChatSurveyQuestionNum)).val(data.survey.questions?data.survey.questions.question.length:0);
					
					unregisterEventHandler("lpPreChatSurveySubmitBtn", "click", function() { exitSurveyBtnClick(data); });
					registerEventHandler("lpPreChatSurveySubmitBtn", "click", function() { exitSurveyBtnClick(data); });
				}
				else
					lpChatShowView(lpCWAssist.lpChatMakeOfflineSurveySection(data), true);
			}

			/**
			 * dynamically create questions screen
			 */
			function makeQuestionsHtml(data) {
				var surveyContainer = ""; // 
				var surveyLogicInstance = new lpTag.taglets.SurveyLogic({ survey : data });
				var activeQuestions = surveyLogicInstance.getActiveQuestionsIds();
				
				if(data.survey.questions){
					var activeQuestionTemp = new Array();
					for (i = 0; i < data.survey.questions.question.length; i++) {
						question = data.survey.questions.question[i];
						if (activeQuestions.indexOf(question.id) > -1) {
							//create DOM for active question
							activeQuestionTemp.push(question.id);
							makeQuestionWithLogicHtml(data, question, true);
						}
					}
					logger.debug("Active Questions ID List", activeQuestionTemp);
				}
			}
			
			/**
			 * dynamically create questions with logic survey
			 */
			function makeQuestionWithLogicHtml(data, question, visibleFlag){
				var questionList = data.survey.questions;
				var questionDivID = "lpChatSurveySectionQ"+question.order;
				var  questionErrorDivID = "lpChatSurveySectionQError"+question.order;
				var surveyContainer = '<div id="' + questionDivID + '" class="lpChatSurveySectionQ">';
				
				var surveyQuestionDesc = '<div class="lpChatSurveySectionQdesc">'
				if(lpCWTagConst.lpUseAutoGenNumberOnSurvey){
					surveyQuestionDesc += (questionIndex++) + '. ';
				}
				surveyQuestionDesc +=  question.label;
				if (question.mandatory) {
					surveyQuestionDesc += '<span class="lpRequiredTxt">&nbsp;*</span>'
				}
				surveyQuestionDesc += lpCWAssist.makeHiddenInput("lpSurveyQuestionID"+ question.order, question.id);
				surveyQuestionDesc +="</div>";
				
				surveyContainer += surveyQuestionDesc;
				
				// add the input button
				surveyContainer += lpCWAssist.makeInputSection(dataTypes, question, question.order);
				surveyContainer += '</div>';
				
				//add error section
				surveyContainer += '<div id="' +questionErrorDivID + '" class="lpErrorMessage"></div>';
				
				// inject into the existing DOM & register the onClickEvent
				$(jqe(lpChatID_lpChatSurveyQuestionsContainer)).append(surveyContainer);
				if(visibleFlag)
					$(jqe(questionDivID)).show();
				else
					$(jqe(questionDivID)).hide();
				
				//if survey logic found
				if(question.entry && question.entry.length){
					//for each entries in the question, check for logic survey
					for ( var j in question.entry) {
						var questOption = question.entry[j];
						if (questOption.logic && questOption.logic.showLogicId) {
							var surveyLogicIdList = questOption.logic.showLogicId;
							for(var x in surveyLogicIdList){
								var showLogicId = surveyLogicIdList[x];
								var showQuestion = getQuestionByLogicId(data, showLogicId);
								if(showQuestion){
									makeQuestionWithLogicHtml(data, showQuestion, false);
								}
							}
						}
					}//for
					executeLogicEvent(data, question)
				}
				
				onChangeQuestionHandler(data, question);
			}
			
			/**
			 * get question data by logic id
			 */
			function getQuestionByLogicId(data, logicId){
				for (var i in data.survey.questions.question) {
					var question = data.survey.questions.question[i];
					if(question.logicId == logicId)
						return question
				}
				return ;
			}
			
			/**
			 * execute when there is a question with logic attached
			 */
			function executeLogicEvent(data, question) {
				if(question){
					var elemId = "#lpSurveyQuestionAns"+question.order;
					$(elemId).change(function(){
							onChangeQuestionHandlerForLogic(data, question.id);
						});
				}
			}
			
			/**
			 * perforance credit card pattern detecting and notify 
			 */
			function checkAndNotifyCCMasking(data, question, fieldVal){
				if (fieldVal != "" && question && question.type == dataTypes.TEXT || question.type == dataTypes.TEXT_AREA){
					var valAfterCCMasking =  ccMasking(fieldVal);
					if(valAfterCCMasking != fieldVal){
						notificationDialog.open(lpCWTagConst.lpMsg_CreditCardPatternDetected_InSurvey, true);	
					}
				}
			}
			
			/**
			 * When dropdown question on value change, do the validation
			 */
			function onChangeQuestionHandler(data, question){
				if (question && question.type == dataTypes.TEXT || question.type == dataTypes.NUMERIC || question.type == dataTypes.TEXT_AREA){
					var elemId = "#lpSurveyQuestionAns"+question.order;
					$(elemId).blur(function(){
								var val = $(elemId).val();
								if(val.trim() != ""){
									checkAndNotifyCCMasking(data, question, val.trim());
              		lpCWAssist.surveyQuestionHideRequired(dataTypes, question, false);
								}else{
									lpCWAssist.surveyQuestionShowRequired(dataTypes, question);
								}
						});
				}else{
					onChangeQuestionHandlerForLogic(data, question); 
				}
			}
			
			/**
			 * When dropdown question on value change, do the validation with logic attached 
			 */
			function onChangeQuestionHandlerForLogic(data, id){
				//logger.debug("onChangeQuestionHandlerForLogic", "id="+id);
				var surveyLogicInstance = new lpTag.taglets.SurveyLogic({ survey : data });
				
				//retrieve question object & its answers
	      var question = surveyLogicInstance.getQuestionById(id);
	      var selectedValues = lpChatGetAnswer(question, question.order);
	      //logger.debug("onChangeQuestionHandlerForLogic selectedValues=", selectedValues);
	      if (typeof selectedValues != "object") {
	          selectedValues = [];
	          selectedValues[0] = lpChatGetAnswer(question, question.order);
	      }
	      
	      if(selectedValues.length > 0 && selectedValues[0]==""){
	      	lpCWAssist.surveyQuestionShowRequired(dataTypes, question);
	      }else{
	      	//logger.debug("onChangeQuestionHandlerForLogic", "need to hide");
	      	lpCWAssist.surveyQuestionHideRequired(dataTypes, question, false);
	      }
	      
	      for ( var k in selectedValues) {
	      	var selectedValue = selectedValues[k];
	      	//logger.debug("onChangeQuestionHandlerForLogic k="+k+", selectedValue=", selectedValue);
	        for ( var j in question.entry) {
            var option = question.entry[j];
            if (selectedValue == option.value) {
              if (option.logic && option.logic.showLogicId) {
                for (var m = option.logic.showLogicId.length-1; m >=0; m--) {
                  var logicQuestion = surveyLogicInstance.getQuestionByLogicId(option.logic.showLogicId[m]);
                  if (!jQuery.isEmptyObject(logicQuestion)) {
                  	//logger.debug("onChangeQuestionHandlerForLogic show m="+m, logicQuestion.order);
                  	$("#lpChatSurveySectionQ"+logicQuestion.order).show();
                  }
                }
              }
            }
          }
				}
				
				//hide all subsequent questions of survey logic questions
				surveyQuestionHideSurveyLogic(dataTypes, data, question);
			}
			
			/**
			 * hide the require question and sub questions
			 */
			function surveyQuestionHideSurveyLogic(dataTypes, data, question){
				//logger.debug("****surveyQuestionHideSurveyLogic questions", question); 
				var surveyLogicInstance = new lpTag.taglets.SurveyLogic({ survey : data });
					
				//retrieve question object & its answers
		    var selectedValues = lpChatGetAnswer(question, question.order);
			       
				for ( var j in question.entry) {
		      var option = question.entry[j];
		      if (selectedValues.indexOf(option.value) == -1 && option.logic && option.logic.showLogicId) {
		        for (var m = 0; m < option.logic.showLogicId.length; m++) {
		          var logicQuestion = surveyLogicInstance.getQuestionByLogicId(option.logic.showLogicId[m]);
		          if (!jQuery.isEmptyObject(logicQuestion)) {
		          	//logger.debug("onChangeQuestionHandlerForLogic hiding..", logicQuestion);
		          	lpCWAssist.surveyQuestionHideRequired(dataTypes, logicQuestion, true);
		          	lpCWAssist.surveyQuestionHideReqRedBorder(dataTypes, logicQuestion, true);
		          	surveyQuestionHideSurveyLogic(dataTypes, data, logicQuestion);
		          }
		        }
		      }
		    }
			}
	
			/**
			 * check agent availability
			 */		
			function checkAgentAvailability(){
				$(jqe(lpChatID_lpChatSlideOutContainer)).hide();
			
				var successCallback = function(data) {
					logger.debug("getAgentAvailabilty ", data);
					if (data.availability) {
						logger.debug("getAvailabilty", "true");
						//myChatWiz.noPreChatSurvey(); 
						checkForPreChatSurvey(); // used to enable prechat survey functionality
					} else {
						logger.debug("getAvailabilty", "false");
						if(offlineSurveyNameOverride != "")
							showOfflineScreenBySurveyName(offlineSurveyNameOverride);
						else
							showOfflineScreenBySkill(skill);
					}
				}
				
				var errorCallback = function(data) {
					logger.debug("getAgentAvailabilty.error", data);
					if(offlineSurveyNameOverride != "")
						checkOfflineBySurveyName(offlineSurveyNameOverride);
					else
						checkOfflineBySkill(skill);
				}
				
				var failedRequest = chat.getAvailabilty({
					skill : skill,
					success : successCallback,
					error : errorCallback,
					context : myChatWiz
				});
			
				if (failedRequest && failedRequest.error) {
					logger.debug("getAgentAvailabilty.error2", failedRequest.error);
					if(offlineSurveyNameOverride != "")
						checkOfflineBySurveyName(offlineSurveyNameOverride);
					else
						checkOfflineBySkill(skill);
				}
			}
			
			/* loading the webservice screen prior moving to prechat survey screen */
			/* myChatWiz.loadWebServiceChat = function (){
				logger.debug("loadWebServiceChat", " starting...");
				if(webserviceEnable){
					logger.debug("loadChat", "webserviceEnable...");
					lpChatShowView(lpCWAssist.lpChatMakeLoadingScreenHtml());
					showChatWizContainer();
					bindCloseButtonEvent();
					//startSession(); //start the collaboration
					webserviceLoadComplete = false;
					webserviceTimer = setInterval(function(){ 
						if(typeof webserviceLoadComplete != "undefined" && webserviceLoadComplete==true){
							clearInterval(webserviceTimer);
							if(webserviceLoadResult){
								checkAgentAvailability();
							}
							else{
								lpChatShowView("", true);
								showOfflineScreenBySurveyName(webserviceFailureOfflineSurveyNameOverride);
							}
						}
					}, 500);
				}
			} */
			
			/*
			 * fires when a start button clicked. Use to establish a new
			 * connection
			 */
			myChatWiz.loadChat = function() {
				logger.debug("loadChat", "...");
				
				/* reset variables */
				chatState = null;
				screenState = "";
				deleteAPI_instance();
				/* once the chat instance is created, event will fireback and then check for agent availability */
				createChatInstance(); 
				if(skill !="offline"){
					//logger.debug("loadchat", "skill is not offline");
					//createCollaborationInstance();
					//logger.debug("loadChat", "caling loadWebServiceChat()");
					//myChatWiz.loadWebServiceChat();
				}
			}

			/*
			 * each page will load this method to check for existing Chat
			 * session.
			 */
			myChatWiz.reEstChatConnection = function() {
				logger.debug("reEstablishChat", "...");
				if(lpCWAssist.isBrowserCompatible()){
					windowState = windowStateType.READY; 
					sessionMgr.reloadDataFromSessionStorage();
					logger.debug("reEstablishChat", "isChatStarted=" + (sessionMgr.isChatStarted()?"true":"false")
															+ ", isActiveChatSession=" + (sessionMgr.isActiveChatSession()?"true":"false"));
						
					if(sessionMgr && sessionMgr.isChatStarted()){
						
						if(sessionMgr.isActiveChatSession()){
							logger.debug("reEstablishChat","actvie session and valid session found");
							isAudioOn = sessionMgr.isAudioOn();
							lpChatFontSize = sessionMgr.getFontSize();
							lpSUID = sessionMgr.getSUID();
							offlineSurveyNameOverride = sessionMgr.getOfflineChatSurveyNameOverride();
							preChatSurveyNameOverride = sessionMgr.getPreChatSurveyNameOverride();
							exitSurveyNameOverride = sessionMgr.getExitChatSurveyNameOverride();
							lpVisitorSessionId = sessionMgr.getVisitorSessionID();
							visitorId = sessionMgr.getVisitorID();
							skill = sessionMgr.getChatSkill();
							sessionMgr.start();
							bindAllButtonEvents();
						}else{
							logger.debug("reEstablishChat", "previous session found");
							//create chat instance and let it clean up itself. When NOT FOUND state, need to do the clean stop session and do unbind
							windowState = windowStateType.DESTRUCTION; 
							lpSUID = sessionMgr.getSUID();		
							logger.info("reEstablishChat recreate with SUID", lpSUID);
						}
						createChatInstance();
					}
				}
			}

			function isSameOrigin(respDomain) {
				return getTargetForParenChatFrame() == respDomain ? true : false;
			}

			/**
			 * Notify wrapper/paper page for flashing
			 */
			function lpChatWinNotifyFlashingStart(){
				logger.debug("lpChatWinNotifyFlashingStart", " notifying..."+ getTargetForParenChatFrame());
				//notify to flashing and mark flashing variable is started
				if(lpChatWinMinimized && !lpChatFlashingStarted){
					sendPostMessage({"lpEmbChatWiz": "LPNVPF", "CMD" : "FLASHING", "value" : "START"});
					lpChatFlashingStarted = true;
				}
			}
			
			function lpChatWindowMinizedClicked(){
				lpChatWinMinimized = true;
			}
			
			function lpChatWindowMaximizedClicked(){
				lpChatWinMinimized = false;
				lpChatFlashingStarted = false;
				//scrolling to bottom upon maximize - fix FF
				scrollToBottom(); 
			}
			
			function sendPostMessage(jsonData){
				logger.debug("childFrame sending PostMessage to: "+getTargetForParenChatFrame(), jsonData);
				window.parent.postMessage(JSON.stringify(jsonData), getTargetForParenChatFrame());	
			}
	
			/**
			 * postMessage receiver on iFrame
			 */
			myChatWiz.lpReceiveChatPostMessage = function(e) {
				if (lpCWTagConst.DEBUG_ENABLE && isSameOrigin(e.origin)) {
					logger.debug("lpReceiveChatPostMessageChild: " , e.data);
				}	
				
				try{
					var msgData = JSON.parse(e.data);
					if(msgData.lpEmbChatWiz == "LPNVCF"){
						if(msgData.CMD == "LP_WEB_SERVICES"){
							webserviceLoadComplete = true;
							if(msgData.value == 'SUCCESS'){
								webserviceLoadResult = true;
							}else{
								webserviceLoadResult = false;
							}
						}else if(msgData.CMD == "FLASHING"){
							if(msgData.value == 'MINIMIZED'){
								lpChatWindowMinizedClicked();
							}else if(msgData.value == 'MAXIMIZED'){ 
								lpChatWindowMaximizedClicked();
							}
						}else if(msgData.CMD == "DEBUG"){
							if(msgData.value == 'ENABLE'){
								lpCWTagConst.DEBUG_ENABLE = true;
							}else{ 
								lpCWTagConst.DEBUG_ENABLE = false;
							}
						}else if(msgData.CMD == "RE_ESTABLISH"){
							logger.debug("RE_ESTABLISH", "...");
							myChatWiz.reEstChatConnection();
							showChatWizContainer();
						}else if(msgData.CMD == "CONTROL"){
							if(msgData.value == 'lpStartChatButtonClicked'){
								if(lpCWAssist.isBrowserCompatible()){
									logger.debug("windowState - ", windowState);
									if(windowState == windowStateType.READY){
										if (msgData.skill != null)
											skill = msgData.skill;
											
										if (msgData.offlineSurveyNameOverride != null)
											offlineSurveyNameOverride = msgData.offlineSurveyNameOverride;
											
										if (msgData.preChatSurveyNameOverride != null)
											preChatSurveyNameOverride = msgData.preChatSurveyNameOverride;
										
										if (msgData.exitChatSurveyNameOverride != null)
											exitSurveyNameOverride = msgData.exitChatSurveyNameOverride;
											
										if (msgData.webserviceFailureOfflineSurveyNameOverride != null)
											webserviceFailureOfflineSurveyNameOverride = msgData.webserviceFailureOfflineSurveyNameOverride;
										
										if (msgData.nonInteractiveChatSurveyNameOverride != null)
											nonInteractiveChatSurveyNameOverride = msgData.nonInteractiveChatSurveyNameOverride;
										
										webserviceEnable = msgData.WS_ENABLE?true:false;
										
										lpChatWizButtonName = msgData.lpChatWizButtonName;
										lpVisitorSessionId = msgData.lpVisitorSessionId;
										lpSiteContainer = msgData.siteContainer;
										
										/** save info to sessionStorage for resume usage */
										lpSUID = $.now();
										sessionMgr.initialize(); //remove all existing session, especially when new chat start
										sessionMgr.setChatWizParam(skill, lpSUID, lpVisitorSessionId);
										sessionMgr.setChatWizSurveyParam(preChatSurveyNameOverride, offlineSurveyNameOverride, exitSurveyNameOverride);
										myChatWiz.loadChat()
									}else{
										logger.info("busy cleaning up previous session. Please try again in a few second", windowState);
									}
								}else{
									lpChatShowView(lpCWAssist.lpChatMakeUpdateBrowserSection());
									showChatWizContainer();
									bindCloseButtonEvent();
								}
							}else if(msgData.value == 'HIDE_CONTAINER'){
								hideChatWizContainer();
							}else if(msgData.value == 'END_CHAT'){
								lpChatCloseChatBtnClick();
							}else if(msgData.value == 'SCROLL'){
								logger.debug("Preparing scrollToBottom....", "");
								scrollToBottom();
							}
						}
					}
				}catch (excp) { 
					logger.debug("lpReceiveChatPostMessage. Exception occurred", excp);
				}
			}

			/*
			 * validate if all mandatory survey questions are answered and if
			 * questions have valid answers
			 */
			myChatWiz.validateSurvey = function(data, callback) {
				logger.debug("validateSurvey", "....");
				var isValidationPass = true;
				var isFirstErrorField = true;
				if(data.survey && data.survey.questions && data.survey.questions.question){
					for (i = 0; i < data.survey.questions.question.length; i++) {
						question = data.survey.questions.question[i];
						var questionContainerDiv = "";
						if (question.type == dataTypes.TEXT || question.type == dataTypes.NUMERIC || question.type == dataTypes.TEXT_AREA){
							questionContainerDiv = "#lpSurveyQuestionAns" + question.order;
							$(questionContainerDiv).removeClass();
						}
						else{
							questionContainerDiv = '#lpChatSurveySectionQ' + question.order;
							$(questionContainerDiv).removeClass().addClass("lpChatSurveySectionQ");
						}
						
						var chatSurveySectionQDiv = "#lpChatSurveySectionQ" + question.order;	
						var questionErrorContainerDiv = '#lpChatSurveySectionQError' + question.order;
						$(questionErrorContainerDiv).empty();
						
						if($(chatSurveySectionQDiv).is(":visible")){
							//remove the exclamation & text
							var answer = lpChatGetAnswer(question, question.order);
							if (question.mandatory && !answer.length) {
								isValidationPass = false;
								lpCWAssist.insertRequiredErrorMessage(question, isFirstErrorField);
								isFirstErrorField = false;
								$(questionContainerDiv).addClass("lpQuestionErrorBorder");
							} else if (answer.length && question.validationType) {
								if (question.type == dataTypes.TEXT || question.type == dataTypes.NUMERIC) {
									var isValid = validateValue(question.validationType, answer);
									if (!isValid) {
										isValidationPass = isValid;
										lpCWAssist.insertInvalidErrorMessage(question, isFirstErrorField);
										isFirstErrorField = false;
										$(questionContainerDiv).addClass("lpQuestionErrorBorder");
									}
								}
							}
						}
					}
				}
				
				if (isValidationPass) {
					callback(data)
				}
				
				return isValidationPass;
			}

			/* extract questions labels to be alerted to user */
			function getQuestionLabelText(question) {
				var questionText = "<span>" + question + "</span>";
				return $(questionText).text().trim();
			}

			/* validate if a question's snswer is valid */
			function validateValue(validationType, value) {
				if (validationType == 'alpha_numeric') {
					/*
					var Exp = /^[0-9a-zA-Z\s]+$/;
					return value.match(Exp);
					*/
					return value;
				} else if (validationType == 'email') {
					var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					return re.test(value);
				} else if (validationType == 'numeric') {
					return !isNaN(value)
				}
			}

			/* fetch answer for a question based on its type */
			function lpChatGetAnswer(question, i) {
				var answer;
				if (question.type == dataTypes.TEXT
						|| question.type == dataTypes.TEXT_AREA
						|| question.type == dataTypes.NUMERIC
						|| question.type == dataTypes.DROPDOWN) {
					answer = $("#lpSurveyQuestionAns" + i).val().trim();
					
					if (question.validationType == 'alpha_numeric'){
						var valueBefore = answer;
						answer =  ccMasking(answer);
					}
				} else if (question.type == dataTypes.CHECKBOX) {
					var $radioDiv = $("#lpSurveyQuestionAns" + i);
					if ($radioDiv.find("input:checked").length) {
						answer = [];
						$radioDiv.find("input:checked").each(function() {
							answer.push($(this).val())
						});
					}
				} else if (question.type == dataTypes.RADIO
						|| question.type == dataTypes.RADIO_SIDE) {
					var $radioDiv = $("#lpSurveyQuestionAns" + i);
					answer = $radioDiv.find("input:checked").val();
				}
				return answer || "";
			}

			/* method to inject html to DOM */
			function lpChatShowView(html, clearDom) {
				if (clearDom) {
					$(jqe(lpChatID_lpChatBodySection)).html("");
				}
				$(jqe(lpChatID_lpChatBodySection)).append(html)
			}

			
}

lpChatWidget = new lpCWTag.LPChatWidget(window);

/**
 * patching for IE 8 where javascript functionalities is not available
 */
function lpPatch_IE8(){
	if (typeof Array.prototype.indexOf !== 'function') {
		Array.prototype.indexOf = function(obj, start) {
		     for (var i = (start || 0), j = this.length; i < j; i++) {
		         if (this[i] === obj) { return i; }
		     }
		     return -1;
		}  
	}
	
	if(typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
	  	return this.replace(/^\s+|\s+$/g, ''); 
		}
	}	
}

// DEFAULT: LOAD FUNCTION
(function(window) {
	function lpChatWizLoad() {
		lpPatch_IE8();
		lpChatWidget.init();
	}

	// check to see jQuery really exist
	if (window.jQuery === undefined) {
		throw new Error('JQuery is required!');
	} else {
		if (window.addEventListener){
			window.addEventListener("message", lpChatWidget.lpReceiveChatPostMessage, false);
		} else if (window.attachEvent) {
			window.attachEvent("onmessage", lpChatWidget.lpReceiveChatPostMessage)
		}
		//$(window.document).ready(lpChatWizLoad);
		lpChatWizLoad();
	}

})(window);