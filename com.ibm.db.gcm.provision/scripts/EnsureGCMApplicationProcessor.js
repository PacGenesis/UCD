
importPackage(java.io);
importPackage(com.urbancode.ud.client);
importPackage(java.net);
importPackage(java.nio.charset);
importPackage(java.nio.file);
importPackage(java.nio.file.attribute);
importPackage(com.urbancode.commons.util);
var Boolean = java.lang.Boolean;

function EnsureGCMApplicationProcessor(applicationClient, propertyClient) {
	this.applicationClient = applicationClient;
	this.propertyClient = propertyClient;
}

EnsureGCMApplicationProcessor.prototype = {
	process : function() {
		this.spanApplications();
	},
	spanApplications : function() {
		var jsonStr = String(this.applicationClient.getAllApplications());
		var apps = JSON.parse(jsonStr);
		for (var i = 0; i < apps.length; i++) {
			var name = apps[i].name;
			var appStr = this.applicationClient.getApplicationData(new java.lang.String(name));
			print(appStr);
			var app = JSON.parse(appStr);
			var appAllStr = this.applicationClient.getApplicationAllData(app.id);
			this.ensureGCMProperties(JSON.parse(appAllStr));
			var procsStr = this.applicationClient.getApplicationProcesses(app.id);
			var processes = JSON.parse(procsStr);
			for (var j = 0; j < processes.length; j++) {
				print(JSON.stringify(processes[j]));
				var procData = this.applicationClient.getApplicationProcessData(processes[j].id, processes[j].version);
				print(procData);
				var proc = JSON.parse(procData);
				this.ensureGCM(proc);
			}
		}
	},
	ensureGCMProperties : function(app) {
		
		if (!this.hasNARIDProperty(app)) {
			var name = app.name;
			var narid = "";
			var vals = name.split("]");
			if (vals.length == 2)
			{
				narid = vals[0].substr(1);
			}
			var prop = {"name":"application.nar.id","description":"","secure":"false","value":narid};
			var path = app.propSheet.path
			while (path.indexOf("/") != -1) {
				path = path.replace("/", "&")
				
			}
			var version = app.propSheet.version;
			this.propertyClient.saveProperty(path, version, 
					JSON.stringify(prop))
		}
		
		var envsStr = this.applicationClient.getApplicationEnvironmentsData(app.id);
		var envs = JSON.parse(envsStr);
		
		envs = envs.filter(this.hasREQIRESGCMProperty(env))
		for (var i = 0; i < envs.length; i++) {
				var envName = new java.lang.String(envs[i].name);
				var required = false;
				if (envName.toLowerCase().startsWith("prod")) required = true;
				var prop = {"name":"requires.gcm","description":"","secure":"false","value":required};
				var path = envs[i].propSheet.path
				while (path.indexOf("/") != -1) {
					path = path.replace("/", "&")
					
				}
				var version = envs[i].propSheet.version;
				this.propertyClient.saveProperty(path, version, JSON.stringify(prop))
				
		}
		
	},
	hasREQIRESGCMProperty : function(env) {
		var path = env.propSheet.path;
		path = path.replace("/", "&")
		path = path.replace("/", "&")
		path = path.replace("/", "&")
		var aversion = env.propSheet.version;
		var propsStr = this.propertyClient.getPropertiesData(path, aversion);
		var props = JSON.parse(propsStr);
		var properties = props.properties;
		return properties.some( function(prop) {
			return properties[i].name == "requires.gcm";
		});
	},
	
	hasNARIDProperty : function(app) {
		var path = app.propSheet.path;
		path = path.replace("/", "&")
		path = path.replace("/", "&")
		var aversion = app.propSheet.version;
		var propsStr = this.propertyClient.getPropertiesData(path, aversion);
		var props = JSON.parse(propsStr);
		var properties = props.properties;
		for (var i = 0; i < properties.length; i++ ) {
			if (properties[i].name == "application.nar.id") {
				return true;
			}
		}
		return false;
	},
	
	ensureGCM : function(process) {
		
		if (!this.hasGCM(process)) {
			var gcm = this.getGCMStep();
			process.rootActivity.children.push(gcm);
			var version = process.version;
			delete process.version;
			delete process.versionCount;
			this.ensureEdge(process, gcm);
			this.ensureOffset(process, gcm);
			var root = process.rootActivity;
			delete root.id;
			delete root.name;
			var out = JSON.stringify(root);
			print("app activities = " + out);
			this.applicationClient.saveApplicationProcess(process.id, out, "" + version);
			
		}
	},
	
	ensureEdge : function(process, gcm) {
		var startEdge = this.getStartingEdge(process);
		var nEdge = { to : gcm.name, type :"ALWAYS" };
		startEdge.from = gcm.name;
		startEdge.type = "SUCCESS";
		var outEdges = [];
		outEdges[0] = nEdge;
		for (var i = 1; i <= process.rootActivity.edges.length; i++ ) {
			outEdges[i] = process.rootActivity.edges[i-1];
			delete outEdges[i].value;
		}
		process.rootActivity.edges = outEdges;
	},
	
	ensureOffset : function(process, gcm) {
		var offset = {
			"name": "Validate GCM",
			"x": 100,
			"y": 0,
			"h": 60,
			"w": 180
		};
		process.rootActivity.offsets.push(offset);
	},
	
	getStartingEdge : function(process) {
		for (var i = 0; i < process.rootActivity.edges.length; i++)
		{
			var edge = process.rootActivity.edges[i];
			if (edge.type == "ALWAYS") {
				return edge;
			}
		}
		return false;
		
	}, 
	hasGCM : function(process) {
		for (var i = 0; i < process.rootActivity.children.length; i++)
		{
			var child = process.rootActivity.children[i];
			if (child.name == "Validate GCM") {
				return true;
			}
		}
		return false;
	},
	
	getGCMStep : function() {
		return {
			"processName": "Validate GCM",
			"resourcePath": "${p:resource.path}",
			"properties": {
				
			},
			"type": "runProcess",
			"name": "Validate GCM",
			"children": []
		};

	}
	
};
