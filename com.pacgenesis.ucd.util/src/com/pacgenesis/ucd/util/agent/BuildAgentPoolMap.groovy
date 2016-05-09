package com.pacgenesis.ucd.util.agent;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

public class BuildAgentPoolMap {
	
	private Map<ZONE, Set<String>> agentPoolToAgentMap = new HashMap<ZONE, Set<String>>();
	
	private enum ZONE {RISCMETNET, RISCDMZ, RISCBASTION, SISCDMZ}
	
	public static void main(String[] args) {
		URI uri = null;
		try {
			uri = new URI(args[0]);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
		AgentClientExt client = new AgentClientExt(uri, args[1], args[2]);
		new BuildAgentPoolMap().doWork(client);
	}

	public void doWork(AgentClientExt client) {
		agentPoolToAgentMap.put(ZONE.RISCMETNET, new HashSet<String>());
		agentPoolToAgentMap.put(ZONE.RISCDMZ, new HashSet<String>());
		agentPoolToAgentMap.put(ZONE.RISCBASTION, new HashSet<String>());
		agentPoolToAgentMap.put(ZONE.SISCDMZ, new HashSet<String>());
		JSONArray out = client.getAgents();
		for (int i = 0; i < out.length(); i++) {
			try {
				JSONObject agent = out.getJSONObject(i);
				String agentName = agent.getString("name");
				switch (getAgentZone(agentName)) {
					case RISCMETNET:
						agentPoolToAgentMap.get(ZONE.RISCMETNET).add(agentName);
						break;
					case RISCBASTION:
						agentPoolToAgentMap.get(ZONE.RISCDMZ).add(agentName);
						break;
					case RISCDMZ:	
						agentPoolToAgentMap.get(ZONE.RISCBASTION).add(agentName);
						break;
					case SISCDMZ:
						agentPoolToAgentMap.get(ZONE.SISCDMZ).add(agentName);
						break;
					}
			} catch (JSONException e) {
				//e.printStackTrace();
			}
		}
		
		for(ZONE zone : agentPoolToAgentMap.keySet()) {
			String stringZone = null;
			switch (zone) {
				case RISCMETNET:
					stringZone = "RISC-METNET";
					break;
				case RISCBASTION:
					stringZone = "RISC-BASTION";
					break;
				case RISCDMZ:	
					stringZone = "RISC-DMZ";
					break;
				case SISCDMZ:
					stringZone = "SISC-DMZ";
					break;
			}			 
			client.addAgentsToPool(stringZone, agentPoolToAgentMap.get(zone));
		}
	}
	
	public ZONE getAgentZone(String agentName) {
		//do some magic here to figure out where agent is
		return null;
	}
}
