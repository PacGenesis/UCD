package com.pacgenesis.ucd.util.agent;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import com.google.common.net.InetAddresses;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

public class BuildAgentPoolMap {
	
	
	private enum ZONE {RISCMETNET, RISCDMZ, RISCBASTION, SISCDMZ}
	private long riscdmza = ipToLong(InetAddresses.forString("172.24.128.1"));
	private long riscdmzb = ipToLong(InetAddresses.forString("172.24.191.254"));
	private long riscbastiona = ipToLong(InetAddresses.forString("172.24.192.1"));
	private long riscbastionb = ipToLong(InetAddresses.forString("172.24.255.254"));
	private long siscdmza = ipToLong(InetAddresses.forString("172.24.0.1"));
	private long siscdmzb = ipToLong(InetAddresses.forString("172.24.63.254"));
	private long metnet1a = ipToLong(InetAddresses.forString("10.9.0.0"));
	private long metnet1b = ipToLong(InetAddresses.forString("10.218.0.0"));
	private long metnet2a = ipToLong(InetAddresses.forString("10.10.0.0"));
	private long metnet2b = ipToLong(InetAddresses.forString("10.90.0.0"));

	public static long ipToLong(InetAddress ip) {
		byte[] octets = ip.getAddress();
		long result = 0;
		for (byte octet : octets) {
			result <<= 8;
			result |= octet & 0xff;
		}
		return result;
	}

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
		def out = client.getAgents();
		out.each { agent ->
			try {
				switch (getAgentZone(agent,client)) {
					case ZONE.RISCMETNET:
						client.addAgentToAgentPool("RISC-METNET", agent.name);
						break;
					case ZONE.RISCBASTION:
						client.addAgentToAgentPool("RISC-BASTION", agent.name);
						break;
					case ZONE.RISCDMZ:	
						client.addAgentToAgentPool("RISC-DMZ", agent.name);
						break;
					case ZONE.SISCDMZ:
						client.addAgentToAgentPool("SISC-DMZ", agent.name);
						break;
					default:
						break;
					}
			} catch (Exception e) {
				//e.printStackTrace();
			}
		}
		
	}
	
	public ZONE getAgentZone(def agent, def client) {
		String ip = client.getAgentProperty(agent.name,"ip");
		if (ip == null) return null;
		long agentIP = ipToLong(InetAddresses.forString(ip));
		if (agentIP >= riscdmza && agentIP <= riscdmzb) {
			return RISCDMZ;
		} else if (agentIP >= riscbastiona && agentIP <= riscbastionb) {
			return RISCBASTION;
		} else if (agentIP >= siscdmza && agentIP <= siscdmzb) {
			return SISCDMZ;
		} else if (agentIP >= metnet1a && agentIP <= metnet1b) {
			return RISCMETNET;
		}
		return null;
	}
}
