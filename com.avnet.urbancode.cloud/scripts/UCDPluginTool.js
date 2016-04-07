importClass(java.io.FileInputStream);
importClass(java.io.FileOutputStream);
importClass(java.util.Properties);

function UCDPluginTool (inFile, outFile) {
	this.outProps = new Properties();
	this.inPropsFile = inFile;
	this.outPropsFile = outFile;
}

UCDPluginTool.prototype = {

     getStepProperties : function() {
        var props = new Properties();
        var inputPropsFile = this.inPropsFile;
        var inputPropsStream = null;
        try {
            inputPropsStream = new FileInputStream(inputPropsFile);
            props.load(inputPropsStream);
        }
        catch (e) {
            throw new RuntimeException(e);
        }
        finally {
        	if (inputPropsStream)
        		inputPropsStream.close();
        }
        return props;
    },

    setOutputProperty : function(name, value) {
        this.outProps.setProperty(name, value);
    },

   setOutputProperties : function() {
        outputPropsStream = null;
        try {
            outputPropsStream = new FileOutputStream(this.outPropsFile);
            this.outProps.store(outputPropsStream, "");
        }
        finally {
            if (outputPropsStream != null) {
                outputPropsStream.close();
            }   
        }
    },

    getAuthToken : function() {
        authToken = System.getenv("AUTH_TOKEN");
        return "{\"token\" : \"" + authToken + "\"}";
    },

    getAuthTokenUsername : function() {
        return "PasswordIsAuthToken";
    },

    storeOutputProperties : function() {
        this.setOutputProperties();
    }
};

/* Test
var pluginTool = new UCDPluginTool("./inProps.properties", "./outProps.properties");
var stepProps = pluginTool.getStepProperties();
print(stepProps["test1"]);

pluginTool.setOutputProperty("test3", "an output property 3");

pluginTool.storeOutputProperties();
*/
