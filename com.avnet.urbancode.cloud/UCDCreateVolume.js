/**
 * 
 */
importPackage(com.avnet.urbancode.cloud.http);
var System = java.lang.System;
var args = arguments;
var pd = args[2];
load(pd + "/scripts/RSOAuth.js", pd + "/scripts/RSUtils.js", pd + "/scripts/RSNetworks.js", pd + "/scripts/UCDPluginTool.js");
load(pd + "/scripts/RSServers.js");
load(pd + "/scripts/RSVolumes.js");

var pluginTool = new UCDPluginTool(args[0], args[1]);
var props = pluginTool.getStepProperties();
var refreshToken = props.get("refreshToken");
var volumeName = props.get("volumeName");
var size = props.get("size");
var description;
if (!props.get("description").empty)
	description = props.get("description");
var cloudName = props.get("cloudName");
var iops;
if (!props.get("iops").empty)
	iops = props.get("iops");
var volumeType;
if (!props.get("volumeType").empty)
	volumeType = props.get("volumeType");
var volumeSnapshot;
if (!props.get("volumeSnapshot").empty)
	volumeSnapshot = props.get("volumeSnapshot");
var datacenter;
if (!props.get("datacenter").empty)
	datacenter = props.get("datacenter");
try {
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth(refreshToken, httpClient);
	var oaok = oAuthO.updateHttpClient();
	if (oaok != "ok") {
		print("Unable to authenticate to RightScale server.");
		System.exit(1);
	}
	
	
	var clouds = new RSClouds(httpClient);
	
	var cloud_id = clouds.id(cloudName);
	if (!cloud_id) {
		print("Unable to retrieve cloud by name.");
		System.exit(1);
	}
	
	var volumetype_id;
	if (volumeType) {
		var voltypes = new RSVolumeTypes(httpClient);
		volumetype_id = voltypes.id(volumeType, cloud_id);
		if (!volumetype_id) {
			print("Unable to retrieve volume type by name.");
			System.exit(1);
			
		}
	}
	
	var parent_volumesnapshot_id;
	if (volumeSnapshot) {
		var volsnaps = new RSVolumeSnapshots(httpClient);
		parent_volumesnapshot_id = volsnaps.id(volumeSnapshot, cloud_id);
		if (!parent_volumesnapshot_id) {
			print("Unable to retrieve volume snapshot by name.");
			System.exit(1);
			
		}
	}
	
	var datacenter_id;
	if (datacenter) {
		var datacenters = new RSDataCenters(httpClient);
		datacenter_id = datacenters.id(datacenter, cloud_id);
		if (!datacenter_id) {
			print("Unable to retrieve datacenter by name.");
			System.out.flush();
			System.exit(1);
		
		}
	}
	
	var volumes = new RSVolumes(httpClient);
	
	var ok = volumes.create(volumeName, cloud_id, description, size, iops, volumetype_id, parent_volumesnapshot_id, datacenter_id);
	
	if (ok != "ok") {
		print("Failed to create volume : " + volumeName);
		System.exit(1);
	}
	
	var items = volumes.list(volumeName, cloud_id);
	for (var j = 0; j < items.length; j++) {
		pluginTool.setOutputProperty("resourceUID", items[j].resource_uid);
	}
	pluginTool.storeOutputProperties();
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();