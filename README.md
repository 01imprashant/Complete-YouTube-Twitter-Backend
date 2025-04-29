## API Documentation

### POST /users/register

Registers a new user.

#### Request Headers
- `Content-Type: multipart/form-data`

#### Request Body
- `fullName` (string, required): Full name of the user.
- `email` (string, required): Email address of the user.
- `username` (string, required): Unique username for the user.
- `password` (string, required): Password for the user.
- `avatar` (file, required): Profile picture of the user.
- `coverImage` (file, optional): Cover image for the user's profile.

#### Response
- **Status Code**: `201 Created`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "userId",
      "fullName": "User's Full Name",
      "email": "user@example.com",
      "username": "username",
      "avatar": "avatar_url",
      "coverImage": "cover_image_url"
    },
    "message": "User Register Successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing required fields or invalid data.
- **409 Conflict**: User with the same email or username already exists.
- **500 Internal Server Error**: Error during user creation or avatar upload.

#### Example Request
```bash
curl -X POST http://localhost:5000/users/register \
-H "Content-Type: multipart/form-data" \
-F "fullName=John Doe" \
-F "email=johndoe@example.com" \
-F "username=johndoe" \
-F "password=securepassword" \
-F "avatar=@path/to/avatar.jpg" \
-F "coverImage=@path/to/cover.jpg"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "fullName": "John Doe",
    "email": "johndoe@example.com",
    "username": "johndoe",
    "avatar": "https://cloudinary.com/avatar.jpg",
    "coverImage": "https://cloudinary.com/cover.jpg"
  },
  "message": "User Register Successfully"
}
```

### POST /users/login

Logs in an existing user.

#### Request Headers
- `Content-Type: application/json`

#### Request Body
- `username` (string, optional): Username of the user.
- `email` (string, optional): Email address of the user.
- `password` (string, required): Password of the user.

> Note: Either `username` or `email` must be provided.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "user": {
        "_id": "userId",
        "fullName": "User's Full Name",
        "email": "user@example.com",
        "username": "username",
        "avatar": "avatar_url",
        "coverImage": "cover_image_url"
      },
      "accessToken": "access_token",
      "refreshToken": "refresh_token"
    },
    "message": "User Logged In Successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing required fields or invalid data.
- **401 Unauthorized**: Invalid username/email or password.
- **500 Internal Server Error**: Error during login process.

#### Example Request
```bash
curl -X POST http://localhost:5000/users/login \
-H "Content-Type: application/json" \
-d '{
  "email": "johndoe@example.com",
  "password": "securepassword"
}'
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "user": {
      "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
      "fullName": "John Doe",
      "email": "johndoe@example.com",
      "username": "johndoe",
      "avatar": "https://cloudinary.com/avatar.jpg",
      "coverImage": "https://cloudinary.com/cover.jpg"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User Logged In Successfully"
}
```

### POST /users/logout

Logs out the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {},
    "message": "User Logged Out Successfully"
  }
  ```

#### Errors
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during logout process.

#### Example Request
```bash
curl -X POST http://localhost:5000/users/logout \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {},
  "message": "User Logged Out Successfully"
}
```

### POST /users/refresh-token

Refreshes the access token using a valid refresh token.

#### Request Headers
- `Content-Type: application/json`
- `Authorization`: Bearer token (optional, if refresh token is sent in the body)

#### Request Body
- `refreshToken` (string, optional): Refresh token of the user. If not provided, it will be taken from cookies.

#### Response
- **Status Code**: `201 Created`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "accessToken": "new_access_token",
      "refreshToken": "new_refresh_token"
    },
    "message": "Access token Refreshed"
  }
  ```

#### Errors
- **401 Unauthorized**: Missing or invalid refresh token.
- **500 Internal Server Error**: Error during token refresh process.

#### Example Request
```bash
curl -X POST http://localhost:5000/users/refresh-token \
-H "Content-Type: application/json" \
-d '{
  "refreshToken": "existing_refresh_token"
}'
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Access token Refreshed"
}
```

### POST /users/change-password

Allows a logged-in user to change their password.

#### Request Headers
- `Authorization`: Bearer token (required)
- `Content-Type`: application/json

#### Request Body
- `oldPassword` (string, required): The user's current password.
- `newPassword` (string, required): The new password the user wants to set.
- `confPassword` (string, required): Confirmation of the new password.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {},
    "message": "Password Changed Successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing required fields or passwords do not match.
- **401 Unauthorized**: Incorrect old password or user not authenticated.
- **500 Internal Server Error**: Error during password change process.

#### Example Request
```bash
curl -X POST http://localhost:5000/users/change-password \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{
  "oldPassword": "currentpassword",
  "newPassword": "newsecurepassword",
  "confPassword": "newsecurepassword"
}'
```

#### Example Response
```json
{
  "status": 200,
  "data": {},
  "message": "Password Changed Successfully"
}
```

### GET /users/current-user

Fetches the details of the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "userId",
      "fullName": "User's Full Name",
      "email": "user@example.com",
      "username": "username",
      "avatar": "avatar_url",
      "coverImage": "cover_image_url"
    },
    "message": "Current User"
  }
  ```

#### Errors
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during fetching user details.

#### Example Request
```bash
curl -X GET http://localhost:5000/users/current-user \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "fullName": "John Doe",
    "email": "johndoe@example.com",
    "username": "johndoe",
    "avatar": "https://cloudinary.com/avatar.jpg",
    "coverImage": "https://cloudinary.com/cover.jpg"
  },
  "message": "Current User"
}
```

### PATCH /users/update-account

Updates the account details of the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)
- `Content-Type`: application/json

#### Request Body
- `fullName` (string, required): The updated full name of the user.
- `email` (string, required): The updated email address of the user.
- `username` (string, required): The updated username of the user.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "userId",
      "fullName": "Updated Full Name",
      "email": "updated@example.com",
      "username": "updatedusername",
      "avatar": "avatar_url",
      "coverImage": "cover_image_url"
    },
    "message": "User Updated Successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing required fields.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during account update process.

#### Example Request
```bash
curl -X PATCH http://localhost:5000/users/update-account \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{
  "fullName": "Updated Full Name",
  "email": "updated@example.com",
  "username": "updatedusername"
}'
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "fullName": "Updated Full Name",
    "email": "updated@example.com",
    "username": "updatedusername",
    "avatar": "https://cloudinary.com/avatar.jpg",
    "coverImage": "https://cloudinary.com/cover.jpg"
  },
  "message": "User Updated Successfully"
}
```

### PATCH /users/avatar

Updates the avatar of the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)
- `Content-Type`: multipart/form-data

#### Request Body
- `avatar` (file, required): The new avatar image file to upload.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "userId",
      "fullName": "User's Full Name",
      "email": "user@example.com",
      "username": "username",
      "avatar": "new_avatar_url",
      "coverImage": "cover_image_url"
    },
    "message": "Avatar Updated Successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing avatar file or error during upload.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during avatar update process.

#### Example Request
```bash
curl -X PATCH http://localhost:5000/users/avatar \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: multipart/form-data" \
-F "avatar=@path/to/new_avatar.jpg"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "fullName": "John Doe",
    "email": "johndoe@example.com",
    "username": "johndoe",
    "avatar": "https://cloudinary.com/new_avatar.jpg",
    "coverImage": "https://cloudinary.com/cover.jpg"
  },
  "message": "Avatar Updated Successfully"
}
```

### PATCH /users/cover-image

Updates the cover image of the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)
- `Content-Type`: multipart/form-data

#### Request Body
- `coverImage` (file, required): The new cover image file to upload.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "userId",
      "fullName": "User's Full Name",
      "email": "user@example.com",
      "username": "username",
      "avatar": "avatar_url",
      "coverImage": "new_cover_image_url"
    },
    "message": "Cover Image Updated Successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing cover image file or error during upload.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during cover image update process.

#### Example Request
```bash
curl -X PATCH http://localhost:5000/users/cover-image \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: multipart/form-data" \
-F "coverImage=@path/to/new_cover_image.jpg"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "fullName": "John Doe",
    "email": "johndoe@example.com",
    "username": "johndoe",
    "avatar": "https://cloudinary.com/avatar.jpg",
    "coverImage": "https://cloudinary.com/new_cover_image.jpg"
  },
  "message": "Cover Image Updated Successfully"
}
```

### GET /users/c/:username

Fetches the channel profile of a user by their username.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `username` (string, required): The username of the channel to fetch.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "fullName": "User's Full Name",
      "username": "username",
      "avatar": "avatar_url",
      "coverImage": "cover_image_url",
      "subscribersCount": 123,
      "channelsSubcribedToCount": 10,
      "isSubscribed": true
    },
    "message": "Channel Profile Fetched Successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing or invalid username.
- **404 Not Found**: Channel not found.
- **500 Internal Server Error**: Error during fetching channel profile.

#### Example Request
```bash
curl -X GET http://localhost:5000/users/c/johndoe \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "fullName": "John Doe",
    "username": "johndoe",
    "avatar": "https://cloudinary.com/avatar.jpg",
    "coverImage": "https://cloudinary.com/cover.jpg",
    "subscribersCount": 123,
    "channelsSubcribedToCount": 10,
    "isSubscribed": true
  },
  "message": "Channel Profile Fetched Successfully"
}
```

### GET /users/history

Fetches the watch history of the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": [
      {
        "_id": "videoId",
        "title": "Video Title",
        "description": "Video Description",
        "thumbnail": "thumbnail_url",
        "owner": {
          "_id": "ownerId",
          "fullName": "Owner's Full Name",
          "username": "ownerUsername",
          "avatar": "owner_avatar_url"
        }
      }
    ],
    "message": "Watch History fetched Successfully"
  }
  ```

#### Errors
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during fetching watch history.

#### Example Request
```bash
curl -X GET http://localhost:5000/users/history \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": [
    {
      "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
      "title": "Sample Video",
      "description": "This is a sample video description.",
      "thumbnail": "https://cloudinary.com/thumbnail.jpg",
      "owner": {
        "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
        "fullName": "John Doe",
        "username": "johndoe",
        "avatar": "https://cloudinary.com/avatar.jpg"
      }
    }
  ],
  "message": "Watch History fetched Successfully"
}
```

