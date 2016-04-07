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
var blockToState = "booting";
if (!props.get("blockToState").empty) {
	blockToState = "" + props.get("blockToState");
}
var bootDelay;
if (!props.get("bootDelay").empty) {
	bootDelay = "" + props.get("bootDelay");
}
try {
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth(refreshToken, httpClient);
	var oaok = oAuthO.updateHttpClient();
	if (oaok != "ok") {
		print("Unable to authenticate to RightScale server.");
		System.exit(1);
	}
	var servers = new RSServers(httpClient);

	var server_id = servers.id(serverName);
	if (!server_id) {
		print("Failed to access server : " + serverName);
		System.exit(1);
		
	}
	
	if (bootDelay) {
		bootDelay = bootDelay * 1000;
		var Thread = java.lang.Thread;
		var currentThread = Thread.currentThread();
		currentThread.sleep(bootDelay);
	}
	
	var ok = servers.start(server_id);
	if (ok != "ok") {
		print("Failed to start instance : " + serverName);
		System.exit(1);
	}
	
	if (blocking == true) {
		ok = servers.blockForStateChange(server_id, blockToState, 200, 15000);
		if (ok != "ok") {
			print("Instance failed to launch in block polling event loop with instance : " + serverName);
			System.exit(1);
		}
	}
	
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();