package com.pacgenesis.ucd.util.processrequest

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;

class ProcessRequestReport {
	static Options ops = new Options();
	public static void buildOptions() {
		ops.addOption(Option.builder("weburi").hasArg().argName("uri").required().desc("UCD URI").build());
		ops.addOption(Option.builder("userid").hasArg().argName("userid").required().desc("user logon id").build());
		ops.addOption(Option.builder("password").hasArg().argName("Password").required().desc("UCD user password").build());
		ops.addOption(Option.builder("requestId").hasArg().argName("requestId").required().desc("Process RequestId").build());
	}

	public static void main(String[] args) {
		buildOptions();
		
		
		String suri = null;
		String userid = null;
		String password = null;
		String requestId = null;
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
			if (line.hasOption("requestId")) {
				requestId = line.getOptionValue("requestId");
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
			e.printStackTrace();
		}
		def client = new ProcessRequestClient(uri,userid,password);
		def request = client.getProcessRequest(requestId);
		request.children.each { child ->
			println "${child.displayName}";
		}
	}

}
