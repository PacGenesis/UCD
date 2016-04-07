package com.pacgenesis.ucd.util.agent;

import java.io.IOException;
import java.net.URI;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import com.urbancode.ud.client.AgentClient;

public class AgentClientExt extends AgentClient {

	public AgentClientExt(URI url, String clientUser, String clientPassword) {
		super(url, clientUser, clientPassword);
		// TODO Auto-generated constructor stub
	}
	
	JSONArray getAgents() {
		JSONArray result = null;
		
		String uri = this.url + "/cli/agentCLI";
		HttpGet method = new HttpGet(uri);
		try
		{
			HttpResponse response = invokeMethod(method);
			String body = getBody(response);
			result = new JSONArray(body);
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

}
