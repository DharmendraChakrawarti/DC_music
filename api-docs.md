# DC Music - API Documentation

Base URL: `http://localhost:8080/api`

## Authentication

### `POST /auth/register`
Creates a new user account. First user registered defaults to ADMIN.
- **Request Body:** `{ "name": "John", "email": "john@email.com", "password": "password" }`
- **Response:** `{ "token": "JWT_TOKEN", "role": "USER", "name": "John", "email": "john@email.com" }`

### `POST /auth/login`
Authenticates a user.
- **Request Body:** `{ "email": "john@email.com", "password": "password" }`
- **Response:** `{ "token": "JWT_TOKEN", "role": "USER", "name": "John", "email": "john@email.com" }`

---

## Songs

*Note: The following endpoints require the Authorization header `Bearer {token}` except for the stream endpoint.*

### `POST /songs/upload`
Uploads a single song. `multipart/form-data`.
- **Params:** `file` (File), `title` (String), `artist` (String), `album` (String)
- **Response:** Created Song Object

### `POST /songs/upload-bulk`
Uploads multiple songs at once. `multipart/form-data`.
- **Params:** `files` (Array of Files)
- **Response:** `"Bulk upload successful."`

### `GET /songs/global`
Retrieves all songs that have visibility = GLOBAL (approved by admin).
- **Response:** Array of Song Objects

### `GET /songs/my-songs`
Retrieves all private/pending songs uploaded by the currently authenticated user.
- **Response:** Array of Song Objects

### `DELETE /songs/{id}`
Deletes a song. Can only be done by the uploader or an admin.
- **Response:** `"Deleted successfully"`

### `GET /songs/stream/{fileName}`
Streams the audio file in the browser. *Does not require authentication.*
- **Response:** `audio/mpeg` byte stream

---

## Playlists

### `POST /playlists?name={name}`
Creates a new playlist for the signed-in user.
- **Response:** Created Playlist Object

### `POST /playlists/{playlistId}/add/{songId}`
Adds an existing song to a playlist.
- **Response:** Updated Playlist Object

### `GET /playlists`
Retrieves all playlists for the signed-in user.
- **Response:** Array of Playlist Objects

---

## Admin Panel (Role = ADMIN only)

### `GET /admin/songs`
Retrieves all songs indiscriminately across the system (pending, approved, rejected).
- **Response:** Array of Song Objects

### `POST /admin/songs/{id}/approve`
Approves a user-uploaded `PENDING` song, switching it to `APPROVED` and `GLOBAL`.
- **Response:** Updated Song Object
