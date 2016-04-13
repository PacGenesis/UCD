###
# Licensed Materials - Property of IBM Corp.
# @product.name.full@
# (c) Copyright IBM Corporation 2003, 2013. All Rights Reserved.
# 
# U.S. Government Users Restricted Rights - Use, duplication or disclosure restricted by
# GSA ADP Schedule Contract with IBM Corp.
# 
# Filename: discover.py
# 
# 
###

from java.util import HashMap
from java.util import ArrayList

def _isWpServer(serverId):
    isWpServer = 0
    for classLoader in AdminConfig.list( "Classloader", serverId ).splitlines():
        if (len(classLoader) > 0):
            for library in AdminConfig.list( "LibraryRef", classLoader ).splitlines():
                if (len(library) > 0):
                    libraryName = AdminConfig.showAttribute(library, "libraryName")
                    ## WP app servers will have a WPSlib defined 
                    ## it is required for the app server to run portal
                    if (libraryName == "WPSlib"):
                        isWpServer = 1
                    break
                    #endIf
                #endIf
            #endFor
        #endIf
    #endFor
    return isWpServer
#endDef

def _getValue(wpAttr):
    valuePart = wpAttr.find('[value ');
    value = wpAttr[valuePart+7:len(wpAttr)-1];
    value = value.split(']')[0];
    value = value.replace("\\","\\\\");
    value = value.replace("\"","\\\"");
    return value
#endDef

cell = AdminControl.getCell();
port = AdminControl.getPort();
connType = AdminControl.getType();
host = AdminControl.getHost();

newline = java.lang.System.getProperty("line.separator")

node2Servers = HashMap();
node2Host = HashMap();
cluster2Servers = HashMap();

portalServers = HashMap();

nodes = AdminConfig.list("Node").splitlines();
print nodes
if (nodes != None and len(nodes) != 0):
  for node in nodes:
    if (node != None and node.strip() != ''):
      serverMap = HashMap();
      nodeName = AdminConfig.showAttribute(node, "name");
      hostName = AdminConfig.showAttribute(node, "hostName");
      node2Host.put(nodeName, hostName);
      if not node2Servers.containsKey(nodeName):
        node2Servers.put(nodeName, ArrayList());
      #endif

      servers = AdminConfig.list("Server", node).splitlines();
      print servers
      serverMap = HashMap();
      if (servers != None and len(servers) != 0):
        for server in servers:
            if (server != None and server.strip() != ''):

                serverName = AdminConfig.showAttribute(server, "name");
                if (_isWpServer(server)):
                    if not serverMap.containsKey("portal"):
                        serverMap.put("portal", ArrayList());
                    #endif
                    serverMap.get("portal").add(server);

                    if not portalServers.containsKey(server):
                        portalServers.put(server, ArrayList());
                    #endif
                    portalServer = HashMap();
                    portalServer.put("server_name", serverName);
                    
                    nodeVSEntries = AdminConfig.list( 'VariableSubstitutionEntry', node).splitlines();
                    if (nodeVSEntries != None and len(nodeVSEntries) != 0): 
                        for varSub in nodeVSEntries:
                            wpAttr = AdminConfig.show(varSub);
                            if (-1 != wpAttr.find('[symbolicName WPS_HOME]')):
                                portal_home = _getValue(wpAttr);
                                portalServer.put("portal_home", portal_home);
                                continue;
                            #endif
                            if (-1 != wpAttr.find('[symbolicName USER_INSTALL_ROOT]')):
                                profile_home = _getValue(wpAttr);
                                portalServer.put("profile_home", profile_home);
                                continue;
                            #endif                        
                        #endfor
                    #endif    
                    serverVSEntries = AdminConfig.list( 'VariableSubstitutionEntry', server).splitlines();
                    if (serverVSEntries != None and len(serverVSEntries) != 0): 
                        for varSub in serverVSEntries:
                            wpAttr = AdminConfig.show(varSub);
                            if (-1 != wpAttr.find('[symbolicName WCM_PORT]')):
                                config_port = _getValue(wpAttr);
                                portalServer.put("config_port", config_port);
                                continue;
                            #endif
                            if (-1 != wpAttr.find('[symbolicName WCM_HOST]')):
                                server_host = _getValue(wpAttr);
                                portalServer.put("server_host", server_host);
                                continue;
                            #endif                                
                        #endfor                        
                    #endif    

                    if not portalServer.containsKey("portal_home"):
                        portalServer.put("portal_home", "Not Found");
                    #endif
                    if not portalServer.containsKey("profile_home"):
                        portalServer.put("profile_home", "Not Found");
                    #endif
                    if not portalServer.containsKey("config_port"):
                        portalServer.put("config_port", "Not Found");
                    #endif
                    if not portalServer.containsKey("server_host"):
                        portalServer.put("server_host", "Not Found");
                    #endif
                    
                    portalServers.get(server).add(portalServer);
                else:                    
                    if not serverMap.containsKey("was"):
                        serverMap.put("was", ArrayList());
                    #endif
                    serverMap.get("was").add(serverName);
                #endif
            #endif    
        #endfor    
      #endif
      node2Servers.get(nodeName).add(serverMap);
  #endfor
#endif

clusters = AdminConfig.list("ServerCluster").splitlines();
print clusters
if (clusters != None and len(clusters) != 0):
  for cluster in clusters:
    if (cluster != None and cluster != ''):
      clusterName = AdminConfig.showAttribute(cluster, "name");
      if not cluster2Servers.containsKey(clusterName):
        cluster2Servers.put(clusterName, ArrayList())
      #endif
      members = AdminConfig.list("ClusterMember", cluster).splitlines();
      print members
      if (members != None and len(members) != 0):
        for member in members:
          if (member.strip() != "") :
            memberName = AdminConfig.showAttribute(member,"memberName");
            memberNodeName = AdminConfig.showAttribute(member, "nodeName");
            memberMap = HashMap();
            memberMap.put("node", memberNodeName);
            memberMap.put("member", memberName);
            cluster2Servers.get(clusterName).add(memberMap);
          #endif
        #endfor
      #endif
    #endif
  #endfor
#endif

print "{"
print "  \"cell\":\"" + cell + "\","
print "  \"port\":\"" + port + "\","
print "  \"connType\":\"" + connType + "\","
print "  \"host\":\"" + host + "\","
print "  \"nodes\":["

isFirstNode = 1;
for key in node2Servers.keySet():
  if isFirstNode == 1:
    print "    {"
    isFirstNode = 0;
  else:
    print "    ,{"

  print "    \"node\":\"" + key + "\","
  print "    \"nodeHost\":\"" + node2Host.get(key) + "\","
  print "    \"servers\":["

  isFirstServer = 1;
  for serverMap in node2Servers.get(key):
    for type in serverMap.keySet():
        servers = serverMap.get(type);
        if (servers != None and servers != ''):
            for server in servers:
                if isFirstServer == 1:
                    print "      {"
                    isFirstServer = 0
                else:
                    print "      ,{"
                #endif        
                print "      \"" + type + "\":\"" + server + "\""
                print "      }"
            #endfor
        #endif
    #endfor    
  #endfor

  print "    ]"
  print "    }"
#endfor

print "  ],"
print "  \"clusters\":["

isFirstCluster = 1;
for key in cluster2Servers.keySet():
  if isFirstCluster == 1:
    isFirstCluster=0;
    print "    {"
  else:
    print "    ,{"

  print "    \"cluster\":\"" + key + "\","
  print "    \"members\": ["

  isFirstMember = 1;
  for memberMap in cluster2Servers.get(key):
    if isFirstMember==1:
      isFirstMember=0;
      print "      {"
    else:
      print "      ,{"

    print "      \"member\":\"" + memberMap.get("member") + "\","
    print "      \"node\":\"" + memberMap.get("node") + "\""
    print "        }"
  print "    ]"
  print "    }"
  
print "  ],"
print "  \"portalservers\":["

isFirstPortalServer = 1;
for key in portalServers.keySet():
    if isFirstPortalServer == 1:
        isFirstPortalServer=0;
        print "    {"
    else:
        print "    ,{"
    #endif
    print "    \"portalserver\":\"" + key + "\","
    print "    \"attributes\": ["

    isFirstAttr = 1;
    for portalServer in portalServers.get(key):
        if isFirstAttr==1:
            isFirstAttr=0;
            print "      {"
        else:
            print "      ,{"
        #endif
        print "      \"server_name\":\"" + portalServer.get("server_name") + "\","
        print "      \"portal_home\":\"" + portalServer.get("portal_home") + "\","
        print "      \"profile_home\":\"" + portalServer.get("profile_home") + "\","
        print "      \"config_port\":\"" + portalServer.get("config_port") + "\","
        print "      \"server_host\":\"" + portalServer.get("server_host") + "\""
        print "        }"
    #endfor
    print "    ]"
    print "    }"
#endfor

print "  ]"
print "}"
   

