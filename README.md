# PixelFlow

PixelFlow is a modern video-sharing and discussion platform that combines the core functionality of YouTube with the community features of Reddit.  
Users can upload videos, create playlists, join discussion rooms called *Flows*, and share messages called *Echos* around specific topics or videos.

---

## Overview

**PixelFlow** provides a social video experience built on Node.js and MongoDB.  
It supports video uploads to Cloudinary, user authentication via JWT, advanced semantic search, and interactive discussion flows.

---

## Features

### Video System
- Upload, update, delete, and fetch videos.
- Files are first stored locally via **Multer**, then uploaded to **Cloudinary**.
- Toggle public/private status.
- Smart ranking and semantic search with relevance and engagement scoring.

### Comment System
- Add, edit, and delete comments.
- Nested comment structure for replies.
- Pagination support for large threads.

### Like System
- Like or unlike videos, comments, playlists, or flows.
- Retrieve total likes and check like status per asset type.

### Playlist System
- Create, edit, and delete playlists.
- Add or remove videos from playlists.
- Fetch all playlists created by a user.

### Subscription System
- Subscribe or unsubscribe from channels.
- Retrieve subscriber count and subscription list.

### Flow and Echo System
- **Flows** are topic-based rooms where users can discuss related videos.
- **Echos** are individual messages within a flow.
- Flows encourage community-based discussions around common interests.

### Search Algorithm
The custom search system performs semantic matching and ranking using a weighted scoring model.

**Key steps:**
1. Normalize and tokenize the query.
2. Remove stop words.
3. Generate `tags[]` automatically from video title and description.
4. Expand search using plural forms, synonyms, and similar words (limited to three of each).
5. Rank results using:

```
score = ((matchedWords * log(views) + 2 * engagementRate + subscribedTo)) / ((currentTime - createdAt) + e)
```

where  
`engagementRate = (likes * 0.5 + comments * 0.3 + views * 0.2)`  
and `e = 10` prevents extreme values.

6. Sort by score, privacy, and creation date.

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT (Access & Refresh Tokens) |
| File Uploads | Multer + Cloudinary |
| Search Enhancement | pluralize, synonyms, similar-words |
| Middleware | verifyJWT, custom error handler |
| Environment Management | dotenv |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/iamsagnik/pixelflow.git

# Navigate to project directory
cd pixelflow

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start the server
npm run dev
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| CORS_ORIGIN | CORS allowed origins |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| JWT_SECRET | Secret for JWT tokens |
| ACCESS_TOKEN_SECRET | Secret for access tokens |
| REFRESH_TOKEN_SECRET | Secret for refresh tokens |
| ACCESS_TOKEN_EXPIRY | Expiration time for access tokens (in seconds) |
| REFRESH_TOKEN_EXPIRY | Expiration time for refresh tokens (in seconds) |

---

## Future Enhancements

- Trending page using engagement growth rate.
- Vector-based semantic search using embeddings.
- Real-time Echos with WebSockets.
- Notification system for interactions.
- AI-generated video tags via NLP.
- Flow analytics and insights.

---

## Acknowledgements

- Built with guidance and inspiration from [Chai Aur Code](https://www.youtube.com/@chaiaurcode) YouTube channel
- Thanks to the open source community for:
  - Code best practices and patterns
  - Documentation examples
  - Learning resources and tutorials

---
## Development

Built with a modern tech stack:

- **Node.js & Express.js** - Fast, unopinionated backend framework
- **MongoDB** - Flexible NoSQL database with Mongoose ODM
- **Cloudinary** - Cloud storage for video content
- **JWT** - Secure authentication and session management
- **Search Algorithms** - Custom semantic search implementation

---
