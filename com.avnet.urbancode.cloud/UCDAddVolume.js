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
var volumeName = props.get("volumeName");
var device;
if (!props.get("device").empty)
	device = props.get("device");
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
	
	var cloud_id = RSUtils.findHrefId(server.next_instance.links, "cloud");
	
	var vols = new RSVolumes(httpClient);
	var volume_id = vols.id(volumeName, cloud_id);
	if (!volume_id) {
		print("Volume not found with name :  " + volumeName);
		System.exit(1);
	}
	
	ok = servers.addVolume(server_id, volume_id, device);
	if (ok != "ok") {
		print("Failed to add volume :  " + volumeName);
		pluginTool.setOutputProperty("reason", "Failed to add volume.  Server must be in an active state.");
		System.exit(1);
	}
	var cInstance = server.current_instance;
	if (cInstance) {
		var bok = vols.blockForStateChange(cloud_id, volumeName, "in-use", 50, 15000);
		if (bok != "ok") {
			print("Failed to start volume :  " + volumeName);
			pluginTool.setOutputProperty("reason", "Failed to start volume.  Server must be in an active state.");
			System.exit(1);
		}
	}
	
	
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();