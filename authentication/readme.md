# Authentication Methods Demo

This project demonstrates different authentication mechanisms commonly used in web applications. It includes implementations of:
1. Email/Password with JWT (JSON Web Tokens)
2. Email/Password with HTTP-only Cookies
3. OAuth 2.0 with Google

## Understanding Authentication Mechanisms

### JWT (JSON Web Tokens)

#### What is JWT?
JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. JWTs can be verified and trusted because they are digitally signed.

#### Structure of a JWT
A JWT consists of three parts, separated by dots (.):
1. **Header**: Contains metadata about the token (type and signing algorithm)
   ```json
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   ```

2. **Payload**: Contains the claims (data)
   ```json
   {
     "id": "1234567890",
     "email": "user@example.com",
     "iat": 1516239022,
     "exp": 1516242622
   }
   ```

3. **Signature**: Ensures the token hasn't been altered
   ```javascript
   HMACSHA256(
     base64UrlEncode(header) + "." + base64UrlEncode(payload),
     secret_key
   )
   ```

#### How JWT Works
1. **Authentication Process**:
   ```
   Client                                Server
     │                                     │
     │ ──── Login Request ───────────────> │
     │                                     │ ──┐
     │                                     │   │ Create JWT
     │                                     │   │ with payload
     │                                     │ <─┘
     │ <─── JWT Token in Response ──────── │
     │                                     │
     │ ──── Request + JWT in Header ────── │
     │                                     │ ──┐
     │                                     │   │ Verify JWT
     │                                     │   │ signature
     │                                     │ <─┘
     │ <─── Protected Resource ─────────── │
   ```

2. **Token Storage**:
   - Stored in client's localStorage
   - Sent in Authorization header: `Bearer <token>`
   - No server-side storage needed (stateless)

### Cookie-based Authentication

#### What are HTTP-only Cookies?
HTTP-only cookies are special cookies that can't be accessed by JavaScript in the browser, making them more secure against XSS attacks.

#### How Cookie Auth Works
1. **Cookie Creation and Storage**:
   ```
   Client                                Server
     │                                     │
     │ ──── Login Request ───────────────> │
     │                                     │ ──┐
     │                                     │   │ Generate
     │                                     │   │ session token
     │                                     │ <─┘
     │ <── Set-Cookie Header in Response ─ │
     │                                     │
     │ ──── Request + Cookie(auto) ─────── │
     │                                     │ ──┐
     │                                     │   │ Validate
     │                                     │   │ cookie
     │                                     │ <─┘
     │ <─── Protected Resource ─────────── │
   ```

2. **Cookie Attributes**:
   ```javascript
   res.cookie('token', value, {
     httpOnly: true,    // No JS access
     secure: true,      // HTTPS only
     sameSite: 'strict',// CSRF protection
     maxAge: 3600000    // 1 hour
   });
   ```

### OAuth 2.0 (with Google)

#### What is OAuth 2.0?
OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service. It works by delegating user authentication to the service that hosts the user account and authorizing third-party applications to access that user account.

#### OAuth 2.0 Flow (Authorization Code)
```
┌─────────┐                         ┌──────────┐                    ┌───────────┐
│         │                         │          │                    │           │
│         │                         │          │                    │           │
│ Browser │                         │  Server  │                    │  Google   │
│         │                         │          │                    │           │
└────┬────┘                         └────┬─────┘                    └─────┬─────┘
     │                                   │                                │
     │ 1. Click "Login with Google"      │                                │
     │ ───────────────────────────────>  │                                │
     │                                   │                                │
     │                                   │ 2. Redirect to Google          │
     │ <──────────────────────────────── │                                │
     │                                   │                                │
     │ 3. Google login page             │                                │
     │ ───────────────────────────────────────────────────────────────>  │
     │                                   │                                │
     │ 4. User consents                  │                                │
     │ <─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
     │                                   │                                │
     │ 5. Redirect with auth code        │                                │
     │ ───────────────────────────────>  │                                │
     │                                   │                                │
     │                                   │ 6. Exchange code for tokens    │
     │                                   │ ───────────────────────────>   │
     │                                   │                                │
     │                                   │ 7. Access & Refresh tokens     │
     │                                   │ <─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
     │                                   │                                │
     │ 8. Set cookies & redirect         │                                │
     │ <──────────────────────────────── │                                │
     │                                   │                                │
```

#### OAuth 2.0 Components
1. **Authorization Code**:
   - Temporary code obtained after user consent
   - Used to obtain access token
   - Short-lived (usually minutes)

2. **Access Token**:
   - Used to access protected resources
   - Limited lifetime (usually hours)
   - Sent in Authorization header

3. **Refresh Token**:
   - Used to obtain new access tokens
   - Long-lived (days/months)
   - Stored securely in HTTP-only cookie

## Project Structure

```
authentication/
├── client/             # Next.js Frontend
│   └── src/
│       └── app/
│           ├── context/
│           │   └── auth-context.tsx    # Authentication context
│           ├── email-password-jwt/     # JWT auth pages
│           ├── login-cookie/           # Cookie auth pages
│           ├── protected/              # Protected dashboard
│           └── oauth/                  # OAuth pages
└── server/
    ├── auth+jwt.js     # JWT and Cookie auth implementation
    └── oauth.js        # OAuth 2.0 implementation
```

## Authentication Mechanisms

### 1. Email/Password with JWT

#### Flow
1. **Registration**:
   ```
   Client → POST /register → Server
   - Validates email/password
   - Hashes password with bcrypt
   - Stores user in database
   ```

2. **Login**:
   ```
   Client → POST /login-local → Server
   - Validates credentials
   - Creates JWT token
   - Returns token in response
   Client stores token in localStorage
   ```

3. **Authentication**:
   ```
   Client → Request with Bearer token → Server
   Server validates token using JWT_SECRET
   ```

#### Security Features
- Password hashing using bcrypt (10 rounds)
- JWT expiration after 15 minutes
- Token stored in localStorage (client-side)
- Authorization header for API requests

### 2. Email/Password with HTTP-only Cookies

#### Flow
1. **Registration**: (Same as JWT)

2. **Login**:
   ```
   Client → POST /login-cookie → Server
   - Validates credentials
   - Creates JWT token
   - Sets token in HTTP-only cookie
   - Returns success message
   ```

3. **Authentication**:
   ```
   Client → Request with cookie → Server
   Server validates cookie token
   Cookie automatically sent with requests
   ```

#### Security Features
- HTTP-only cookies prevent JavaScript access
- Secure cookie option for HTTPS
- Same-site cookie policy
- Server-side token storage
- CSRF protection through cookie settings

### 3. OAuth 2.0 (Google)

#### Flow
1. **Initiate Login**:
   ```
   Client → /auth/google → Google Authorization
   - Redirects to Google login
   - Requests email and profile scope
   ```

2. **Authorization**:
   ```
   Google → /auth/google/callback → Server
   - Returns authorization code
   - Server exchanges code for tokens
   - Sets access_token in HTTP-only cookie
   ```

3. **Profile Access**:
   ```
   Client → /profile → Server → Google API
   - Uses access_token from cookie
   - Fetches user profile from Google
   ```

#### Security Features
- OAuth 2.0 standard compliance
- Secure token exchange
- HTTP-only cookie storage
- Refresh token handling
- State parameter for CSRF protection

## Frontend Implementation

### Protected Routes
- Client-side route protection
- Authentication state management
- Auto-redirect for unauthorized access

### Authentication Context
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}
```

### Persistence
- JWT stored in localStorage
- Cookies handled automatically
- Auth state preserved across refreshes

## API Endpoints

### JWT & Cookie Auth
```
POST /register
- Body: { email: string, password: string }
- Returns: { status: boolean, message: string }

POST /login-local
- Body: { email: string, password: string }
- Returns: { status: boolean, token: string }

POST /login-cookie
- Body: { email: string, password: string }
- Sets: HTTP-only cookie
- Returns: { status: boolean, message: string }

GET /validate
- Auth: Required
- Returns: { valid: boolean, user: User }

POST /logout
- Clears: Authentication cookies
- Returns: { status: boolean, message: string }
```

### OAuth Endpoints
```
GET /auth/google
- Redirects to Google login

GET /auth/google/callback
- Handles OAuth response
- Sets: access_token cookie
- Redirects to: /profile

GET /profile
- Auth: Required (access_token cookie)
- Returns: User profile from Google
```

## Security Best Practices Implemented

1. **Password Security**
   - Bcrypt hashing
   - Salt rounds configuration
   - No plain-text storage

2. **Token Security**
   - Short JWT expiration
   - Secure cookie flags
   - HTTP-only cookie usage

3. **CORS Configuration**
   ```javascript
   cors({
     origin: "http://localhost:3000",
     credentials: true
   })
   ```

4. **Error Handling**
   - Secure error messages
   - No sensitive data exposure
   - Proper status codes

## Security Considerations for Each Method

### JWT Security
1. **Advantages**:
   - Stateless authentication
   - No session storage needed
   - Works well with APIs
   - Cross-domain authentication

2. **Vulnerabilities**:
   - XSS can expose tokens in localStorage
   - Token can't be invalidated before expiry
   - Size increases with more data
   - Client must protect token storage

3. **Best Practices**:
   - Short expiration times
   - Use refresh tokens for renewal
   - Implement token blacklisting for critical systems
   - Secure token transmission (HTTPS)

### Cookie Security
1. **Advantages**:
   - Protected from XSS (HTTP-only)
   - Automatic transmission
   - Can be secured for HTTPS only
   - Server can invalidate sessions

2. **Vulnerabilities**:
   - CSRF attacks possible
   - Limited to domain
   - Size limitations
   - Requires session storage

3. **Best Practices**:
   - Use secure and HTTP-only flags
   - Implement CSRF tokens
   - Set appropriate SameSite attribute
   - Regular session cleanup

### OAuth 2.0 Security
1. **Advantages**:
   - Delegated authentication
   - No password handling
   - Limited scope access
   - Industry standard

2. **Vulnerabilities**:
   - Phishing risks
   - Authorization code interception
   - Token leakage
   - Callback endpoint security

3. **Best Practices**:
   - Validate state parameter
   - Use PKCE extension
   - Secure client credentials
   - Validate redirect URIs

## Getting Started

1. **Setup Environment**
   ```bash
   # Server
   cd server
   npm install
   # For OAuth, set up .env with:
   GOOGLE_OAUTH_CLIENT_ID=your_client_id
   GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret

   # Client
   cd client
   npm install
   ```

2. **Start Servers**
   ```bash
   # Server (runs on :8080)
   node auth+jwt.js
   # or for OAuth
   node oauth.js

   # Client (runs on :3000)
   npm run dev
   ```

3. **Test Authentication**
   - Visit http://localhost:3000
   - Try different auth methods
   - Check network tab for token/cookie handling
   - Verify protected route access

## Production Considerations

1. **Security Enhancements**
   - Enable secure cookie flag
   - Implement rate limiting
   - Add CSRF protection
   - Use HTTPS

2. **Token Management**
   - Implement refresh token rotation
   - Add token revocation
   - Monitor token usage

3. **Error Handling**
   - Add detailed logging
   - Implement retry mechanisms
   - Add monitoring
