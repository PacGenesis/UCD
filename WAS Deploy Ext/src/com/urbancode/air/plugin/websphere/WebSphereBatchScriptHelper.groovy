/*
* Licensed Materials - Property of IBM Corp.
* IBM UrbanCode Build
* IBM UrbanCode Deploy
* IBM UrbanCode Release
* IBM AnthillPro
* (c) Copyright IBM Corporation 2002, 2013. All Rights Reserved.
*
* U.S. Government Users Restricted Rights - Use, duplication or disclosure restricted by
* GSA ADP Schedule Contract with IBM Corp.
*/
package com.urbancode.air.plugin.websphere;

public class WebSphereBatchScriptHelper extends WebSphereCmdLineHelper {

    def libFile = new File(scriptsDir, "wsadminLib.jython");
    def scriptFile;
    def batch= false;

    public WebSphereBatchScriptHelper(def props) {
        super(props);
        scriptFile = new File(props['scriptFile'])
        batch = Boolean.valueOf(props['batch'])
    }
   
    public void execute(def command) {
        if (!scriptFile.isFile()) {
            println "Beginning batch script...";
            scriptFile.append("import sys")
            scriptFile << '\nexecfile(\"' + libFile.absolutePath.replace("\\", "\\\\") + '\")';
            scriptFile << '\ntry:'
        }
        println "Writing command to script";
        println command
        scriptFile.append("\n    " + command);
        if (!batch) {
            commitAndRun();
        }
    }

    public void commitAndRun() {
        def exitCode = 0;
        try {
            //we need to 1) commit 2) handle exceptions ourselves because otherwise websphere will emit a bunch of crap we don't care about instead of the actual exception
            //we only except ADWError to avoid hiding information about exceptions we don't understand
            scriptFile.append("\n    AdminConfig.save()");
            scriptFile.append("\nexcept ADWError, err:")
            scriptFile.append("\n    print err")
            scriptFile.append("\n    sys.exit(1)")
            println "Running Script";
            println "********************************************"
            println scriptFile.getText()
            println "********************************************"
            runWSAdminScript(scriptFile.absolutePath, "Run Script") { it ->
                exitCode = it;
            }
        }
        finally {
            scriptFile.delete();
        }
        System.exit(exitCode);
    }
}
