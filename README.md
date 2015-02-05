# Aber-myaccount-scraper

This script grabs information from the myaccount.aber.ac.uk pages and displays a notifcation of how much data allowance you have remaining.

##Configuration

You will need to create ```user.json``` in the root of the directory with the contents

Replace ```abc123``` with you AU username,
and password with your au password.

```
{
	"user": "abc123",
	"password": "password"
}
```

## Installing,

You will need to have Node.js installed.

1. Navigate to the directory that the projected is stored in.
2. ```npm install```
3. ```npm install -g forever``` (May need sudo)
4. ```forever start index.js```

You can create a startup script to deploy ```forever start index.js``` to make the notification start on startup.

This is very much a beta and needs some work to be stable.
