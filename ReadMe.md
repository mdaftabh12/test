# Wine Vault Express App

## Overview

Wine Vault is an Express app integrated with MongoDB for managing wine collections. However, there's a critical issue that needs attention. After successfully creating an account, users face a challenge: although they can initially log in, they encounter difficulties accessing their accounts after resetting their passwords. The app uses bcryptjs for password hashing, indicating a potential issue in this process.

## To Fix

- Adjust existing code to allow successful login with credentials after a password reset.

## To Do

- Implement 'Verify Email' functionality during account signup.
- Enable Account Deletion Capability.

## Database Configuration

Please note that I've hidden my MongoDB password and email password in the code. You'll need to replace them with your credentials.

### Database Details:

#### 1. Collection: activitylogs

Logs specific to each logged-in user.

#### 2. Collection: users

Stores authenticated user data.

Example:
```json
{
  "_id": {"$oid": "65847d576d1a858e7c87c063"},
  "username": "Katherine",
  "email": "kat@kat.com",
  "password": "$2b$10$4sxeWZiJlCFmk3FTsPRjJ.nrBFMuT/eh6CgV4kUu2CwfdI48OFx92",
  "__v": {"$numberInt": "0"},
  "isNewAccount": false
}
