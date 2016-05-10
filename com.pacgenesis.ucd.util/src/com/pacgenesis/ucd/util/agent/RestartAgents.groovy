package com.pacgenesis.ucd.util.agent

class RestartAgents {
	public static void main(String[] args) {
		URI uri = null;
		try {
			uri = new URI(args[0]);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
		AgentClientExt client = new AgentClientExt(uri, args[1], args[2]);
		def agents = client.getAgents();
		agents.each { agent -> 
			client.restartAgent(agent.name);
		}
	}

}
