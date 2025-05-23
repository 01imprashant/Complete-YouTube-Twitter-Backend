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

### GET /videos

Fetches a list of videos based on query, sort, and pagination parameters.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Query Parameters
- `page` (number, optional): The page number for pagination. Default is `1`.
- `limit` (number, optional): The number of videos per page. Default is `10`.
- `query` (string, optional): Search query for video title or description.
- `sortBy` (string, optional): Field to sort by (e.g., `title`, `createdAt`).
- `sortType` (string, optional): Sort order (`asc` or `desc`).

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
        "createdBy": {
          "fullName": "Owner's Full Name",
          "username": "ownerUsername",
          "avatar": "owner_avatar_url"
        }
      }
    ],
    "message": "Video fetched successfully"
  }
  ```

#### Errors
- **404 Not Found**: No videos found.
- **500 Internal Server Error**: Error during fetching videos.

#### Example Request
```bash
curl -X GET http://localhost:5000/videos?page=1&limit=10&query=sample \
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
      "createdBy": {
        "fullName": "John Doe",
        "username": "johndoe",
        "avatar": "https://cloudinary.com/avatar.jpg"
      }
    }
  ],
  "message": "Video fetched successfully"
}
```

### GET /videos/:videoId

Fetches the details of a specific video by its ID.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `videoId` (string, required): The ID of the video to fetch.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "videoId",
      "title": "Video Title",
      "description": "Video Description",
      "thumbnail": "thumbnail_url",
      "videoFile": "video_file_url",
      "createdBy": {
        "fullName": "Owner's Full Name",
        "username": "ownerUsername",
        "avatar": "owner_avatar_url"
      }
    },
    "message": "Video fetched successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid video ID.
- **404 Not Found**: Video not found.
- **500 Internal Server Error**: Error during fetching video details.

#### Example Request
```bash
curl -X GET http://localhost:5000/videos/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "title": "Sample Video",
    "description": "This is a sample video description.",
    "thumbnail": "https://cloudinary.com/thumbnail.jpg",
    "videoFile": "https://cloudinary.com/video.mp4",
    "createdBy": {
      "fullName": "John Doe",
      "username": "johndoe",
      "avatar": "https://cloudinary.com/avatar.jpg"
    }
  },
  "message": "Video fetched successfully"
}
```

### PATCH /videos/toggle/publish/:videoId

Toggles the publish status of a specific video by its ID.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `videoId` (string, required): The ID of the video to toggle publish status.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "videoId",
      "title": "Video Title",
      "description": "Video Description",
      "thumbnail": "thumbnail_url",
      "videoFile": "video_file_url",
      "isPublished": true,
      "createdBy": {
        "fullName": "Owner's Full Name",
        "username": "ownerUsername",
        "avatar": "owner_avatar_url"
      }
    },
    "message": "Video published status modified"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid video ID.
- **403 Forbidden**: User is not authorized to toggle the publish status of this video.
- **404 Not Found**: Video not found.
- **500 Internal Server Error**: Error during toggling publish status.

#### Example Request
```bash
curl -X PATCH http://localhost:5000/videos/toggle/publish/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "title": "Sample Video",
    "description": "This is a sample video description.",
    "thumbnail": "https://cloudinary.com/thumbnail.jpg",
    "videoFile": "https://cloudinary.com/video.mp4",
    "isPublished": true,
    "createdBy": {
      "fullName": "John Doe",
      "username": "johndoe",
      "avatar": "https://cloudinary.com/avatar.jpg"
    }
  },
  "message": "Video published status modified"
}
```

### POST /likes/toggle/v/:videoId

Toggles the like status of a specific video by its ID.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `videoId` (string, required): The ID of the video to toggle the like status.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "videoId": "videoId",
      "liked": true,
      "totalLikes": 123
    },
    "message": "Video liked successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `videoId`.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during toggling like status.

#### Example Request
```bash
curl -X POST http://localhost:5000/likes/toggle/v/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "videoId": "64f1c2e5b5d6c2a1e8f7a9b3",
    "liked": true,
    "totalLikes": 123
  },
  "message": "Video liked successfully"
}
```

### POST /likes/toggle/c/:commentId

Toggles the like status of a specific comment by its ID.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `commentId` (string, required): The ID of the comment to toggle the like status.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "commentId": "commentId",
      "liked": true,
      "totalLikes": 45
    },
    "message": "Comment liked successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `commentId`.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during toggling like status.

#### Example Request
```bash
curl -X POST http://localhost:5000/likes/toggle/c/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "commentId": "64f1c2e5b5d6c2a1e8f7a9b3",
    "liked": true,
    "totalLikes": 45
  },
  "message": "Comment liked successfully"
}
```

### POST /likes/toggle/t/:tweetId

Toggles the like status of a specific tweet by its ID.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `tweetId` (string, required): The ID of the tweet to toggle the like status.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "tweetId": "tweetId",
      "liked": true,
      "totalLikes": 67
    },
    "message": "Tweet liked successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `tweetId`.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during toggling like status.

#### Example Request
```bash
curl -X POST http://localhost:5000/likes/toggle/t/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "tweetId": "64f1c2e5b5d6c2a1e8f7a9b3",
    "liked": true,
    "totalLikes": 67
  },
  "message": "Tweet liked successfully"
}
```

### GET /likes/videos

Fetches all videos liked by the currently logged-in user.

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
        "description": "Video Description"
      }
    ],
    "message": "Liked videos retrieved successfully"
  }
  ```

#### Errors
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during fetching liked videos.

#### Example Request
```bash
curl -X GET http://localhost:5000/likes/videos \
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
      "description": "This is a sample video description."
    }
  ],
  "message": "Liked videos retrieved successfully"
}
```

### GET /comments/:videoId

Fetches all comments for a specific video.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `videoId` (string, required): The ID of the video whose comments are to be fetched.

#### Query Parameters
- `page` (number, optional): The page number for pagination. Default is `1`.
- `limit` (number, optional): The number of comments per page. Default is `10`.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": [
      {
        "content": "Comment content",
        "createdAt": "2025-05-03T12:34:56.789Z",
        "createdBy": {
          "username": "user123",
          "fullName": "User Full Name",
          "avatar": "user_avatar_url"
        }
      }
    ],
    "message": "Comments fetched successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `videoId`.
- **404 Not Found**: Video not found.
- **500 Internal Server Error**: Error while fetching comments.

#### Example Request
```bash
curl -X GET http://localhost:5000/comments/64f1c2e5b5d6c2a1e8f7a9b3?page=1&limit=10 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": [
    {
      "content": "This is a sample comment.",
      "createdAt": "2025-05-03T12:34:56.789Z",
      "createdBy": {
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "https://cloudinary.com/avatar.jpg"
      }
    }
  ],
  "message": "Comments fetched successfully"
}
```

### DELETE /comments/c/:commentId

Deletes a specific comment by its ID.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `commentId` (string, required): The ID of the comment to delete.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "commentId",
      "content": "Comment content",
      "createdAt": "2025-05-03T12:34:56.789Z"
    },
    "message": "Comment deleted successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `commentId`.
- **403 Forbidden**: User is not authorized to delete this comment.
- **404 Not Found**: Comment not found.
- **500 Internal Server Error**: Error while deleting the comment.

#### Example Request
```bash
curl -X DELETE http://localhost:5000/comments/c/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "content": "This is a sample comment.",
    "createdAt": "2025-05-03T12:34:56.789Z"
  },
  "message": "Comment deleted successfully"
}
```


### GET /subscriptions/c/:subscriberId

Fetches the list of channels to which a user has subscribed.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `subscriberId` (string, required): The ID of the subscriber whose subscribed channels are to be fetched.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": [
      {
        "channelId": "channelId",
        "channelName": "Channel Name",
        "channelAvatar": "channel_avatar_url"
      }
    ],
    "message": "Subscribed channels fetched successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid subscriber ID.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during fetching subscribed channels.

#### Example Request
```bash
curl -X GET http://localhost:5000/subscriptions/c/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": [
    {
      "channelId": "64f1c2e5b5d6c2a1e8f7a9b3",
      "channelName": "Sample Channel",
      "channelAvatar": "https://cloudinary.com/channel_avatar.jpg"
    }
  ],
  "message": "Subscribed channels fetched successfully"
}
```

### GET /subscriptions/u/:channelId

Fetches the list of subscribers for a specific channel by its ID.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `channelId` (string, required): The ID of the channel whose subscribers are to be fetched.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": [
      {
        "subscriberId": "subscriberId",
        "subscriberName": "Subscriber Name",
        "subscriberAvatar": "subscriber_avatar_url"
      }
    ],
    "message": "Subscribers list fetched successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid channel ID.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during fetching subscribers list.

#### Example Request
```bash
curl -X GET http://localhost:5000/subscriptions/u/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": [
    {
      "subscriberId": "64f1c2e5b5d6c2a1e8f7a9b3",
      "subscriberName": "John Doe",
      "subscriberAvatar": "https://cloudinary.com/subscriber_avatar.jpg"
    }
  ],
  "message": "Subscribers list fetched successfully"
}
```

### POST /playlist

Creates a new playlist for the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)
- `Content-Type`: application/json

#### Request Body
- `name` (string, required): The name of the playlist.
- `description` (string, required): A description of the playlist.

#### Response
- **Status Code**: `201 Created`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "playlistId",
      "name": "Playlist Name",
      "description": "Playlist Description",
      "owner": "userId",
      "videos": []
    },
    "message": "Playlist created Successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing required fields or invalid data.
- **500 Internal Server Error**: Error during playlist creation.

#### Example Request
```bash
curl -X POST http://localhost:5000/playlists \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{
  "name": "My Playlist",
  "description": "This is a sample playlist."
}'
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "name": "My Playlist",
    "description": "This is a sample playlist.",
    "owner": "64f1c2e5b5d6c2a1e8f7a9b3",
    "videos": []
  },
  "message": "Playlist created Successfully"
}
```

### GET /playlist/:playlistId

Fetches the details of a specific playlist by its ID.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `playlistId` (string, required): The ID of the playlist to fetch.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "playlistId",
      "name": "Playlist Name",
      "description": "Playlist Description",
      "createdBy": {
        "username": "ownerUsername",
        "fullName": "Owner's Full Name",
        "avatar": "owner_avatar_url"
      },
      "videos": [
        {
          "title": "Video Title",
          "description": "Video Description",
          "thumbnail": "thumbnail_url",
          "owner": {
            "username": "videoOwnerUsername",
            "fullName": "Video Owner's Full Name",
            "avatar": "video_owner_avatar_url"
          }
        }
      ]
    },
    "message": "Playlist fetched successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid playlist ID.
- **404 Not Found**: Playlist not found.
- **500 Internal Server Error**: Error during fetching playlist details.

#### Example Request
```bash
curl -X GET http://localhost:5000/playlists/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "name": "My Playlist",
    "description": "This is a sample playlist.",
    "createdBy": {
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "https://cloudinary.com/avatar.jpg"
    },
    "videos": [
      {
        "title": "Sample Video",
        "description": "This is a sample video description.",
        "thumbnail": "https://cloudinary.com/thumbnail.jpg",
        "owner": {
          "username": "janedoe",
          "fullName": "Jane Doe",
          "avatar": "https://cloudinary.com/video_owner_avatar.jpg"
        }
      }
    ]
  },
  "message": "Playlist fetched successfully"
}
```

### PATCH /playlist/add/:videoId/:playlistId

Adds a video to a specific playlist.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `playlistId` (string, required): The ID of the playlist to which the video will be added.
- `videoId` (string, required): The ID of the video to add to the playlist.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "playlistId",
      "name": "Playlist Name",
      "description": "Playlist Description",
      "owner": "userId",
      "videos": [
        "videoId1",
        "videoId2",
        "videoId3"
      ]
    },
    "message": "Video added to playlist successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `playlistId` or `videoId`, or video already exists in the playlist.
- **403 Forbidden**: User is not authorized to modify the playlist.
- **404 Not Found**: Playlist not found.
- **500 Internal Server Error**: Error while adding the video to the playlist.

#### Example Request
```bash
curl -X PATCH http://localhost:5000/playlists/add/64f1c2e5b5d6c2a1e8f7a9b3/64f1c2e5b5d6c2a1e8f7a9b4 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b4",
    "name": "My Playlist",
    "description": "This is a sample playlist.",
    "owner": "64f1c2e5b5d6c2a1e8f7a9b3",
    "videos": [
      "64f1c2e5b5d6c2a1e8f7a9b5",
      "64f1c2e5b5d6c2a1e8f7a9b6"
    ]
  },
  "message": "Video added to playlist successfully"
}
```

### PATCH /playlist/remove/:videoId/:playlistId

Removes a video from a specific playlist.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `playlistId` (string, required): The ID of the playlist from which the video will be removed.
- `videoId` (string, required): The ID of the video to remove from the playlist.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "playlistId",
      "name": "Playlist Name",
      "description": "Playlist Description",
      "owner": "userId",
      "videos": [
        "videoId1",
        "videoId3"
      ]
    },
    "message": "Video removed from playlist successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `playlistId` or `videoId`, or video does not exist in the playlist.
- **403 Forbidden**: User is not authorized to modify the playlist.
- **404 Not Found**: Playlist not found.
- **500 Internal Server Error**: Error while removing the video from the playlist.

#### Example Request
```bash
curl -X PATCH http://localhost:5000/playlists/remove/64f1c2e5b5d6c2a1e8f7a9b3/64f1c2e5b5d6c2a1e8f7a9b4 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b4",
    "name": "My Playlist",
    "description": "This is a sample playlist.",
    "owner": "64f1c2e5b5d6c2a1e8f7a9b3",
    "videos": [
      "64f1c2e5b5d6c2a1e8f7a9b5"
    ]
  },
  "message": "Video removed from playlist successfully"
}
```

### GET /playlist/user/:userId

Fetches all playlists created by a specific user.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `userId` (string, required): The ID of the user whose playlists are to be fetched.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": [
      {
        "_id": "playlistId",
        "name": "Playlist Name",
        "description": "Playlist Description",
        "createdBy": {
          "username": "userUsername",
          "fullName": "User's Full Name",
          "avatar": "user_avatar_url"
        },
        "videos": [
          {
            "title": "Video Title",
            "description": "Video Description",
            "thumbnail": "video_thumbnail_url",
            "owner": {
              "username": "videoOwnerUsername",
              "fullName": "Video Owner's Full Name",
              "avatar": "video_owner_avatar_url"
            }
          }
        ]
      }
    ],
    "message": "Playlist fetched successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `userId`.
- **404 Not Found**: No playlists found for the user.
- **500 Internal Server Error**: Error while fetching playlists.

#### Example Request
```bash
curl -X GET http://localhost:5000/playlists/user/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": [
    {
      "_id": "64f1c2e5b5d6c2a1e8f7a9b4",
      "name": "My Playlist",
      "description": "This is a sample playlist.",
      "createdBy": {
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "https://cloudinary.com/avatar.jpg"
      },
      "videos": [
        {
          "title": "Sample Video",
          "description": "This is a sample video description.",
          "thumbnail": "https://cloudinary.com/thumbnail.jpg",
          "owner": {
            "username": "janedoe",
            "fullName": "Jane Doe",
            "avatar": "https://cloudinary.com/video_owner_avatar.jpg"
          }
        }
      ]
    }
  ],
  "message": "Playlist fetched successfully"
}
```


### POST /tweets/

Creates a new tweet for the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)
- `Content-Type`: application/json

#### Request Body
- `content` (string, required): The content of the tweet.

#### Response
- **Status Code**: `201 Created`
- **Body**:
  ```json
  {
    "status": 201,
    "data": {
      "_id": "tweetId",
      "content": "Tweet content",
      "owner": "userId",
      "createdAt": "2025-05-03T12:34:56.789Z"
    },
    "message": "Tweet created successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing or invalid `content`.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error during tweet creation.

#### Example Request
```bash
curl -X POST http://localhost:5000/tweets/ \
-H "Authorization: Bearer <access_token>" \
-H "Content-Type: application/json" \
-d '{
  "content": "This is a sample tweet."
}'
```

#### Example Response
```json
{
  "status": 201,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "content": "This is a sample tweet.",
    "owner": "64f1c2e5b5d6c2a1e8f7a9b4",
    "createdAt": "2025-05-03T12:34:56.789Z"
  },
  "message": "Tweet created successfully"
}
```

### GET /tweets/user/:userId

Fetches all tweets created by a specific user.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `userId` (string, required): The ID of the user whose tweets are to be fetched.

#### Query Parameters
- `page` (number, optional): The page number for pagination. Default is `1`.
- `limit` (number, optional): The number of tweets per page. Default is `10`.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": [
      {
        "content": "Tweet content",
        "createdAt": "2025-05-03T12:34:56.789Z",
        "owner": {
          "username": "user123",
          "fullname": "User Full Name",
          "avatar": "user_avatar_url"
        }
      }
    ],
    "message": "Tweets fetched successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `userId`.
- **404 Not Found**: No tweets found for the user.
- **500 Internal Server Error**: Error while fetching tweets.

#### Example Request
```bash
curl -X GET http://localhost:5000/tweets/user/64f1c2e5b5d6c2a1e8f7a9b3?page=1&limit=10 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": [
    {
      "content": "This is a sample tweet.",
      "createdAt": "2025-05-03T12:34:56.789Z",
      "owner": {
        "username": "johndoe",
        "fullname": "John Doe",
        "avatar": "https://cloudinary.com/avatar.jpg"
      }
    }
  ],
  "message": "Tweets fetched successfully"
}
```

### DELETE /tweets/:tweetId

Deletes a specific tweet by its ID.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `tweetId` (string, required): The ID of the tweet to delete.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "_id": "tweetId",
      "content": "Tweet content",
      "owner": "userId",
      "createdAt": "2025-05-03T12:34:56.789Z"
    },
    "message": "Tweet deleted successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid `tweetId`.
- **403 Forbidden**: User is not authorized to delete this tweet.
- **404 Not Found**: Tweet not found.
- **500 Internal Server Error**: Error while deleting the tweet.

#### Example Request
```bash
curl -X DELETE http://localhost:5000/tweets/64f1c2e5b5d6c2a1e8f7a9b3 \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "_id": "64f1c2e5b5d6c2a1e8f7a9b3",
    "content": "This is a sample tweet.",
    "owner": "64f1c2e5b5d6c2a1e8f7a9b4",
    "createdAt": "2025-05-03T12:34:56.789Z"
  },
  "message": "Tweet deleted successfully"
}
```

### GET /dashboard/stats

Fetches the channel statistics for the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": {
      "totalVideos": 10,
      "totalSubscribers": 200,
      "totalLikes": 500,
      "totalViews": 10000
    },
    "message": "Channel stats fetched successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Missing or invalid channel ID.
- **401 Unauthorized**: User is not authenticated.
- **500 Internal Server Error**: Error while fetching channel stats.

#### Example Request
```bash
curl -X GET http://localhost:5000/dashboard/stats \
-H "Authorization: Bearer <access_token>"
```

#### Example Response
```json
{
  "status": 200,
  "data": {
    "totalVideos": 10,
    "totalSubscribers": 200,
    "totalLikes": 500,
    "totalViews": 10000
  },
  "message": "Channel stats fetched successfully"
}
```

### GET /dashboard/videos

Fetches all videos uploaded by the currently logged-in user.

#### Request Headers
- `Authorization`: Bearer token (required)

#### Query Parameters
- `page` (number, optional): The page number for pagination. Default is `1`.
- `limit` (number, optional): The number of videos per page. Default is `10`.

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
        "createdBy": {
          "username": "ownerUsername",
          "fullName": "Owner's Full Name",
          "avatar": "owner_avatar_url"
        },
        "createdAt": "2025-05-03T12:34:56.789Z"
      }
    ],
    "message": "Videos fetched successfully"
  }
  ```

#### Errors
- **400 Bad Request**: Invalid channel ID.
- **401 Unauthorized**: User is not authenticated.
- **404 Not Found**: No videos found.
- **500 Internal Server Error**: Error while fetching videos.

#### Example Request
```bash
curl -X GET http://localhost:5000/dashboard/videos?page=1&limit=10 \
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
      "createdBy": {
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "https://cloudinary.com/avatar.jpg"
      },
      "createdAt": "2025-05-03T12:34:56.789Z"
    }
  ],
  "message": "Videos fetched successfully"
}
```

### GET /healthcheck/

Performs a health check to verify if the server is running and operational.

#### Response
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "status": 200,
    "data": "OK",
    "message": "OK"
  }
  ```

#### Example Request
```bash
curl -X GET http://localhost:5000/healthcheck/
```

#### Example Response
```json
{
  "status": 200,
  "data": "OK",
  "message": "OK"
}
```

[API Collection of YouTube-Twitter](https://prashantmishra-7814637.postman.co/workspace/My-Workspace~8cc54438-5f72-4e15-8401-089e0b73b6bb/collection/43735339-6e4590bf-9d76-429b-96ff-e6be41dcc6bf?action=share&creator=43735339&active-environment=43735339-8f039282-b5b7-46f3-b777-a91586c6a091)