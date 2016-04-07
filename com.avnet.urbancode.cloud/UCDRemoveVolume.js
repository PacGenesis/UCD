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
var device = props.get("device");
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
		print("Server not found by name : " + serverName);
		System.exit(1);
	}
	
	var server = servers.show(server_id);
	
	var volumeName;
	volumeName = servers.findVolumeName(device, server_id);
	
	ok = servers.removeVolume(server_id, device);
	if (ok != "ok") {
		print("Failed to remove volume from device :  " + device);
		System.exit(1);
	}
	
	if (volumeName) {
		var cloud_id = RSUtils.findHrefId(server.next_instance.links, "cloud");
		var vols = new RSVolumes(httpClient);
		var bok = vols.blockForStateChange(cloud_id, volumeName, "available", 50, 15000);
		if (bok != "ok") {
			print("Failed to make volume 'available' :  " + volumeName);
			pluginTool.setOutputProperty("reason", "Failed to make volume 'available'.  Server must be in an active state.");
			System.exit(1);
		}
	}
	
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();