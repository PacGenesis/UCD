/**
 * 
 */
importPackage(java.net);
importPackage(com.urbancode.ud.client)
var System = java.lang.System;
var args = arguments;
var pd = args[3];
try {
	load(pd + "/scripts/UCDPluginTool.js");
	load(pd + "/scripts/ControlMDefFileHandler.js");
	var pluginTool = new UCDPluginTool(args[1], args[2]);
	var props = pluginTool.getStepProperties();
	var basePath = props["basePath"];
	var username = "PasswordIsAuthToken";
	var tok = System.getenv("AUTH_TOKEN");
	var jparms = java.lang.reflect.Array.newInstance(java.lang.Object, 1);
	jparms[0] = tok;
    var password = java.lang.String.format("{\"token\": \"%s\"}", jparms);
    var webUrl = System.getenv("AH_WEB_URL");
    var url = new URI(webUrl);
    var appClient = new DBApplicationClient(url, username, password);
    if (!appClient) {
    	log("Failed to get access to uDeploy Application Client");
    	System.exit(1);
    }
    var propClient = new DBPropertyClient(url, username, password);
    if (!propClient) {
    	log("Failed to get access to uDeploy Property Client");
    	System.exit(1);
    }
	var versionHandler = new ControlMDefFileHandler(basePath, controlMApplicationName, componentName, appClient, propClient);
	versionHandler.process();
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();