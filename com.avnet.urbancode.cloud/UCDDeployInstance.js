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
var optimized = false;
if (!props.get("optimized").empty && props.get("optimized").equals("true")) {
	optimized = true;
}
var description;
if (!props.get("description").empty) {
	description = props.get("description");
}
var cloudName = props.get("cloudName");
var deploymentName = props.get("deploymentName");
var serverTemplateName = props.get("serverTemplateName");
var securityGroupName;
if (!props.get("securityGroupName").empty) {
	securityGroupName = props.get("securityGroupName");
}
var networkName;
if (!props.get("networkName").empty) {
	networkName = props.get("networkName");
}
var subnetNames;
if (!props.get("subnetNames").empty) {
	subnetNames = props.get("subnetNames");
}
var multiCloudImageName;
if (!props.get("multiCloudImageName").empty) {
	multiCloudImageName = props.get("multiCloudImageName");
}
var instanceTypeName;
if (!props.get("instanceTypeName").empty) {
	instanceTypeName = props.get("instanceTypeName");
}
var sshKeyName;
if (!props.get("sshKeyName").empty) {
	sshKeyName = props.get("sshKeyName");
}
var ipAddressName;
if (!props.get("ipAddressName").empty) {
	ipAddressName = props.get("ipAddressName");
}
var dataCenterName;
if (!props.get("dataCenterName").empty) {
	dataCenterName = props.get("dataCenterName");
}
var inputs;
if (!props.get("inputs").empty) {
	inputs = props.get("inputs");
}
var blockToState = "operational";
if (!props.get("blockToState").empty) {
	blockToState = "" + props.get("blockToState");
}
var blockingTimeout;
if (!props.get("blockingTimeout").empty) {
	blockingTimeout = "" + props.get("blockingTimeout");
}
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
		print("Unable to retrieve cloud by name:  " + cloudName);
		System.exit(1);
	}
	var deployments = new RSDeployments(httpClient);
	
	var deployment_id = deployments.id(deploymentName);
	if (!deployment_id) {
		print("Unable to retrieve deployment by name:  " + deploymentName);
		System.exit(1);
	}
	
	var sts = new RSServerTemplates(httpClient);
	st_id = sts.id(serverTemplateName);
	if (!st_id) {
		print("Unable to retrieve server template by name:  " + serverTemplateName);
		System.exit(1);
	}
	
	var network_id;
	if (networkName) {
		var networks = new RSNetworks(httpClient);
		network_id = networks.id(networkName, cloud_id);
		if (!network_id) {
			print("Unable to retrieve network by name:  " + networkName);
			System.exit(1);
		}
	}
	
	var sg_id;
	if (network_id && securityGroupName) {
		var sg = new RSSecurityGroups(httpClient);
		sg_id = sg.id(securityGroupName, cloud_id, network_id);
		if (!sg_id) {
			print("Unable to retrieve security group by name:  " + securityGroupName);
			System.exit(1);
			
		}
	}
	
	var mci_id;
	if (multiCloudImageName) {
		var msis = new RSMultiCloudImages(httpClient);
		mci_id = msis.id(multiCloudImageName);
		if (!mci_id) {
			print("Unable to retrieve multi-cloud image by name:  " + multiCloudImageName);
			System.exit(1);
			
		}
	}
	
	var instancetype_id;
	if (instanceTypeName) {
		var its = new RSInstanceTypes(httpClient);
		instancetype_id = its.id(instanceTypeName, cloud_id);
		if (!instancetype_id) {
			print("Unable to retrieve instance type by name:  " + instanceTypeName);
			System.exit(1);
			
		}
	}
	
	var sshkey_id;
	if (sshKeyName) {
		var sshkeys = new RSSSHKeys(httpClient);
		sshkey_id = sshkeys.id(sshKeyName, cloud_id);
		if (!sshkey_id) {
			print("Unable to retrieve SSH Key by name:  " + instanceTypeName);
			System.exit(1);
			
		}
		
	}
	var datacenter_id;
	if (dataCenterName) {
		var datacenters = new RSDataCenters(httpClient);
		datacenter_id = datacenters.id(dataCenterName, cloud_id);
		if (!datacenter_id) {
			print("Unable to retrieve data center by name:  " + dataCenterName);
			System.exit(1);
			
		}
		
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
	var subnets = [];
	if (subnetNames) {
		var isr = new StringReader(subnetNames);
		var br = new BufferedReader(isr);
		var line;
		var i = 0;
		while (true) {
			line = br.readLine();
			if (line == null) break;
			subnets[i] = line.trim();
			i++;
		}
	}
	
	var servers = new RSServers(httpClient);
	var server_id = servers.id(serverName);
	if (server_id) {
		print("Failed to deploy server. Server already deployed with name : " + serverName);
		System.exit(1);
		
	}
	
	var sg_ids = [];
	sg_ids[0] = sg_id;
	var ok = servers.create(serverName, description, deployment_id, cloud_id, network_id, st_id, sg_id, mci_id, instancetype_id, sshkey_id, optimized, inInputs, subnets, datacenter_id);
	
	
	if (ok != "ok") {
		print("Failed to create server : " + serverName);
		System.exit(1);
	}
	
	server_id = servers.id(serverName);
	if (!server_id) {
		print("Failed to access server : " + serverName);
		System.exit(1);
		
	}
	
	if (ipAddressName) {
		var ipas = new RSIPAddresses(httpClient);
		var ipaddress_id = ipas.id(ipAddressName, cloud_id);
		
		if (!ipaddress_id) {
			print("Failed to access ipaddress : " + ipAddressName);
			System.exit(1);
			
		}
		
		
		var ok = servers.addIPAddress(server_id, ipaddress_id);
		if (ok != "ok") {
			print("Failed to add IPAddress.");
			System.exit(1);
			
		}
	}
	
	ok = servers.launch(server_id, false);
	if (ok != "ok") {
		print("Failed to launch instance : " + serverName);
		System.exit(1);
	}
	
	if (blocking == true) {
		ok = servers.blockForStateChange(server_id, blockToState, 500, 15000, blockingTimeout);
		if (ok != "ok") {
			print("Instance failed to launch in block polling event loop with instance : " + serverName);
			System.exit(1);
		}
		
	}
	
	var server = servers.show(server_id);
	var instance = server.current_instance;
	if (instance) {
		var publicIPAddresses = "" + instance.public_ip_addresses;
		pluginTool.setOutputProperty("publicIPAddresses", "" + publicIPAddresses);
		var privateIPAddresses = "" + instance.private_ip_addresses;
		pluginTool.setOutputProperty("privateIPAddresses", "" + privateIPAddresses);
		var instances = new RSInstances(httpClient);
		var deviceName = instances.rootDrive(instance);
		pluginTool.setOutputProperty("rootDeviceName", deviceName);
		
		var awsInstanceId = instance.resource_uid;
		pluginTool.setOutputProperty("awsInstanceId", awsInstanceId);
		
		pluginTool.storeOutputProperties();
	}
	
} catch (e) {
	print(e.message);
	if (e.javaException) e.javaException.printStackTrace();
	System.exit(1);
}

quit();