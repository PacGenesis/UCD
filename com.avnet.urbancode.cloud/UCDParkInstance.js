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
var stopDelay;
if (!props.get("stopDelay").empty) {
	stopDelay = props.get("stopDelay");
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
	if (stopDelay) {
		stopDelay = bootDelay * 1000;
		var Thread = java.lang.Thread;
		var currentThread = Thread.currentThread();
		currentThread.sleep(stopDelay);
	}
	
	var ok = servers.stop(server_id);
	if (ok != "ok") {
		print("Failed to park instance : " + serverName);
		System.exit(1);
	}
	
	if (blocking == true) {
		var server = servers.show(server_id);
		var cInstance = server.current_instance;
		if (cInstance) {
			ok = servers.blockForStateChange(server_id, "provisioned", 50, 15000);
			if (ok != "ok") {
				print("Instance failed to park in block polling event loop with instance : " + serverName);
				System.exit(1);
			}
		}
	}
	
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();