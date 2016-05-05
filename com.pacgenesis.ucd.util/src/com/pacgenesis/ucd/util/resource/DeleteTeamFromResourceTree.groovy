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
public class DeleteTeamFromResourceTree {
	static Options ops = new Options();
	public static void buildOptions() {
		ops.addOption(Option.builder("weburi").hasArg().argName("uri").required().desc("UCD URI").build());
		ops.addOption(Option.builder("userid").hasArg().argName("userid").required().desc("user logon id").build());
		ops.addOption(Option.builder("password").hasArg().argName("Password").required().desc("UCD user password").build());
		ops.addOption(Option.builder("application").hasArg().argName("UCDApplication").required().desc("Related UCD Application").build());
		ops.addOption(Option.builder("environment").hasArg().argName("Environment").required().desc("Related UCD Application Environment").build());
		ops.addOption(Option.builder("team").hasArg().argName("Team").required().desc("Team to remove").build());
		
	}

	
	
	public static void main(String[] args) {
		buildOptions();
		
		
		String suri = null;
		String userid = null;
		String password = null;
		String application = null;
		String env = null;
		String team = null;
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
	        if (line.hasOption("team")) {
	        	team = line.getOptionValue("team");
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
		ResourceClientExt deleter = new ResourceClientExt(uri, userid, password);
		try {
			def resources = deleter.getEnvironmentResource(env, application);
			resources.each { resource ->
				String cPath = resource.path;
				cPath = cPath.replace("\\", "");
				deleter.deleteResourceFromTeam(cPath, team,null);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
