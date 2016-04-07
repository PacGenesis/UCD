function RSInstances(httpClient) {
	this.httpClient = httpClient;
}

RSInstances.prototype = {
	update : function(instance_id, cloud_id, newinstancename, sg_ids, instancetype_id, st_id, subnet_ids) {
		var parms = [];
		var i = 0;
		if (newinstancename)
			parms[i++] = "instance[name]=" + newinstancename;
//		if (volume_ids) {
//			var vas = new RSVolumeAttachments(this.httpClient);
//			var vasok = vas.destroy(cloud_id, instance_id);
//			if (vasok != ok) {
//				return "Failed";
//			}
//			for (var j = 0; j < volume_ids.length; j++) {
//				vasok = vas.create(cloud_id, instance_id, volume_ids[j]);
//				if (vasok != ok) {
//					return "Failed";
//				}
//			}
//		}
		if (sg_ids) {
			for (var j = 0; j < sg_ids.length; j++) {
				parms[i++] = "instance[security_group_hrefs][]=/api/clouds/" + cloud_id + "/security_groups/" + sg_ids[j];
			}
		}
		if (subnet_ids) {
			
			for (var j = 0; j < subnet_ids.length; j++) {
				parms[i++] = "instance[subnet_hrefs][]=/api/clouds/" + cloud_id + "/subnets/" + subnet_ids[j];
			}
			
		}
		if (instancetype_id) {
			parms[i++] = "instance[instance_type_href]=/api/clouds/" + cloud_id + "/instance_types/" + instancetype_id;
			
		}
		if (st_id) {
			parms[i++] = "instance[server_templated_href]=/api/clouds/" + cloud_id + "/server_templates/" + st_id;
			
		}
		
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPut(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + instance_id, jparms);
		return ok;
	},
	
	list : function(name, cloud_id) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances.json", jparms);
		return RSUtils.filterByName(ok, name);
	},
	
	show : function(instance_id, cloud_id) {
		var parms = [];
		parms[0] = "view=full";
		
		var jparms = RSUtils.convertParms(parms);
		var ok = "var insts = " + this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + instance_id + ".json", jparms);
		eval(ok);
		return insts;
	},
	
	id : function(name, cloud_id)	{
		var insts = this.list(name, cloud_id);
		
		return RSUtils.findId(insts,name);
		
	},
	
	start : function(id, cloud_id) {
		var parms = java.lang.reflect.Array.newInstance(java.lang.String, 0);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + id + "/start.json", parms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	},

	
	stop : function(id, cloud_id) {
		var parms = java.lang.reflect.Array.newInstance(java.lang.String, 0);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + id + "/stop.json", parms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	},
	
	launch : function(id, cloud_id, inputs) {
		var i = 0;
		var parms = [];
		if (inputs) {
			for (var j = 0; j < inputs.length; j++) {
				var args = inputs[j].split("=");
				parms[i++] = "inputs[][name]=" + args[0];
				parms[i++] = "inputs[][value]=" + args[1];
			}
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + id + "/launch.json", jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	},
	
	launchWithId : function(id, cloud_id, inputs) {
		var i = 0;
		var parms = [];
		if (inputs) {
			for (var j = 0; j < inputs.length; j++) {
				var args = inputs[j].split("=");
				parms[i++] = "inputs[][name]=" + args[0];
				parms[i++] = "inputs[][value]=" + args[1];
			}
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + id + "/launch.json", jparms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	},
	
	terminate : function(id, cloud_id) {
		var parms = java.lang.reflect.Array.newInstance(java.lang.String, 0);
		var ok = this.httpClient.doPost(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + id + "/terminate.json", parms);
		if (ok.trim() == "") {
			return "ok";
		} else {
			return "Failed";
		}
		
	},
	
	runExecutable : function(runscript_id, inparms, cloud_id, instance_id) {
//		-d right_script_href=/api/right_scripts/$RIGHTSCRIPT \
//		-d inputs[][name]="DNS_DOMAIN_ID" \
//		-d inputs[][value]="text:9623906" \
//		-d inputs[][name]="DNS_RECORD_ID" \
//		-d inputs[][value]="text:ExampleRightAPI" \
//		-d inputs[][name]="RACKSPACE_API_TOKEN" \
//		-d inputs[][value]="cred:RACKSPACE_AUTH_KEY" \
//		-d inputs[][name]="DNS_RECORD_IP" \
//		-d inputs[][value]="text:public" \
//		-d inputs[][name]="RAX_REGION" \
//		-d inputs[][value]="text:ORD(Chicago)" \
		var parms = [];
		var i = 0;
		parms[i++] = "right_script_href=/api/right_scripts/" + runscript_id;
		for (var j = 0; j < inparms.length; j++) {
			var args = inparms[j].split("=");
			parms[i++] = "inputs[][name]=" + args[0];
			parms[i++] = "inputs[][value]=" + args[1];
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doPostReturnLocation(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + instance_id + "/run_executable.json", jparms);
		if (ok.trim().startsWith("/api")) {
			return ok;
		} else {
			return "Failed";
		}
	},
	
	multiRunExecutable : function(recipe_id, inparms, cloud_id, instance_id) {
		
	},
	
	rootDrive : function(instance) {
		var drives = RSUtils.findItems(instance.links, "volume_attachments", this.httpClient);
		for (var i = 0; i < drives.length; i++) {
			if (drives[i].device == "/dev/sda1") {
				var result = drives[i].resource_uid;
				var results = result.split(":");
				return results[0];
			}
		}
		return "";
	}
};

function RSRightScript(httpClient) {
	this.httpClient = httpClient;
}

RSRightScript.prototype = {
	list : function(name) {
		var parms = [];
		if (name) {
			parms[0] = "filter[]=name==" + name;
		}
		var jparms = RSUtils.convertParms(parms);
		var ok = this.httpClient.doGet(RSUtils.HOST + "/api/right_scripts.json", jparms);
		return RSUtils.filterByName(ok, name);
	},
	
	id : function(name)	{
		var items = this.list(name);
		
		return RSUtils.findId(items, name);
		
	}		
};

function RSRunnableBindings(httpClient) {
	this.httpClient = httpClient;
}

RSRunnableBindings.prototype = {
		
		list : function(servertemplate_id) {
			var parms = [];
			var jparms = RSUtils.convertParms(parms);
			var ok = "var items = " + this.httpClient.doGet(RSUtils.HOST + "/api/server_templates/" + servertemplate_id + "/runnable_bindings.json", jparms);
			eval(ok);
			return items;
			
		}
		
};

function RSInputs(httpClient) {
	this.httpClient = httpClient;
}

RSInputs.prototype = {
		
		list : function(instance_id, cloud_id) {
			var parms = [];
			var jparms = RSUtils.convertParms(parms);
			var ok = "var items = " + this.httpClient.doGet(RSUtils.HOST + "/api/clouds/" + cloud_id + "/instances/" + instance_id + "/inputs.json", jparms);
			eval(ok);
			return items;
			
		}
		
};

function RSTasks(httpClient) {
	this.httpClient = httpClient;
}

RSTasks.prototype = {
		
		blockForStateChange : function(link, state, count, sleeptime) {
			var Thread = java.lang.Thread;
			var currentThread = Thread.currentThread();
			var j = 0;
			var ok = "Failed";
			while (j < count) {
				var task = RSUtils.findItem(link, this.httpClient, "extended");
				var sstate = new java.lang.String(task.summary);
				if (sstate.startsWith(state)) {
					ok = "ok";
					break;
				}
				currentThread.sleep(sleeptime);
				j++;
			}
			return ok;
			
		}
		
};
/** Test
importPackage(com.avnet.urbancode.cloud.http);
load("./scripts/RSOAuth.js");
load("./scripts/RSUtils.js", "./scripts/RSServers.js");
var httpClient = new RightScaleHttpClient();
var oAuthO = new RSOAuth("bd49e3a0eba2ddefc6d0d5f5e78f12ca9835362c", httpClient);
oAuthO.updateHttpClient();
var rsClouds = new RSClouds(httpClient);
var cloud_id = rsClouds.id("EC2 us-east-1");

var rsInstances = new RSInstances(httpClient);
if (cloud_id)
	var ok = rsInstances.launch("Test", cloud_id);
*/
