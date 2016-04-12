package com.pacgenesis.ucd.util.resource;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;

@SuppressWarnings("deprecation")
public class SetPropertyOnEnvironmentResources {
	static Options ops = new Options();
	public static void buildOptions() {
		ops.addOption(Option.builder("weburi").hasArg().argName("uri").required().desc("UCD URI").build());
		ops.addOption(Option.builder("userid").hasArg().argName("userid").required().desc("user logon id").build());
		ops.addOption(Option.builder("password").hasArg().argName("Password").required().desc("UCD user password").build());
		ops.addOption(Option.builder("application").hasArg().argName("UCDApplication").required().desc("Related UCD Application").build());
		ops.addOption(Option.builder("environment").hasArg().argName("Environment").required().desc("Related UCD Application Environment").build());
		ops.addOption(Option.builder("propertyName").hasArg().argName("PropertyName").required().desc("Resource Property Name").build());
		ops.addOption(Option.builder("propertyValue").hasArg().argName("PropertyValue").required().desc("Resource Property Value").build());
		
	}

	
	public static void main(String[] args) {
		buildOptions();
		
		
		String suri = null;
		String userid = null;
		String password = null;
		String application = null;
		String env = null;
		String propertyName = null;
		String propertyValue = null;
	    CommandLineParser parser = new DefaultParser();
	    try {
	        // parse the command line arguments
	        CommandLine line = parser.parse( ops, args );
	        if (line.hasOption("weburi")) {
	        	suri = line.getOptionValue("weburi");
	        }
	        if (line.hasOption("userid")) {
	        	userid = line.getOptionValue("userid");
	        }
	        if (line.hasOption("password")) {
	        	password = line.getOptionValue("password");
	        }
	        if (line.hasOption("application")) {
	        	application = line.getOptionValue("application");
	        }
	        if (line.hasOption("environment")) {
	        	env = line.getOptionValue("environment");
	        }
	        if (line.hasOption("propertyName")) {
	        	propertyName = line.getOptionValue("propertyName");
	        }
	        if (line.hasOption("propertyValue")) {
	        	propertyValue = line.getOptionValue("propertyValue");
	        }
	    }
	    catch (org.apache.commons.cli.ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			System.exit(1);
		}
				
		
		URI uri = null;
		try {
			uri = new URI(suri);
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		ResourceClientExt adder = new ResourceClientExt(uri, userid, password);
		try {
			JSONArray resources = adder.getEnvironmentResource(env, application);
			for (int i = 0; i < resources.length(); i++) {
				String cPath = resources.getJSONObject(i).getString("path");
				cPath = cPath.replace("\\", "");
				adder.setResourceProperty(cPath, propertyName,propertyValue,false);
			}
		} catch (IOException | JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
