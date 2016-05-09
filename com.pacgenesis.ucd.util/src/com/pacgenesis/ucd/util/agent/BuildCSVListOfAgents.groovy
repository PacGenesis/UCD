package com.pacgenesis.ucd.util.agent;

import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.text.ParseException;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

public class BuildCSVListOfAgents {
	static Options ops = new Options();
	public static void buildOptions() {
		ops.addOption(Option.builder("weburi").hasArg().argName("uri").required().desc("UCD URI").build());
		ops.addOption(Option.builder("userid").hasArg().argName("userid").required().desc("user logon id").build());
		ops.addOption(Option.builder("password").hasArg().argName("Password").required().desc("UCD user password").build());
		ops.addOption(Option.builder("filename").hasArg().argName("OutputFile").required().desc("Output File Name").build());
		
	}
	public static void main(String[] args) {
		buildOptions();
//		if (args.length != 3) {
//			System.out.println( "Arg:  <UCD url> <userid> <password> <output csv file>");
//		}
		String suri = null;
		String userid = null;
		String password = null;
		String filename = null;
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
	        if (line.hasOption("filename")) {
	        	filename = line.getOptionValue("filename");
	        }
	    }
	    catch (org.apache.commons.cli.ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		URI uri = null;
		try {
			uri = new URI(suri);
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		AgentClientExt client = new AgentClientExt(uri, userid, password);
		JSONArray out = client.getAgents();
		try {
			PrintWriter writer = new PrintWriter(filename, "UTF-8");
			writer.println("Name, Active, Liscenced, LicenseType,Status,Version,Working Directory");
			for (int i = 0; i < out.length(); i++) {
				try {
					JSONObject agent = out.getJSONObject(i);
					writer.println(agent.getString("name") + "," + agent.getBoolean("active") + "," + agent.getBoolean("licensed") + "," + agent.getString("licenseType") + "," + agent.getString("status") + "," + agent.getString("version") + "," + agent.getString("workingDirectory"));
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					//e.printStackTrace();
				}
			}
			writer.close();
		} catch (FileNotFoundException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (UnsupportedEncodingException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		
	}
}
