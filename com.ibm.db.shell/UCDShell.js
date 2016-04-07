/**
 * 
 */
importPackage(java.io);
var System = java.lang.System;
var args = arguments;
var pd = args[3];
try {
	load(pd + "/scripts/UCDPluginTool.js");
	
	var pluginTool = new UCDPluginTool(args[1], args[2]);
	var props = pluginTool.getStepProperties();
	var jobName = props["name"];
	print("Job name = " + jobName);
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();