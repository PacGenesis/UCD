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
	while (server_id) {
	
		var ok = "ok";
		var server = servers.show(server_id);
		var cInstance = server.current_instance;
		if (cInstance) {
			ok = servers.terminate(server_id);
			if (ok != "ok") {
				print("Failed to terminate instance : " + serverName);
				System.exit(1);
			}
			ok = servers.blockForStateChange(server_id, "inactive", 200, 15000);
			if (ok != "ok") {
				print("Instance failed to terminate in block polling event loop with instance : " + serverName);
				System.exit(1);
			}
		}
		
		var deployment_id = RSUtils.findHrefId(server.links, "deployment");
		ok = servers.destroy(server_id, deployment_id);
		if (ok != "ok") {
			print("Unable to destroy server :  " + serverName);
			System.exit(1);
		}
		server_id = servers.id(serverName);
	}
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();