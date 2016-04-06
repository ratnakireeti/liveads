var lpMTagConfig = lpMTagConfig || {};
lpMTagConfig.vars = lpMTagConfig.vars || [];

lpMTagConfig.lpServer = "sales.liveperson.net";
lpMTagConfig.lpTagSrv = lpMTagConfig.lpServer;
lpMTagConfig.lpNumber = lpQueryParams.lpMasterAcc;
lpMTagConfig.dynButton = lpMTagConfig.dynButton || [];
lpMTagConfig.db1 = lpMTagConfig.db1 || [];
lpMTagConfig.chatWizButtonName = "";
lpMTagConfig.onLoadFlag = false;
lpMTagConfig.lpProtocol = document.location.toString().indexOf("https:") == 0 ? "https" : "http";
lpMTagConfig.pageStartTime = (new Date).getTime();
lpMTagConfig.deploymentID = "generic";
lpMTagConfig.excludeLAVars = ["liveads_advertiser","liveads_campaign", "liveads_creative", "liveads_icon", "adWidth", "adHeight", "ButtonTop", "ButtonLeft", "ButtonDelay", "ChatStyle"];
lpMTagConfig.addLAVars = function(){
	for (var lpQueryParam in lpQueryParams) {
	  if(lpMTagConfig.excludeLAVars.indexOf(lpQueryParam)==-1)
		lpMTagConfig.vars.push(["page", lpQueryParam, lpQueryParams[lpQueryParam]]);
	}
}, lpMTagConfig.addLAVars();

if (!lpMTagConfig.pluginsLoaded) lpMTagConfig.pluginsLoaded = !1;
lpMTagConfig.loadTag = function() {
    if (typeof lpMTag == "undefined") {
    lpMTagConfig.onLoadFlag = true;
    for (var a = document.cookie.split(";"), b = {}, c = 0; c < a.length; c++) {
        var d = a[c].substring(0, a[c].indexOf("="));
        b[d.replace(/^\s+|\s+$/g, "")] = a[c].substring(a[c].indexOf("=") + 1)
    }
    for (var a = b.HumanClickRedirectOrgSite, b = b.HumanClickRedirectDestSite, c = ["lpTagSrv", "lpServer", "lpNumber", "deploymentID"], d = !0, e = 0; e < c.length; e++) lpMTagConfig[c[e]] || (d = !1, typeof console != "undefined" && console.log && console.log("LivePerson : lpMTagConfig." + c[e] + " is required and has not been defined before lpMTagConfig.loadTag()."));
    if (!lpMTagConfig.pluginsLoaded && d) lpMTagConfig.pageLoadTime = (new Date).getTime() - lpMTagConfig.pageStartTime, a = "?site=" + (a == lpMTagConfig.lpNumber ? b : lpMTagConfig.lpNumber) + "&d_id=" + lpMTagConfig.deploymentID + "&default=simpleDeploy", lpAddMonitorTag(lpMTagConfig.deploymentConfigPath != null ? lpMTagConfig.lpProtocol + "://" + lpMTagConfig.deploymentConfigPath + a : lpMTagConfig.lpProtocol + "://" + lpMTagConfig.lpTagSrv + "/visitor/addons/deploy2.asp" + a), lpMTagConfig.pluginsLoaded = !0
    }
};

function lpAddMonitorTag(a) {
    if (!lpMTagConfig.lpTagLoaded) {
        if (typeof a == "undefined" || typeof a == "object") a = lpMTagConfig.lpMTagSrc ? lpMTagConfig.lpMTagSrc : lpMTagConfig.lpTagSrv ? lpMTagConfig.lpProtocol + "://" + lpMTagConfig.lpTagSrv + "/hcp/html/mTag.js" : "/hcp/html/mTag.js";
        a.indexOf("http") != 0 ? a = lpMTagConfig.lpProtocol + "://" + lpMTagConfig.lpServer + a + "?site=" + lpMTagConfig.lpNumber : a.indexOf("site=") < 0 && (a += a.indexOf("?") < 0 ? "?" : "&", a = a + "site=" + lpMTagConfig.lpNumber);
        var b = document.createElement("script");
        b.setAttribute("type",
            "text/javascript");
        b.setAttribute("charset", "iso-8859-1");
        b.setAttribute("src", a);
        document.getElementsByTagName("head").item(0).appendChild(b)
    }
}

window.attachEvent ? window.attachEvent("onload", function() {
    lpMTagConfig.disableOnLoad || lpMTagConfig.loadTag()
}) : window.addEventListener("load", function() {
    lpMTagConfig.disableOnLoad || lpMTagConfig.loadTag()
}, !1);

var onLoadWait = setInterval(function() {
	lpMTagConfig.onLoadFlag || (clearInterval(onLoadWait), lpMTagConfig.loadTag())
}, 500);

function lpSendData(a, b, c) {
    if (arguments.length > 0) lpMTagConfig.vars = lpMTagConfig.vars || [], lpMTagConfig.vars.push([a, b, c]);
    if (typeof lpMTag != "undefined" && typeof lpMTagConfig.pluginCode != "undefined" && typeof lpMTagConfig.pluginCode.simpleDeploy != "undefined") {
        var d = lpMTagConfig.pluginCode.simpleDeploy.processVars();
        lpMTag.lpSendData(d, !0)
    }
}

function lpAddVars(a, b, c) {
    lpMTagConfig.vars = lpMTagConfig.vars || [];
    lpMTagConfig.vars.push([a, b, c])
};

try {
	lpMTagConfig.inviteBlock = 'all'; //value is either 'chat', 'voice', 'multichannel', or 'all' depending on the type of invitations you want to block
	
    if (typeof(lpMTagConfig.ifVisitorCode) == 'undefined') {
        lpMTagConfig.ifVisitorCode = new Array();
    }

    lpMTagConfig.ifVisitorCode[lpMTagConfig.ifVisitorCode.length] = function() {
        lpMTagConfig.pluginCode.simpleDeploy.varValueCharLimit = 1000;
    }
} catch (e) {}

lpMTagConfig.dynButton[lpMTagConfig.dynButton.length] = {
    'name': lpQueryParams.dynamicButtonName,
    'pid': lpQueryParams.dynamicButtonName,
    'ovr': 'lpMTagConfig.db1',
    'afterStartPage': true
};

lpMTagConfig.db1.dbClicked = function(objName, status) {
    objRef = eval(objName);
	lpMTagConfig.chatWizButtonName = "(button dynamic-button:" + objRef.buttonName + "()) " + document.location.href;
    if (objRef.buttonName.indexOf('liveads')>1) {
        lpChatSkill = lpQueryParams.unit+"-"+lpQueryParams.language;
    }
	lpLoadChat();
	var dburl = objRef.getActionURL("Available");
};

function lpGetDate() {
    return new Date().getTime();
}

function lpFindRepstateCheckImage(lpimage) {
    var lpImageWidth = lpimage.width;
    var state = 'failLoad';
    if (lpImageWidth > 0) switch(lpImageWidth) {
		case 40:
			state = 'Online';
			break;
		case 50:
			state = 'Offline';
			break;
		case 60:
			state = 'Busy';
			break;
		default:
			state = 'Other';
	}
    lpimage.parentNode.removeChild(lpimage);
	return state;
}

function lpCheckSkillState(lpServer, lpAcctNum, lpSkill, callBack, lpMaxWaitTime, lpChannel) {
    lpMaxWaitTime = lpMaxWaitTime || '&maxWaitTime=0';
    lpChannel = lpChannel || '&channel=web';
	if (arguments.length < 4) {
        return false;
    } else {
        var lpFindRepstateImage = document.createElement('IMG');
        lpFindRepstateImage.style.visibility = 'hidden';
        document.body.appendChild(lpFindRepstateImage);
        lpFindRepstateImage.src = '';
        lpFindRepstateImage.onload = function() {
			var wait = setInterval(function() {
				var nw = lpFindRepstateImage.width;
				var nh = lpFindRepstateImage.height;
				if (nw && nh) {
					clearInterval(wait);
					callBack(lpFindRepstateCheckImage(lpFindRepstateImage), lpAcctNum, lpSkill)
				}
			}, 30);
	};
        lpFindRepstateImage.src = (document.location.toString().indexOf("https") == 0 ? "https" : "http") + "://" + escape(lpServer) + "/hc/" + escape(lpAcctNum) + "/?cmd=repstate&site=" + lpAcctNum + "&useSize=true" + '&skill=' + escape(lpSkill) + lpChannel + lpMaxWaitTime + "&d=" + lpGetDate();
        return true;
    }
}

function checkAvail(){
	lpCheckSkillState(lpMTagConfig.lpServer, lpQueryParams.lpAccNumber, lpQueryParams.unit+"-"+lpQueryParams.language, function (finalRepState, acctNum, originalQuery){
		lpMTagConfig.vars.push(["session", "LA_agentStatus", finalRepState]);
	});
}

if(lpQueryParams.lpAccNumber){
	checkAvail();
}
