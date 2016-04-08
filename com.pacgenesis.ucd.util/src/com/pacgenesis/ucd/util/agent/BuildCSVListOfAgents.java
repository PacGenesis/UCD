package com.pacgenesis.ucd.util.agent;

import java.net.URI;
import java.net.URISyntaxException;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

public class BuildCSVListOfAgents {
	public static void main(String[] args) {
//		if (args.length != 3) {
//			System.out.println( "Arg:  <UCD url> <userid> <password> <output csv file>");
//		}
		
		URI uri = null;
		try {
			uri = new URI(args[0]);
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		AgentClientExt client = new AgentClientExt(uri, args[1], args[2]);
		JSONArray out = client.getAgents();
		System.out.println("Name, Active, Liscenced, LicenseType,Status,Version,Working Directory");
		for (int i = 0; i < out.length(); i++) {
			try {
				JSONObject agent = out.getJSONObject(i);
				System.out.println(agent.getString("name") + "," + agent.getBoolean("active") + "," + agent.getBoolean("licensed") + "," + agent.getString("licenseType") + "," + agent.getString("status") + "," + agent.getString("version") + "," + agent.getString("workingDirectory"));
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				//e.printStackTrace();
			}
		}
		
	}
}
