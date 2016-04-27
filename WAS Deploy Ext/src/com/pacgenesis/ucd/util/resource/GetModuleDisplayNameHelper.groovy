package com.pacgenesis.ucd.util.resource

import com.urbancode.air.WebSphereCmdLineHelper

class GetModuleDisplayNameHelper extends WebSphereCmdLineHelper {
	def libFile = new File(scriptsDir, "wsadminLib.jython");
	def scriptFile;
	def appName;

	public GetModuleDisplayNameHelper(def props) {
		super(props);
        scriptFile = new File(props['scriptFile'])
		appName = props["cAppName"]
	}
	
	public String execute(def moduleUri) {
		if (!scriptFile.isFile()) {
			scriptFile.append("import sys")
			scriptFile << '\nexecfile(\"' + libFile.absolutePath.replace("\\", "\\\\") + '\")';
			scriptFile << '\ntry:'
		}
		def command = buildCommand(appName, moduleUri);
        scriptFile.append("\n    " + command);
        def exitCode = 0;
		def retVal = "";
		def results = "";
        try {
            //we need to 1) commit 2) handle exceptions ourselves because otherwise websphere will emit a bunch of crap we don't care about instead of the actual exception
            //we only except ADWError to avoid hiding information about exceptions we don't understand
            scriptFile.append("\nexcept ADWError, err:");
            scriptFile.append("\n    print err");
            scriptFile.append("\n    sys.exit(1)");
            results = runWSAdminScript(scriptFile.absolutePath, "Run Script");
			def reader = new StringReader(results);
			reader.each { line ->
				retVal = line;
			};
        }
        finally {
            scriptFile.delete();
        }
		return retVal
	}
	
	private String buildCommand(def appName, def moduleURI) {
		StringBuilder builder = new StringBuilder();
		builder.append("getModuleDisplayName(")
		.append("\"").append(appName).append("\"").append(",")
		.append("\"").append(moduleURI).append("\"")
		.append(")")
		return builder.toString();
	}
}
