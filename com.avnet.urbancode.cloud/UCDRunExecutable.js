/**
 * 
 */
importPackage(com.avnet.urbancode.cloud.http);
importPackage(java.io);
var System = java.lang.System;
var args = arguments;
var pd = args[2];
load(pd + "/scripts/RSOAuth.js", pd + "/scripts/RSUtils.js", pd + "/scripts/RSNetworks.js", pd + "/scripts/UCDPluginTool.js");
load(pd + "/scripts/RSServers.js");
load(pd + "/scripts/RSExecution.js");
load(pd + "/scripts/RSVolumes.js");

var pluginTool = new UCDPluginTool(args[0], args[1]);
var props = pluginTool.getStepProperties();
var refreshToken = props.get("refreshToken");
var serverName = props.get("serverName");
var blocking = false;
if (!props.get("blocking").empty && props.get("blocking").equals("true")) {
	blocking = true;
}
var executableScriptName = props.get("executableScriptName");
var inputs;
if (!props.get("inputs").empty) {
	inputs = props.get("inputs");
}
try {
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth(refreshToken, httpClient);
	var oaok = oAuthO.updateHttpClient();
	if (oaok != "ok") {
		print("Unable to authenticate to RightScale server.");
		System.exit(1);
	}
	
	
	
	var inInputs = [];
	if (inputs) {
		var isr = new StringReader(inputs);
		var br = new BufferedReader(isr);
		var line;
		var i = 0;
		while (true) {
			line = br.readLine();
			if (line == null) break;
			inInputs[i] = line.trim();
			i++;
		}
	}
	
	var servers = new RSServers(httpClient);
	var server_id = servers.id(serverName);
	if (!server_id) {
		print("Failed to access server : " + serverName);
		System.exit(1);
		
	}
	
	var rss = new RSRightScript(httpClient);
	var rightscript_id = rss.id(executableScriptName);
	if (!rightscript_id) {
		print("Failed to find right script : " + executableScriptName);
		System.exit(1);
		
	}
	
	ok = servers.runScript(server_id, rightscript_id, inInputs, blocking);
	if (ok == "Failed") {
		print("Failed to execute script : " + executableScriptName);
		System.exit(1);
	}
	
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();