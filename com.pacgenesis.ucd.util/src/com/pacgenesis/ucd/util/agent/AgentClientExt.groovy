package com.pacgenesis.ucd.util.agent;

import java.io.IOException;
import java.net.URI;
import groovy.json.*;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.urbancode.ud.client.AgentClient;

public class AgentClientExt extends AgentClient {

	public AgentClientExt(URI url, String clientUser, String clientPassword) {
		super(url, clientUser, clientPassword);
		// TODO Auto-generated constructor stub
	}
	
	def getAgentInfo(String id) {
		String mainURI = this.url.toString();
		String uri = "${mainURI}/cli/agentCLI/info?agent=${id}";
		HttpGet method = new HttpGet(uri);
		def result = null;
		try
		{
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			result = new JsonSlurper().parseText(body);
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		finally {
		  releaseConnection(method);
		}
		
		return result;

	}
	String getAgentProperty(String id, String propName) {
		String mainURI = this.url.toString();
		String uri = "${mainURI}/cli/agentCLI/getProperty?agent=${id}&name=${propName}";
		HttpGet method = new HttpGet(uri);
		String result = null;
		try
		{
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			result = body;
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			//e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			//e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			//e.printStackTrace();
		}
		finally {
		  releaseConnection(method);
		}
		
		return result;

	}

	def getAgents() {
		ArrayList<Object> out = new ArrayList<Object>();
		def agents = null;
		String uri = this.url.toString() + "/cli/agentCLI";
		HttpGet method = new HttpGet(uri);
		try
		{
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			agents = new JsonSlurper().parseText(body);
			agents.each { agent ->
				def agentInfo = getAgentInfo(agent.id);
				out.add(agentInfo);
			}
	    } catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		finally {
		  releaseConnection(method);
		}
		
		return out;
	}
	
	def getPools() {
		String mainURI = this.url.toString();
		String uri = "${mainURI}/cli/agentPool";
		HttpGet method = new HttpGet(uri);
		def result = null;
		try
		{
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			result = new JsonSlurper().parseText(body);
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		finally {
		  releaseConnection(method);
		}
		
		return result;

	}
	
	void addAgentToAgentPool(String agentPool, String agent) {
		String startURL = this.url.toString();
		String uri = "${startURL}/cli/agentPool/addAgentToPool?pool=${agentPool}&agent=${agent}";

		HttpPut method = new HttpPut(uri);
		try {
			invokeMethod(method);
		} finally {
			releaseConnection(method);
		}

	}

}
