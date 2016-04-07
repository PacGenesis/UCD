# Powershell 2.0
# Copyright (c) 2013-2014, Avnet Inc, All Rights Reserved Worldwide.
# This PowerShell script is to be set as a RightScript for disabling the admin account
# and is trigged by the IBM UrbanCode RightScale plugin


# Stop and fail script when a command fails.
$errorActionPreference = "Stop"


$rebootWhenFinished=$env:REBOOT_WHEN_FINISHED

# Fully qualified domain username required
$username = $env:USER_TO_LEAVE_DOMAIN 
$password = ConvertTo-SecureString $env:PASSWORD_TO_LEAVE_DOMAIN -AsPlainText -Force 
$domainCred = New-Object System.Management.Automation.PSCredential($username,$password)


# When removed from a domain, a computer must be added to a workgroup.
$targetWorkgroup=$env:TARGET_WORKGROUP

try
{   
    Write-Host ("Removing computer from domain as user " + $username)
	
	Remove-Computer -UnjoinDomainCredential $domainCred -WorkgroupName $targetWorkgroup

	if ($rebootWhenFinished)
	{
		Write-Host "Rebooting machine"
		Restart-Computer
	}
}
