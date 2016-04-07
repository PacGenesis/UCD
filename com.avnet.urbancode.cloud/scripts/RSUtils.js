
function RSUtils() {
	
}

RSUtils.convertParms = function(parms) {
	var i = parms.length;
	var jparms = java.lang.reflect.Array.newInstance(java.lang.String, i);
	for (var j = 0; j < i; j++) {
		jparms[j] = parms[j];
	}
	return jparms;
};

RSUtils.findId = function(itms,name) {
	for (var i = 0; i < itms.length; i++) {
		if (itms[i].name == name)
		{
			for (var j = 0; j < itms[i].links.length; j++) {
				if (itms[i].links[j].rel == "self") {
					var sLink = itms[i].links[j].href;
					var ind = sLink.lastIndexOf("/");
					return sLink.substring(ind+1);
					
				}
			}
		}
	}
	return "";
};

RSUtils.findResourceUID = function(itms,name) {
	for (var i = 0; i < itms.length; i++) {
		if (itms[i].resource_uid == name)
		{
			for (var j = 0; j < itms[i].links.length; j++) {
				if (itms[i].links[j].rel == "self") {
					var sLink = itms[i].links[j].href;
					var ind = sLink.lastIndexOf("/");
					return sLink.substring(ind+1);
					
				}
			}
		}
	}
	return "";
};

RSUtils.filterByName = function(retVal, name) {
	
	if (retVal.startsWith("[")) {
		retVal = "var items = " + retVal;
	} else {
		var items = [];
		return items;
	}
	eval(retVal);
	var outitems = [];
	var j = 0;
	for (var i = 0; i < items.length; i++) {
		if (items[i].name == name) {
			outitems[j] = items[i];
			j++;
		}
	}
	return outitems;
	
};

RSUtils.findHref = function(links,rel) {
	for (var i = 0; i < links.length; i++) {
		if (links[i].rel == rel)
		{
			return links[i].href;
		}
	}
	return "";
};

RSUtils.findItems = function(links,rel, httpClient) {
	var parms = [];
	var jparms = RSUtils.convertParms(parms);
	for (var i = 0; i < links.length; i++) {
		if (links[i].rel == rel)
		{
			var sLink = links[i].href;
			var ok = httpClient.doGet(RSUtils.HOST + sLink, jparms);
			if (ok.startsWith("[")) {
				var ok = "var items = " + ok;
				eval(ok);
				return items;
			}
		}
	}
	var items = [];
	return items;
};

RSUtils.findItem = function(link, httpClient, view) {
	var parms = [];
	var i = 0;
	if (view) 
		parms[i++] = "filter[]=view==" + view;
	var jparms = RSUtils.convertParms(parms);
	var ok = httpClient.doGet(RSUtils.HOST + link, jparms);
	if (ok.startsWith("{")) {
		var ok = "var item = " + ok;
		eval(ok);
		return item;
	}
	var item;
	return item;
};

RSUtils.findItemsWithLink = function(link, httpClient, view) {
	var parms = [];
	var i = 0;
	if (view) 
		parms[i++] = "filter[]=view==" + view;
	var jparms = RSUtils.convertParms(parms);
	var ok = httpClient.doGet(RSUtils.HOST + link, jparms);
	if (ok.startsWith("[")) {
		var ok = "var items = " + ok;
		eval(ok);
		return items;
	}
	var items = [];
	return items;
};

RSUtils.findHrefId = function(links,rel) {
	for (var i = 0; i < links.length; i++) {
		if (links[i].rel == rel)
		{
			var sLink = links[i].href;
			var ind = sLink.lastIndexOf("/");
			return sLink.substring(ind+1);
		}
	}
	return "";
};
RSUtils.deleteItems = function(items, httpClient) {
	var parms = [];
	var jparms = RSUtils.convertParms(parms);
	
	for (var i = 0; i < items.length; i++) {
		for (var j = 0; j < items[i].links.length; j++) {
			if (items[i].links[j].rel == "self") {
				var sLink = items[i].links[j].href;
				var ok = httpClient.doDelete(RSUtils.HOST + sLink, jparms);
				if (ok.trim() != "ok")
					return "Failed";
			}
		}
	}
	return "ok";
};

RSUtils.splitParms = function(parm) {
	var retVal = [];
	var i = parm.indexOf("=");
	retVal[0] = parm.substring(0, i);
	retVal[1] = parm.substring(i + 1);
	return retVal;
	
};

RSUtils.HOST = "https://us-3.rightscale.com";	
		
