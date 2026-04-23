# DailyFeed

DailyFeed is a full-stack social feed web application that lets users register, log in, publish posts with optional images, comment on posts, and view user profiles. The project includes a Node.js and Express backend, a MongoDB database, JWT authentication, Cloudinary image uploads, and a browser-based frontend built with HTML, CSS, JavaScript, Bootstrap, and Axios.

## Features

- User registration and login
- Profile image upload
- Create posts with title, body, tags, and optional image
- Edit and delete posts owned by the logged-in user
- View post details with comments
- Add comments to posts
- View public user profiles and their post statistics
- Responsive Bootstrap-based interface
- Light and dark theme toggle

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- Bootstrap
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Cloudinary
- CORS
- Helmet
- Morgan

## Project Structure

- client/ - Frontend pages, styles, and browser scripts
- server/ - Express API, database models, and routes
- profile-pics/ - Local image assets and placeholders
- commands.txt - Project commands and notes

## API Overview

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Users
- GET /api/users/:id
- GET /api/users/:id/posts

### Posts
- GET /api/posts
- GET /api/posts/:id
- POST /api/posts
- PUT /api/posts/:id
- POST /api/posts/:id
- DELETE /api/posts/:id

### Comments
- POST /api/posts/:id/comments

## Environment Variables

Create a .env file inside the server folder with the following variables:

- MONGO_URI
- JWT_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
