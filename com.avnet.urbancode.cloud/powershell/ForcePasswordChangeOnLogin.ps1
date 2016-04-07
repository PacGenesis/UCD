# Powershell 2.0
# Copyright (c) 2013-2014, Avnet Inc, All Rights Reserved Worldwide.
# This PowerShell script is to be set as a RightScript for forcing Administrator
# to change password on next login

# Change local admin
$computer=hostname
$user="Administrator"


$objUser = [ADSI]"WinNT://$computer/$user"

try {


objUser.PasswordExpired = 1
objUser.SetInfo

catch
{
    throw "ERROR: $_"
    exit 101
}