# Powershell 2.0
# Copyright (c) 2013-2014, Avnet Inc/IBM
# This PowerShell script is to be set as a RightScript for resetting a user's password
# and is trigged by the IBM UrbanCode RightScale plugin


# Stop and fail script when a command fails.
$errorActionPreference = "Stop"

# Specify username to be updated
$usernameToChange=$env:USERNAME_TO_CHANGE

# Specify new password in plain text
$newPassword=$env:NEW_PASSWORD

# Specify if user is in domain or on the local system
# 0 = false (Domain user), 1 = true (Local user)
$isLocalUser=$env:USER_IS_LOCAL
$hostname=hostname
try
{   
    Write-Host "Selecting user"
	
	if ($isLocalUser)
	{
	Write-Host ("Attempting to grab local user " + $usernameToChange)
	[adsi]$userVariable =( "WinNT://" + $hostname + "/" + $usernameToChange)
	} else {
	# Procedure for domain user
	Write-Host ("Attempting to grab domain user " + $usernameToChange)
	[adsi]$userVariable =( "LDAP://" + $usernameToChange)
	}

Write-Host ("User found: " + $userVariable.path)
Write-Host "Changing user password"
$userVariable.SetPassword($newPassword)
Write-Host "New password has been set"
	
}
catch
{
    throw "ERROR: $_"
    exit 101
}