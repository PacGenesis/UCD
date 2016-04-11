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
import org.codehaus.jettison.json.JSONObject;

@SuppressWarnings("deprecation")
public class SetEnvironmentResourcesImpersonation {
	static Options ops = new Options();
	public static void buildOptions() {
		ops.addOption(Option.builder("weburi").hasArg().argName("uri").required().desc("UCD URI").build());
		ops.addOption(Option.builder("userid").hasArg().argName("userid").required().desc("user logon id").build());
		ops.addOption(Option.builder("password").hasArg().argName("Password").required().desc("UCD user password").build());
		ops.addOption(Option.builder("application").hasArg().argName("UCDApplication").required().desc("Related UCD Application").build());
		ops.addOption(Option.builder("environment").hasArg().argName("Environment").required().desc("Related UCD Application Environment").build());
		ops.addOption(Option.builder("impersonationuser").hasArg().argName("ImpersonationUser").required().desc("User being impersonated").build());
		
	}

	
	
	public static void main(String[] args) {
		buildOptions();
		
		
		String suri = null;
		String userid = null;
		String password = null;
		String application = null;
		String env = null;
		String user = null;
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
	        if (line.hasOption("impersonationuser")) {
	        	user = line.getOptionValue("impersonationuser");
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
		ResourceClientExt resClient = new ResourceClientExt(uri, userid, password);
		try {
			JSONArray resources = resClient.getEnvironmentResource(env, application);
			for (int i = 0; i < resources.length(); i++) {
				JSONObject res = resources.getJSONObject(i);
				String cPath = res.getString("path");
				cPath = cPath.replace("\\", "");
				JSONObject inRes = resClient.getResourceInfo(cPath);
				inRes.put("useImpersonation", true);
				inRes.put("impersonationUser", user);
				System.out.println(res);
				System.out.println(inRes);
				resClient.updateResource(cPath, inRes);
			}
		} catch (IOException | JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
