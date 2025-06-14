# Book Nest - Server

## Project Name  
**Book Nest Backend**

## Purpose  
This backend service powers the Virtual Bookshelf web application by managing user authentication, book records, reviews, and upvotes. It uses Node.js and Express to provide secure and efficient RESTful APIs connected to MongoDB for data storage. The backend verifies Firebase tokens, issues JWTs for session management, and enforces access control on private routes.


## Key Features  
- User authentication and authorization using Firebase Admin SDK and JWT  
- CRUD operations for books and reviews with MongoDB  
- Upvote functionality preventing users from upvoting their own books  
- Reading status update and progress tracking  
- Secure environment-based configuration for database and secrets  
- CORS handling to enable communication with the client app  
- Middleware for JWT verification and route protection  

## npm Packages Used  
- **express** — Node.js framework to build RESTful APIs  
- **cors** — Middleware to enable Cross-Origin Resource Sharing  
- **dotenv** — Loads environment variables from `.env` file for security  
- **firebase-admin** — Firebase Admin SDK for verifying authentication tokens  
- **jsonwebtoken** — Generate and verify JWT tokens for secure sessions  
- **cookie-parser** — Parse and manage cookies in HTTP requests  
- **mongodb** — Official MongoDB driver for Node.js, handling data operations  
