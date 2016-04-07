/**
 * 
 */
importPackage(java.io);
var System = java.lang.System;
var args = arguments;
var pd = args[3];
try {
	load(pd + "/scripts/UCDPluginTool.js");
	load(pd + "/scripts/ControlMDefFileHandler.js");
	var pluginTool = new UCDPluginTool(args[1], args[2]);
	var props = pluginTool.getStepProperties();
	var userName = props["userName"];
	var password = props["password"];
	var serverName = props["serverName"];
	var directoryOffest = props["directoryOffest"];
	var cmdName = props["cmdName"];
	var deployHandler = new ControlMDefFileHandler(directoryOffest, userName, password, serverName, cmdName);
	deployHandler.process();
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();