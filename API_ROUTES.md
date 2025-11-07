# PixelFlow API Routes

A structured reference for all REST API endpoints used in the **PixelFlow** project — a hybrid of YouTube and Reddit, where users can upload videos, join topic-based discussion rooms (called *Flows*), and share *Echos* (messages).

---

## ★ User Routes

| Method    | Endpoint                          | Description                                         |
| --------- | --------------------------------- | --------------------------------------------------- |
| **POST**  | `/api/v1/users/register`          | Register a new user (uploads avatar + cover image). |
| **POST**  | `/api/v1/users/login`             | Log in user and generate tokens.                    |
| **POST**  | `/api/v1/users/logout`            | Logout current user (requires authentication).      |
| **POST**  | `/api/v1/users/refresh-token`     | Refresh the access token.                           |
| **POST**  | `/api/v1/users/change-password`   | Change the current user's password.                 |
| **GET**   | `/api/v1/users/current-user`      | Fetch current logged-in user's info.                |
| **PATCH** | `/api/v1/users/update-account`    | Update user account details.                        |
| **PATCH** | `/api/v1/users/avatar`            | Update avatar (image upload).                       |
| **PATCH** | `/api/v1/users/cover-image`       | Update cover image (image upload).                  |
| **GET**   | `/api/v1/users/channel/:username` | Get a user's public channel profile.                |
| **GET**   | `/api/v1/users/history`           | Get user watch history.                             |

---

## ★ Video Routes

| Method     | Endpoint                                       | Description                                                       |
| ---------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| **GET**    | `/api/v1/videos`                               | Get all published videos (requires authentication).               |
| **POST**   | `/api/v1/videos`                               | Upload a new video (thumbnail + video file).                      |
| **GET**    | `/api/v1/videos/search?q=query&page=x&limit=y` | Search videos using a custom logic (tags, score, synonyms, etc.). |
| **GET**    | `/api/v1/videos/user/:user_id?page=x&limit=y`  | Get all videos uploaded by a specific user.                       |
| **GET**    | `/api/v1/videos/:video_id`                     | Get video details by ID.                                          |
| **DELETE** | `/api/v1/videos/:video_id`                     | Delete a video (auth required).                                   |
| **PATCH**  | `/api/v1/videos/:video_id`                     | Update video details or thumbnail.                                |
| **PATCH**  | `/api/v1/videos/toggle/:video_id`              | Toggle video visibility (public/private).                         |

---

## ★ Comment Routes

| Method     | Endpoint                                    | Description                            |
| ---------- | ------------------------------------------- | -------------------------------------- |
| **GET**    | `/api/v1/comments/:video_id?page=x&limit=y` | Get all comments for a specific video. |
| **POST**   | `/api/v1/comments/:video_id`                | Add a comment to a video.              |
| **DELETE** | `/api/v1/comments/:video_id/:comment_id`    | Delete user's own comment.             |
| **PATCH**  | `/api/v1/comments/:video_id/:comment_id`    | Update an existing comment.            |

---

## ★ Like Routes

| Method   | Endpoint                                     | Description                                               |
| -------- | -------------------------------------------- | --------------------------------------------------------- |
| **POST** | `/api/v1/likes/:asset_type/:asset_id`        | Toggle like/unlike on an asset (video, comment, or flow). |
| **GET**  | `/api/v1/likes`                              | Get all assets liked by the current user.                 |
| **GET**  | `/api/v1/likes/:asset_type/:asset_id/all`    | Get all likes for a given asset.                          |
| **GET**  | `/api/v1/likes/:asset_type/:asset_id/count`  | Get total like count for an asset.                        |
| **GET**  | `/api/v1/likes/:asset_type/:asset_id/status` | Check if the current user liked a specific asset.         |

---

## ★ Playlist Routes

| Method     | Endpoint                                         | Description                                   |
| ---------- | ------------------------------------------------ | --------------------------------------------- |
| **POST**   | `/api/v1/playlists/:playlist_id/video/:video_id` | Add video to a playlist.                      |
| **DELETE** | `/api/v1/playlists/:playlist_id/video/:video_id` | Remove video from a playlist.                 |
| **GET**    | `/api/v1/playlists/user/:user_id?page=x&limit=y` | Get all playlists created by a specific user. |

---

## ★ Subscription Routes

| Method   | Endpoint                                    | Description                                          |
| -------- | ------------------------------------------- | ---------------------------------------------------- |
| **GET**  | `/api/v1/subscriptions/channel/:channel_id` | Get all subscribers of a channel.                    |
| **POST** | `/api/v1/subscriptions/channel/:channel_id` | Subscribe or unsubscribe from a channel.             |
| **GET**  | `/api/v1/subscriptions/subscribe/:user_id`  | Get all subscriptions (channels followed) by a user. |

---

## ★ Flow Routes (Reddit-style Rooms)

| Method     | Endpoint                 | Description                                                         |
| ---------- | ------------------------ | ------------------------------------------------------------------- |
| **POST**   | `/api/v1/flows`          | Create a new Flow (discussion room).                                |
| **GET**    | `/api/v1/flows`          | Get all available Flows (optionally filter by topic or video type). |
| **GET**    | `/api/v1/flows/:flow_id` | Get details of a Flow and its associated Echos.                     |
| **PATCH**  | `/api/v1/flows/:flow_id` | Update Flow information or rules.                                   |
| **DELETE** | `/api/v1/flows/:flow_id` | Delete a Flow (admin/moderator only).                               |

---

## ★ Echo Routes (Messages in Flows)

| Method     | Endpoint                                | Description                              |
| ---------- | --------------------------------------- | ---------------------------------------- |
| **POST**   | `/api/v1/echos/:flow_id`                | Post a new Echo (message) inside a Flow. |
| **GET**    | `/api/v1/echos/:flow_id?page=x&limit=y` | Get all Echos for a specific Flow.       |
| **PATCH**  | `/api/v1/echos/:flow_id/:echo_id`       | Edit an existing Echo.                   |
| **DELETE** | `/api/v1/echos/:flow_id/:echo_id`       | Delete user's own Echo.                  |

---

### Notes

* All authenticated routes require a valid JWT token.
* File uploads use **Multer** and are stored on **Cloudinary**.
* Video search includes scoring logic based on engagement rate, matched words, and freshness.
* Pagination is supported across all list-based routes (`page` and `limit` query params).

---

**Author:** Leo Conan
**Project:** PixelFlow — YouTube × Reddit Hybrid Platform
**Inspiration:** Based on backend structure learned from *Chai aur Code* channel.
