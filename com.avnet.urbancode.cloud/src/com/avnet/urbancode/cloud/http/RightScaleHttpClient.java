package com.avnet.urbancode.cloud.http;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.Header;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.ProtocolException;
import org.apache.http.client.CookieStore;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.params.ClientPNames;
import org.apache.http.client.params.CookiePolicy;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.client.DefaultRedirectStrategy;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.HttpContext;

public class RightScaleHttpClient {

//	{
//		System.setProperty("org.apache.commons.logging.Log", "org.apache.commons.logging.impl.NoOpLog"); 
//	};
	Log log = LogFactory.getLog(RightScaleHttpClient.class);
	// private DefaultHttpClient httpclient;
	private String user;
	private String password;
	private DefaultHttpClient httpClient;
	private String oauthToken;

	public RightScaleHttpClient() {
		httpClient = new DefaultHttpClient();
		httpClient.setRedirectStrategy(new DefaultRedirectStrategy() {
			public boolean isRedirected(HttpRequest request,
					HttpResponse response, HttpContext context) {
				boolean isRedirect = false;
				try {
					isRedirect = super.isRedirected(request, response, context);
				} catch (ProtocolException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				if (!isRedirect) {
					int responseCode = response.getStatusLine().getStatusCode();
					if (responseCode == 301 || responseCode == 302) {
						return true;
					}
				}
				return isRedirect;
			}
		});
		// Create a local instance of cookie store
		CookieStore cookieStore = new BasicCookieStore();
		httpClient.setCookieStore(cookieStore);
		httpClient.getParams().setParameter(
				 //tried to use different policies
				 ClientPNames.COOKIE_POLICY, CookiePolicy.BEST_MATCH);

	}

	public RightScaleHttpClient(String user, String password) {
		this.user = user;
		this.password = password;
		httpClient = new DefaultHttpClient();
		httpClient.getParams().setParameter(
				 //tried to use different policies
				 ClientPNames.COOKIE_POLICY, CookiePolicy.BEST_MATCH);

		// Create a local instance of cookie store
		CookieStore cookieStore = new BasicCookieStore();
		httpClient.setCookieStore(cookieStore);
		// Bind custom cookie store to the local context

	}

	public String doGet(String url, String[] reqProperties) throws IOException,
			URISyntaxException {
		URIBuilder uriBuilder = new URIBuilder(url);
		for (String prop : reqProperties) 
		{
			if (prop == null || prop.indexOf("=") == -1) continue;
			String[] items = splitParms(prop);
			uriBuilder.addParameter(items[0], items[1]);
		}
		URI uri = uriBuilder.build();
		HttpGet getRequest = new HttpGet(uri);
		getRequest.addHeader("X_API_VERSION", "1.5");
		if (this.oauthToken != null) {
			getRequest.addHeader("Authorization", "Bearer " + oauthToken);
		}
		// postRequest.addHeader("ContentType", "text/xml");
		HttpParams params = new BasicHttpParams();
		HttpResponse response = httpClient.execute(getRequest);

		// if (response.getStatusLine().getStatusCode() != 200) {
		// throw new RuntimeException("Failed : HTTP error code : "
		// + response.getStatusLine().getStatusCode());
		// }

		BufferedReader br = new BufferedReader(new InputStreamReader(
				(response.getEntity().getContent())));

		String output = "";
		String line = null;
		while ((line = br.readLine()) != null) {
			output += line;
		}
		if (output.startsWith("[") || output.startsWith("{")) {
			
		} else {
			log.info(output);
		}
		return output;
	}

	public String doPost(String url, String[] reqProperties) throws IOException {
		HttpPost postRequest = new HttpPost(url);
		postRequest.addHeader("X-API-VERSION", "1.5");
		if (this.oauthToken != null) {
			postRequest.addHeader("Authorization", "Bearer " + oauthToken);
		}
		// postRequest.addHeader("ContentType", "text/xml");
		List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(1);
		for (String prop : reqProperties) {
			if (prop == null || prop.indexOf("=") == -1) continue;
			String[] itms = splitParms(prop);
			if (itms.length == 2) {
				nameValuePairs.add(new BasicNameValuePair(itms[0], itms[1]));
			}

		}
		postRequest.setEntity(new UrlEncodedFormEntity(nameValuePairs));

		HttpResponse response = httpClient.execute(postRequest);

		String output = "";
		if (response.getEntity() != null) {
			BufferedReader br = new BufferedReader(new InputStreamReader(
					(response.getEntity().getContent())));

			String line = null;
			while ((line = br.readLine()) != null) {
				output += line;
			}
			br.close();
		}
		if (!output.equals(""))
			log.info(output);
		return output;
	}
	public String doPostReturnLocation(String url, String[] reqProperties) throws IOException {
		HttpPost postRequest = new HttpPost(url);
		postRequest.addHeader("X-API-VERSION", "1.5");
		if (this.oauthToken != null) {
			postRequest.addHeader("Authorization", "Bearer " + oauthToken);
		}
		// postRequest.addHeader("ContentType", "text/xml");
		List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(1);
		for (String prop : reqProperties) {
			if (prop == null || prop.indexOf("=") == -1) continue;
			String[] itms = splitParms(prop);
			if (itms.length == 2) {
				nameValuePairs.add(new BasicNameValuePair(itms[0], itms[1]));
			}

		}
		postRequest.setEntity(new UrlEncodedFormEntity(nameValuePairs));

		HttpResponse response = httpClient.execute(postRequest);

		String output = "";
		String alt = "";
		if (response.getEntity() != null) {
			Header[] locations = response.getHeaders("Location");
			if (locations.length > 0)
				output = locations[0].getValue();
			BufferedReader br = new BufferedReader(new InputStreamReader(
					(response.getEntity().getContent())));
			String line = null;
			while ((line = br.readLine()) != null) {
				alt += line;
			}
			br.close();
		}
		if (!output.equals("")) {
			return output;
		}
		log.info(alt);
		return alt;
	}

	public String doPost(String url, String buff) throws IOException {
		HttpResponse response = null;
		DefaultHttpClient httpClient = new DefaultHttpClient();
		HttpPost postRequest = new HttpPost(url);
		postRequest.addHeader("X-API-VERSION", "1.5");
		if (this.oauthToken != null) {
			postRequest.addHeader("Authorization", "Bearer " + oauthToken);
		}
		// postRequest.addHeader("ContentType", "text/xml");
		byte[] cBytes = buff.getBytes("UTF-8");
		ByteArrayEntity input = new ByteArrayEntity(cBytes);
		input.setContentType("text/xml");
		postRequest.setEntity(input);

		response = httpClient.execute(postRequest);

		// if (response.getStatusLine().getStatusCode() != 201) {
		// throw new RuntimeException("Failed : HTTP error code : "
		// + response.getStatusLine().getStatusCode());
		// }

		BufferedReader br = new BufferedReader(new InputStreamReader(
				(response.getEntity().getContent())));

		String output = "";
		String line = null;
		while ((line = br.readLine()) != null) {
			output += line;
		}

		httpClient.getConnectionManager().shutdown();
		return output;
	}

	public String doPut(String url, String[] reqProperties) throws IOException {
		HttpPut putRequest = new HttpPut(url);
		putRequest.addHeader("X-API-VERSION", "1.5");
		if (this.oauthToken != null) {
			putRequest.addHeader("Authorization", "Bearer " + oauthToken);
		}
		// postRequest.addHeader("ContentType", "text/xml");
		List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(1);
		for (String prop : reqProperties) {
			if (prop == null || prop.indexOf("=") == -1) continue;
			String[] itms = splitParms(prop);
			if (itms.length == 2) {
				nameValuePairs.add(new BasicNameValuePair(itms[0], itms[1]));
			}

		}
		putRequest.setEntity(new UrlEncodedFormEntity(nameValuePairs));

		HttpResponse response = httpClient.execute(putRequest);

		if (response.getStatusLine().getStatusCode() != 204) {
			putRequest.abort();
			return "failed";
		}
		if (response.getEntity() != null)
			response.getEntity().consumeContent();
		return "ok";
	}

	public String doDelete(String url, String[] reqProperties)
			throws IOException {
		HttpDelete deleteRequest = new HttpDelete(url);
		deleteRequest.addHeader("X_API_VERSION", "1.5");
		if (this.oauthToken != null) {
			deleteRequest.addHeader("Authorization", "Bearer " + oauthToken);
		}
		HttpResponse response = httpClient.execute(deleteRequest);

		if (response.getStatusLine().getStatusCode() != 204) {
			deleteRequest.abort();
			return "failed";
		}
		if (response.getEntity() != null)
			response.getEntity().consumeContent();
		return "ok";
	}

	public String getOauthToken() {
		return oauthToken;
	}

	public void setOauthToken(String oauthToken) {
		this.oauthToken = oauthToken;
	}

	private String[] splitParms(String parm) {
		String[] retVal = new String[2];
		int i = parm.indexOf("=");
		retVal[0] = parm.substring(0, i);
		retVal[1] = parm.substring(i + 1);
		return retVal;
	}

}
