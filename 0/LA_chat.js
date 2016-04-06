/* The order of the variables is important */
window.lpCWTagConst = {"CHAT_BASE_URL":"https://ratna.liveperson.net/visitor/liveads_1.1.1/0", "CHAT_LOCATION_URI":"/chatServer/", "CHAT_LOCATION_URI2":"", "LA_SCRIPT_SRC":"/LA_chat", "LA_SCRIPT_ELEM": document.getElementById("liveAdsScript"), "liveadsContainer": document.getElementById("liveadsContainer"), "DEBUG_ENABLE":false, "INFO_ENABLE":false, "LOGGER_NAME_BOOTSTAP":"LPChatBootstrap", "WS_ENABLE":false, "lpChatTitleVal":"&nbsp;"}; //default const values
window.lpQueryParams = {"lpAccNumber":"", "lpMasterAcc":"48130002", "liveads_advertiser":"", "liveads_campaign":"", "liveads_creative":"", "liveads_icon":"", "LA_agentStatus":"Offline", "isMin": "true", "adWidth":"300", "adHeight":"250", "ButtonTop":"100", "ButtonLeft":"100", "ButtonDelay":"1000", "ChatStyle":"", "Item":"", "Bid":"", "Condition":"", "Context":""}; //default param values

lpCWTagConst.LA_SCRIPT_ELEM = lpCWTagConst.LA_SCRIPT_ELEM ? lpCWTagConst.LA_SCRIPT_ELEM : document.querySelector('script[src*="'+lpCWTagConst.CHAT_BASE_URL + lpCWTagConst.LA_SCRIPT_SRC + '"]');
lpCWTagConst.URL_QUERY = lpCWTagConst.LA_SCRIPT_ELEM.getAttribute("src").split("?")[1].split("&");
lpCWTagConst.addQueryParams = function(t, p) {// adding entities to lpQueryParams object
    for (var e = 0; t[e];) 
		c = t[e].split("="), c[1] ? p[c[0]] = c[1] : console.log(c[0] + " has a null value."), e++;
}, lpCWTagConst.addQueryParams(lpCWTagConst.URL_QUERY, lpQueryParams);
lpQueryParams.unit = "liveads-"+lpQueryParams.liveads_advertiser.toLowerCase();
lpQueryParams.language = lpQueryParams.liveads_campaign.toLowerCase();
lpQueryParams.dynamicButtonName = "chat-liveads-"+lpQueryParams.lpAccNumber+"~"+lpQueryParams.liveads_advertiser+"-"+lpQueryParams.language+"-"+lpQueryParams.liveads_creative+"-"+lpQueryParams.adWidth+"x"+lpQueryParams.adHeight;
lpQueryParams.dynamicButtonName = lpQueryParams.dynamicButtonName.toLowerCase();
var min = "true"==lpQueryParams.isMin?".min":"";
lpCWTagConst.write = {
	addElements: function(p) {
        var e = "";
        e += '<div id="liveadsContainer" style="" ><!-- BEGIN upper left LiveAds! svg icon //--><div id="LiveAds_Icon" style="display:block;position:absolute;z-index:999">', e += '<iframe src="' + lpCWTagConst.CHAT_BASE_URL + "/icon/liveads_" + p.liveads_icon + '.html" style="position:relative; width:60px; height:15px; border:none;" scrolling="no"></iframe>', e += "</div><!-- END upper left LiveAds! svg icon //-->", e += '<div id="lpChatWizContainerNew"></div>', e += '<div id="' + p.dynamicButtonName + '" style="display:none;top:' + p.ButtonTop + "px;left:" + p.ButtonLeft + 'px;position:relative; z-index: 1;"></div></div>', lpCWTagConst.LA_SCRIPT_ELEM.insertAdjacentHTML("beforebegin", e)
    },
    addScript: function(src) {
        var e = document.createElement("script");
        e.type = "text/javascript", e.src = lpCWTagConst.CHAT_BASE_URL + src, document.getElementsByTagName("head")[0].appendChild(e)
    },
    addStyle: function(src) {
        var e = document.createElement("link");
        e.rel = "stylesheet", e.type = "text/css", e.href = lpCWTagConst.CHAT_BASE_URL + src, document.getElementsByTagName("head")[0].appendChild(e)
    }
}

lpCWTagConst.liveadsContainer || (lpCWTagConst.write.addScript("/mtagconfig-EVE"+min+".js"), lpCWTagConst.write.addElements(lpQueryParams), lpCWTagConst.write.addScript("/chatButtonBootStrap"+min+".js"), lpCWTagConst.write.addStyle("/chatFrame"+min+".css"), lpCWTagConst.write.addStyle("/chatServer/css/chatWidget" + lpQueryParams.ChatStyle.toUpperCase() + ".css"));

lpCWTagConst.showButtonOnDelay = function(t){
	setTimeout(function(){
		document.getElementById(lpQueryParams.dynamicButtonName).style.display = 'block'
	}, t);
}, lpCWTagConst.showButtonOnDelay(lpQueryParams.buttonDelay);