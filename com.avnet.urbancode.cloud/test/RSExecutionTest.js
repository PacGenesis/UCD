testCreateRightScript = function() {
	importPackage(com.avnet.urbancode.cloud.http);
	load("./scripts/RSOAuth.js");
	load("./scripts/RSUtils.js", "./scripts/RSExecution.js");
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth("bd49e3a0eba2ddefc6d0d5f5e78f12ca9835362c", httpClient);
	oAuthO.updateHttpClient();
	
	var rss = new RSRightScript(httpClient);
	var ok = rss.create("test2", "build it", "test");
};

testExecuteRightScript = function() {
	importPackage(com.avnet.urbancode.cloud.http);
	load("./scripts/RSOAuth.js");
	load("./scripts/RSUtils.js", "./scripts/RSExecution.js", "./scripts/RSServers.js");
	var httpClient = new RightScaleHttpClient();
	var oAuthO = new RSOAuth("bd49e3a0eba2ddefc6d0d5f5e78f12ca9835362c", httpClient);
	oAuthO.updateHttpClient();
	
	var rss = new RSRightScript(httpClient);
	var sid = rss.id("SYS Set admin account (v13.5)");
	
	var servers = new RSServers(httpClient);
	var server_id = servers.id("Test5");
	var inputs = [];
	var val = servers.runScript(server_id, sid, inputs, true);
	print(val);
};

testExecuteRightScript();
