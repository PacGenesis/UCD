import groovy.sql.Sql
import oracle.jdbc.OracleDriver;
import oracle.jdbc.pool.OracleDataSource
import java.sql.Connection
import java.sql.DriverManager
import javax.sql.DataSource
import groovy.sql.Sql
import oracle.jdbc.driver.OracleTypes
import java.sql.*
import java.sql.Timestamp
import java.util.Date
import java.text.DateFormat;
import java.text.SimpleDateFormat
import groovy.time.*
import com.urbancode.commons.util.processes.Processes

def workDir = new File('.').canonicalFile
final def props = new Properties();
final def inputPropsFile = new File(args[0]);
try {
	inputPropsStream = new FileInputStream(inputPropsFile);
	props.load(inputPropsStream);
}
catch (IOException e) {
	throw new RuntimeException(e);
}

final def PLUGIN_HOME = System.getenv()['PLUGIN_HOME']
final def gcm_id = props['GCMId']?.trim()

// ------ getting the GCM DB details ---------

final String  dbServer = props['GCM_db_server_name']
final String dbServiceId = props ['GCM_db_serviceId']
final String dbUser = props['DB_User']
final String dbPwd = props ['DB_Pwd']
final def dbPort = props['GCM_port']
//final String dbDriver = "\"oracle.jdbc.OracleDriver\""
//final String dbUrl = "\"jdbc:oracle:thin:@"+dbServer+":"+dbPort+":"+dbServiceId+"\""
final String sysProp =  props['SystemProps']
final String appProp =  props['AppProps']

final String[] udAppDtl=appProp.split("]")



final String[] udNarId1=udAppDtl[0].split("\\[")
final String udNarId=udNarId1[1]
final String udAppName=udAppDtl[1].trim()

final String envProp =  props['EnvProps']



println "Using values : "
println "GCM number : " + gcm_id
/*
 println " the user is " +dbUser
 println " the password is " +dbPwd
 println " the server is " +dbServer
 println " the port  is " +dbPort
 println " the Service id is " +dbServiceId
 //println " the Driver is " +dbUrl
 //println " printing the System values "
 println " ---- the system properties are -----"
 //println  sysProp
 //println "------------------------------------"
 println " ---- the App properties are -----"
 println appProp
 println "------------------------------------"
 println " ---- the Env properties are -----"
 println envProp
 println "------------------------------------"
 //println " the udAppDtl[0] after split " +udAppDtl[0]
 //println " the udAppDtl[1] after split " +udAppDtl[1]
 //println " the udNarId1[0] after split " +udNarId1[0]
 //println " the udNarId1[1] after split " +udNarId1[1]
 //println " the uDeploy Nar Id is "+udNarId
 //println " the uDeploy App Name is "+udAppName
 //println "${PLUGIN_HOME}"
 //println "You have Entered $gcm_id"
 */

if (envProp == "PROD" || envProp =="prod" || envProp=="Prod"|| envProp=="Production")
{
	if (!gcm_id)
	{
		println " GCM Number is null "
		println " production deployment cant be done without GCM ticket"
		System.exit(1)
	}
}
else {
	println " You can start your implementation "
	System.exit(0)
}


println " connecting to the database"

OracleDataSource ds = new OracleDataSource()
ds.user = dbUser
ds.password = dbPwd
ds.driverType = 'thin'
ds.serverName = dbServer
ds.portNumber = dbPort.toInteger()
ds.databaseName = dbServiceId

final def sql = new Sql(ds)
final def result
final def gcmStatus
final def gcmChStartDt
final def gcmChEndDt
final def gcmUrgency
final def gcmNARID
final def gcmAppName

println "Database Connection Established"
println " the narid is ${udNarId} "
try {
	//def result =sql.firstRow(" select CR.GCM_ID,CR.URGENCY,CR.STATUS,CR.CHANGE_START_DATE,CR.CHANGE_END_DATE,CRS.NAR_LIST from DBIB_OWNER.GCM_CHANGE_REQUEST CR, DBIB_OWNER.GCM_CHANGE_REQUEST_SUMMARY CRS where CR.GCM_ID=CRS.GCM_ID and CR.GCM_ID=${gcm_id} ")
	result=sql.firstRow("select CR.GCM_ID,CR.URGENCY,CR.STATUS,CR.CHANGE_START_DATE,CR.CHANGE_END_DATE,GRC.CI_ID,GRC.CI_NAME from DBIB_OWNER.GCM_CHANGE_REQUEST CR, DBIB_OWNER.GCM_RISK_CI GRC where CR.GCM_ID=GRC.GCM_ID and CR.GCM_ID=${gcm_id} and  GRC.CI_ID=${udNarId} and GRC.CI_SOURCE='AUTO'")
} catch (SQLException e)
{
	e.printStackTrace();
	return;
}



gcmStatus =result.STATUS
gcmChStartDt=result.CHANGE_START_DATE
gcmChEndDt=result.CHANGE_END_DATE
gcmUrgency=result.URGENCY
gcmNARID=result.CI_ID
gcmAppName=result.CI_NAME



/*
 try {
 Class.forName("oracle.jdbc.OracleDriver");
 } catch (ClassNotFoundException e) {
 System.out.println("Where is your Oracle JDBC Driver?");
 e.printStackTrace();
 return;
 }
 System.out.println("Oracle JDBC Driver Registered!");
 Connection connection = null;
 try {
 connection = DriverManager.getConnection(dbUrl, dbUser,dbPwd);
 } catch (SQLException e) {
 System.out.println("Connection Failed! Check output console");
 e.printStackTrace();
 return;
 }
 if (connection != null) {
 System.out.println("You made it, take control your database now!");
 } else {
 System.out.println("Failed to make connection!");
 }
 */


/*
 def gcmNARLIST = result.NAR_LIST
 String[] NAR_ID = gcmNARLIST.split("-")
 def gcmNARID = NAR_ID[0]
 def gcmAppName = NAR_ID[1]
 */


println "the GCM status is : " +gcmStatus
println "the GCM Urgency  is : " +gcmUrgency
//println " the NAR id is " + gcmNARID
println "the change start date : " +gcmChStartDt
println "the change End  date : " +gcmChEndDt
println "the current date: " + getSystemTime()

/*
 println "the change start date : " +gcmChStartDt.getTime()
 println "the change End  date : " +gcmChEndDt.getTime()
 println "the GCM Application Name is  " +gcmAppName
 */

long curTime=System.currentTimeMillis()
boolean gcmApprStatus=true
boolean gcmWinStatus=true
boolean sysExitstatus=true
//boolean appCheckStatus = true
boolean narCheckStatus = true

//appCheckStatus=appNameCheck(gcmAppName,udAppName)

narCheckStatus=narIdCheck(gcmNARID,udNarId)
if(!narCheckStatus)
{
	println " NAR ID doesnt match"
	System.exit(1)
}

gcmApprStatus=gcmStatusChk(gcm_id,gcmStatus,gcmUrgency)
if (!gcmApprStatus)
{
	println " As GCM is in the " +gcmStatus + "status, Deployment can not be triggered"
	System.exit(1)
}
println " GCM status check completed, am checking the Change window now"
gcmWinStatus=changeWindowCheck( gcmChStartDt.getTime(),gcmChEndDt.getTime(),curTime)

if (!gcmWinStatus)
{
	println "GCM can not be implemented now as the current time doesnt fall within the change window"
	System.exit(1)
}

//println "the Current Time is $curTime"
println "the gcm status is $gcmApprStatus"
println "the gcm change window status is $gcmWinStatus"
/*
 if ( !gcmApprStatus || !gcmWinStatus )
 {
 println " GCM can not be implemented now"
 System.exit(1)
 }
 else
 {
 println "GCM can be implemented, proceed with the deployment"
 System.exit(0)
 }
 */	
def gcmStatusChk (String gcm_id , String gcmStatus , String gcmUrgency)
{
	if (gcmStatus == "APPROVED" || gcmStatus=="Approved")
	{
		println "GCM $gcm_id is in approved status"
		return true
	}
	else if (gcmUrgency == 'Emergency' && gcmStatus=='Review')
	{
		println "GCM $gcm_id is in $gcmStatus, deployment can be triggered"
		return true
	}
	else
	{
		println " GCM $gcm_id is in $gcmStatus, deployment can not be started"
		return false
	}
}
def getSystemTime()
{
	DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
	Date date = new Date();
	System.out.println(dateFormat.format(date));
	return dateFormat.format(date)

}


def changeWindowCheck(long chStartDt, long chEndDt, long systemDt)
{
	println "Change Start Date is " + chStartDt
	println "Change End Date is " + chEndDt
	println "System Date is " + systemDt

	if ( systemDt >= chStartDt && systemDt <= chEndDt  )
	{
		println " Deployment can be triggered "
		return true
	}
	else
	{
		println " Deployment cant be triggered as the current time doesnt fall within the change window"
		return false
	}
}


/*
 def appNameCheck(String gcmAppName, String appProp)
 {
 println " the gcm application name is " +gcmAppName
 println " the uDeploy applicaiton name is " +appProp
 if ( gcmAppName==appProp )
 {
 println " Application Name matches "
 return true
 }
 else
 {
 println " Application Name doesnt Match"
 return false
 }
 }
 */

def narIdCheck(String gcmNARID, String udNARID)
{
	//println " the gcm NAR ID is " +gcmNARID
	//println " the uDeploy NAR ID is " +udNARID

	if ( gcmNARID==udNARID )
	{
		//println "NAR ID matches "
		return true
	}
	else
	{
		//println " NAR ID doesnt Match"
		return false
	}
}

String getuDNarId(String uDappDetail)
{
	println " the Original String is  " +uDappDetail
	String[] uDNarId=uDappDetail.substring(1,uDappDetail.length)
	return uDNarId
}


