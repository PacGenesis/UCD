/**
 * RightScale Account Management javascript class.
 */
importPackage(com.avnet.urbancode.cloud.http);
function RSOAuth(refresh_token, httpClient)
{
	this.refresh_token = refresh_token;
	this.httpClient = httpClient;
}

RSOAuth.prototype = {
	accessToken : function () {
		var parms = java.lang.reflect.Array.newInstance(java.lang.String, 2);
		parms[0] = "grant_type=refresh_token";
		parms[1] = "refresh_token=" + this.refresh_token;
		var data = "var oauth = " + this.httpClient.doPost(RSUtils.HOST + "/api/oauth2", parms);
		eval(data);
		if (oauth.error) {
			return oauth.error;
		}
		return oauth.access_token;
	},

	updateHttpClient : function () {
		var parms = java.lang.reflect.Array.newInstance(java.lang.String, 2);
		parms[0] = "grant_type=refresh_token";
		parms[1] = "refresh_token=" + this.refresh_token;
		var data = "var oauth = " + this.httpClient.doPost(RSUtils.HOST + "/api/oauth2", parms);
		eval(data);
		if (oauth.error) {
			return oauth.error;
		}
		this.httpClient.oauthToken = oauth.access_token;
		return "ok";
	}
};
