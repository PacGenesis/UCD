importPackage(com.avnet.urbancode.cloud.http);
load("./scripts/RSOAuth.js");
load("./scripts/RSUtils.js", "./scripts/RSNetworks.js");
load("./scripts/RSExecution.js", "./scripts/RSServers.js");
load("./scripts/RSVolumes.js");

testCreateServer = function() {
	var System = java.lang.System;
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth("bd49e3a0eba2ddefc6d0d5f5e78f12ca9835362c", httpClient);
	oAuthO.updateHttpClient();
	var serverTemplates = new RSServerTemplates(httpClient);
	var st_id = serverTemplates.id("Base ServerTemplate for Windows (v13.5)");
	print(st_id);
	var clouds = new RSClouds(httpClient);
	var cloud_id = clouds.id("EC2 us-east-1");
	var rsSecurityGroups = new RSSecurityGroups(httpClient);
	var sg_id = rsSecurityGroups.id("default", cloud_id);
	var rsDeployments = new RSDeployments(httpClient);
	var deployment_id = rsDeployments.id("AWS Test");
	
	var rsServers = new RSServers(httpClient);
	rsServers.create("Test", "A testing server", deployment_id, cloud_id, st_id, sg_id, undef, undef, inputs);

	var server_id = rsServers.id("Test");

	rsServers.launch(server_id);
};

testTerminateServer = function() {
	var System = java.lang.System;
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth("bd49e3a0eba2ddefc6d0d5f5e78f12ca9835362c", httpClient);
	oAuthO.updateHttpClient();
	var serverTemplates = new RSServerTemplates(httpClient);
	var st_id = serverTemplates.id("Base ServerTemplate for Windows (v13.5)");
	print(st_id);
	var clouds = new RSClouds(httpClient);
	var cloud_id = clouds.id("EC2 us-east-1");
	var rsSecurityGroups = new RSSecurityGroups(httpClient);
	var sg_id = rsSecurityGroups.id("default", cloud_id);
	var rsDeployments = new RSDeployments(httpClient);
	var deployment_id = rsDeployments.id("AWS Test");
	
	var rsServers = new RSServers(httpClient);
	rsServers.create("Test", "A testing server", deployment_id, cloud_id, st_id, sg_id, undef, undef, inputs);

	var server_id = rsServers.id("Test");

	rsServers.launch(server_id);
};

testChangeSecurityGroup = function() {
	var System = java.lang.System;
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth("bd49e3a0eba2ddefc6d0d5f5e78f12ca9835362c", httpClient);
	oAuthO.updateHttpClient();
	var clouds = new RSClouds(httpClient);
	var cloud_id = clouds.id("EC2 us-east-1");
	var networks = new RSNetworks(httpClient);
	var network_id = networks.id("EC2-Classic", cloud_id);
	var sg = new RSSecurityGroups(httpClient);
	var sg_id = sg.id("default", cloud_id, network_id);
	if (!sg_id) {
		print("Unable to retrieve security group by name.");
		System.exit(1);
		
	}
	
	var servers = new RSServers(httpClient);
	var sg_ids = [];
	sg_ids[0] = sg_id;
	var ok = servers.changeSecurityGroup("Test", cloud_id, sg_ids);

};

testChangeSecurityGroup();
quit();