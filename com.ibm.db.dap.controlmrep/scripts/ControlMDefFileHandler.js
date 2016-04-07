// spanDir - a directory traversal function for
// Rhino JavaScript
// Copyright 2010 by James K. Lawless
// See MIT/X11 license at 
// http://www.mailsend-online.com/wp/license.php

importPackage(java.io);
importPackage(com.urbancode.ud.client);
importPackage(java.net);
importPackage(java.nio.charset);
importPackage(java.nio.file);
importPackage(java.nio.file.attribute);
var Boolean = java.lang.Boolean;

function ControlMDefFileHandler(baseDir, applicationName, componentName,
		componentClient, versionClient) {
	this.dir = baseDir;
	this.applicationName = applicationName;
	this.componentName = componentName;
	this.componentClient = componentClient;
	this.versionClient = versionClient;
	this.versions = this.componentClient.getComponentVersions(componentName,
			Boolean.valueOf(true));
}
// spanDir() accepts two parameters
// The first is a string representing a directory path
// The second is a closure that accepts a parameter of type
// java.io.File
ControlMDefFileHandler.prototype = {
	process : function() {
		this.spanDir(this.dir);
	},
	spanDir : function(adir) {
		var lst = new File(adir).listFiles();
		var i;
		for (i = 0; i < lst.length; i++) {
			// If it's a directory, recursive call spanDir()
			// so that we end up doing a scan of
			// the directory tree
			if (lst[i].isDirectory()) {
				this.spanDir(lst[i].getAbsolutePath());
			}
			// Pass the File object to the handler that
			// the caller has specified regardless of whether
			// the File object is a directory.
			this.processXml(lst[i]);
		}
	},
	processXml : function(fil) {
		var nam = fil.getAbsolutePath();
		if (!fil.isDirectory()) {
			if (nam.toLowerCase().endsWith(".zip")
					&& nam.indexOf(this.applicationName) > -1) {
				var version = this.getVersion(nam,fil);
				if (!this.versions.contains(version)) {
					this.executeUpdateVersion(fil, version);
				}
			}
		}

	},
	getVersion : function(nam, fil) {
		var p = Paths.get(nam);
		var sName = fil.getName();
		var view = Files.getFileAttributeView(p, BasicFileAttributeView)
				.readAttributes();
		var sName = sName.substring(0, sName.indexOf(".zip"));
		return sName + "_" + view.lastModifiedTime();

	},
	executeUpdateVersion : function(fil, version) {
		var versionId = versionClient.createVersion(componentName, version, "")
				.toString();
		// addVersionFiles(String component, String version, File base, String
		// offset, String[] includes, String[] excludes, boolean
		// saveExecuteBits, boolean verbose)
		var includes = [];
		var nam = fil.getName();
		includes[0] = nam;
		var jincludes = UCDPluginTool.convertParms(includes);
		var novals = [];
		var jnovals = UCDPluginTool.convertParms(novals);
		var fDir = new File(this.dir);
		versionClient.addVersionFiles(componentName, version, fDir, ".",
				jincludes, jnovals, true, true);
	}

};
