# Powershell 2.0
# Copyright (c) 2013-2014, Avnet Inc, All Rights Reserved Worldwide.
# This PowerShell script is to be set as a RightScript for disabling the admin account
# and is trigged by the IBM UrbanCode RightScale plugin


# Stop and fail script when a command fails.
$errorActionPreference = "Stop"


$rebootWhenFinished=$env:REBOOT_WHEN_FINISHED
# domain should be in a format like IBM.COM or AMER
$domain=$env:DOMAIN_NAME

# Optional, depending on Active Directory settings
$domainOUpath=$env:OU_PATH

# Username format is needed as domain\user
$username = $domain + "\" + $env:USER_TO_JOIN_DOMAIN 
$password = ConvertTo-SecureString $env:PASSWORD_TO_JOIN_DOMAIN -AsPlainText -Force 
$domainCred = New-Object System.Management.Automation.PSCredential($username,$password)


try
{   
    Write-Host ("Joining computer to " + $domain + " as user " + $username)
	
	if($domainOUpath) { # domain OU path is not empty
		Add-Computer -DomainName $domain -credential $domainCred -OUPath $domainOUpath
	} else {
		Add-Computer -DomainName $domain -credential $domainCred
	}
	
	if ($rebootWhenFinished)
	{
		Write-Host "Rebooting machine"
		Restart-Computer
	}
}
