# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePicture": "url",
    "role": "user"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
```
*Requires authentication*

### Logout
```http
POST /auth/logout
```
*Requires authentication*

### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```http
PUT /auth/reset-password/:token
```

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

---

## User Endpoints

### Get User Profile
```http
GET /users/:id
```

### Update User Profile
```http
PUT /users/:id
```
*Requires authentication*

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software developer",
  "location": "New York",
  "website": "https://johndoe.com"
}
```

### Delete User Account
```http
DELETE /users/:id
```
*Requires authentication*

### Upload Avatar
```http
POST /users/:id/avatar
```
*Requires authentication*

**Request:** multipart/form-data with `avatar` field

### Upload Cover Photo
```http
POST /users/:id/cover
```
*Requires authentication*

**Request:** multipart/form-data with `cover` field

### Search Users
```http
GET /users/search?query=john&page=1&limit=20
```

### Follow User
```http
POST /users/:id/follow
```
*Requires authentication*

### Unfollow User
```http
DELETE /users/:id/unfollow
```
*Requires authentication*

### Get Followers
```http
GET /users/:id/followers
```

### Get Following
```http
GET /users/:id/following
```

---

## Post Endpoints

### Get All Posts (Feed)
```http
GET /posts?page=1&limit=10
```

### Get Single Post
```http
GET /posts/:id
```

### Create Post
```http
POST /posts
```
*Requires authentication*

**Request:** multipart/form-data
```
content: "Post content here"
images: [file1, file2] (optional, max 4)
```

### Update Post
```http
PUT /posts/:id
```
*Requires authentication*

**Request Body:**
```json
{
  "content": "Updated content"
}
```

### Delete Post
```http
DELETE /posts/:id
```
*Requires authentication*

### Like Post
```http
POST /posts/:id/like
```
*Requires authentication*

### Unlike Post
```http
DELETE /posts/:id/unlike
```
*Requires authentication*

### Get User's Posts
```http
GET /posts/user/:userId?page=1&limit=10
```

### Get Trending Posts
```http
GET /posts/trending
```

---

## Comment Endpoints

### Get Post Comments
```http
GET /comments/post/:postId?page=1&limit=20
```

### Create Comment
```http
POST /comments
```
*Requires authentication*

**Request Body:**
```json
{
  "postId": "post_id",
  "content": "Comment text",
  "parentCommentId": "parent_id" // optional for replies
}
```

### Update Comment
```http
PUT /comments/:id
```
*Requires authentication*

**Request Body:**
```json
{
  "content": "Updated comment"
}
```

### Delete Comment
```http
DELETE /comments/:id
```
*Requires authentication*

### Like Comment
```http
POST /comments/:id/like
```
*Requires authentication*

### Unlike Comment
```http
DELETE /comments/:id/unlike
```
*Requires authentication*

---

## Message Endpoints

### Get Conversations
```http
GET /messages/conversations
```
*Requires authentication*

### Get Messages with User
```http
GET /messages/:userId?page=1&limit=50
```
*Requires authentication*

### Send Message
```http
POST /messages
```
*Requires authentication*

**Request Body:**
```json
{
  "receiverId": "user_id",
  "content": "Message text"
}
```

### Mark Message as Read
```http
PUT /messages/:id/read
```
*Requires authentication*

### Delete Message
```http
DELETE /messages/:id
```
*Requires authentication*

### Get Unread Count
```http
GET /messages/unread/count
```
*Requires authentication*

---

## Admin Endpoints
*All admin endpoints require authentication and admin role*

### Get Statistics
```http
GET /admin/stats
```

### Get All Users
```http
GET /admin/users?page=1&limit=20&status=active&role=user
```

### Get User Details
```http
GET /admin/users/:id
```

### Update User
```http
PUT /admin/users/:id
```

**Request Body:**
```json
{
  "firstName": "John",
  "role": "admin",
  "isActive": true,
  "isVerified": true
}
```

### Delete User
```http
DELETE /admin/users/:id
```

### Suspend User
```http
PUT /admin/users/:id/suspend
```

### Reactivate User
```http
PUT /admin/users/:id/reactivate
```

### Get All Posts
```http
GET /admin/posts?page=1&limit=20&status=active
```

### Delete Post (Moderation)
```http
DELETE /admin/posts/:id
```

### Get All Comments
```http
GET /admin/comments?page=1&limit=20&status=active
```

### Delete Comment (Moderation)
```http
DELETE /admin/comments/:id
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Server Error

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Password Reset: 3 requests per hour
- File Upload: 10 uploads per 15 minutes
- Post Creation: 20 posts per hour
- Messages: 10 messages per minute

---

## WebSocket Events

### Client to Server
- `user-online` - User connects
- `typing` - User is typing
- `send-message` - Send real-time message
- `send-notification` - Send notification

### Server to Client
- `user-status` - User online/offline status
- `user-typing` - Typing indicator
- `receive-message` - New message received
- `receive-notification` - New notification
- `post-liked` - Post was liked
- `comment-added` - New comment added
- `post-created` - New post created
