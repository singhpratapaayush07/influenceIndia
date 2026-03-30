# Enterprise Authentication Setup

This document describes the enterprise-level authentication flow implemented in this project.

## Features

### 1. **Multi-Factor Signup Flow**
- **Step 1**: User selects account type (Brand/Influencer)
- **Step 2**: Enter email address
- **Step 3**: Verify email via 6-digit OTP (sent via email)
- **Step 4**: Create password
- **QA Exception**: Emails ending with `@qa.com` bypass OTP verification

### 2. **Login Options**
- **Password-based login**: Email + Password
- **Google OAuth**: Sign in with Google account
- **Forgot password**: OTP-based password reset flow

### 3. **Password Reset Flow**
- **Step 1**: Enter email address
- **Step 2**: Verify identity via OTP
- **Step 3**: Create new password

## Database Changes

### Modified Tables

#### `users` table
```prisma
- password: Now nullable (for OAuth-only users)
+ emailVerified: Boolean (tracks email verification status)
+ authProvider: String? (tracks OAuth provider: "google" or null)
```

#### New `otp_verifications` table
```prisma
- id: String (CUID)
- email: String
- otp: String (hashed with bcrypt)
- purpose: "signup" | "reset-password"
- expiresAt: DateTime (10 minutes)
- attempts: Int (max 5 attempts)
- createdAt: DateTime
```

## API Endpoints

### OTP Management
- `POST /api/auth/otp/send` - Send OTP to email
  - Rate limit: 3 OTPs per hour per email
  - Purpose: "signup" or "reset-password"
  - Returns `{ skipOtp: true }` for @qa.com emails

- `POST /api/auth/otp/verify` - Verify OTP
  - Max 5 attempts per OTP
  - OTP expires in 10 minutes
  - Single-use (deleted after verification)

### Authentication
- `POST /api/auth/signup` - Create account (requires OTP verification)
- `POST /api/auth/signup-oauth` - Create account via OAuth
- `POST /api/auth/reset-password` - Reset password (requires OTP verification)

### OAuth Providers
- Google OAuth configured in NextAuth
- Redirects to signup if user doesn't exist
- Auto-creates user after selecting account type

## Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY="re_your_api_key"
FROM_EMAIL="InfluenceIndia <noreply@yourdomain.com>"

# Google OAuth
GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret"
```

### Setup Instructions

1. **Resend Email Service**
   - Sign up at [resend.com](https://resend.com)
   - Go to API Keys section
   - Create a new API key
   - Add to `RESEND_API_KEY`

2. **Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project (or select existing)
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (dev) and `https://yourdomain.com/api/auth/callback/google` (prod)
   - Copy Client ID and Client Secret

## Security Features

### OTP Security
- **Hashing**: All OTPs are hashed with bcrypt before storage
- **Expiration**: OTPs expire after 10 minutes
- **Rate Limiting**: Max 3 OTP requests per email per hour
- **Attempt Limiting**: Max 5 verification attempts per OTP
- **Single-use**: OTPs are deleted after successful verification

### Password Security
- **Minimum length**: 6 characters
- **Hashing**: bcrypt with 12 rounds
- **Password-less OAuth users**: Cannot reset password (must use OAuth)

### Session Security
- JWT-based sessions (NextAuth)
- Includes `emailVerified` and `authProvider` in session claims
- CSRF protection enabled

## Testing with QA Emails

For testing purposes, any email ending with `@qa.com` will:
- Skip OTP verification during signup
- Skip OTP verification during password reset
- Still require password creation
- Work in all environments

Example QA emails:
- `test@qa.com`
- `brand@qa.com`
- `influencer@qa.com`

## User Flows

### New User Signup (Email/Password)
```
1. Select account type (Brand/Influencer)
2. Enter email → OTP sent
3. Enter 6-digit OTP → Email verified
4. Create password → Account created
5. Auto sign-in → Redirect to onboarding
```

### New User Signup (Google)
```
1. Click "Continue with Google"
2. Google OAuth flow
3. If new user → Select account type
4. Account created → Redirect to onboarding
```

### Existing User Login
```
Option A: Email/Password
1. Enter email + password
2. Sign in → Redirect to dashboard

Option B: Google
1. Click "Sign in with Google"
2. Google OAuth flow
3. Sign in → Redirect to dashboard
```

### Forgot Password
```
1. Enter email → OTP sent
2. Enter 6-digit OTP → Identity verified
3. Create new password → Password updated
4. Redirect to login
```

## Components

### New Components
- `<OtpInput />` - 6-digit OTP input with auto-focus and paste support
- Updated signup page with multi-step flow
- Updated login page with Google OAuth
- New forgot password page

### Component Features
- **OTP Input**:
  - Auto-focus on mount
  - Auto-advance to next digit
  - Keyboard navigation (arrows, backspace)
  - Paste support (auto-fill all digits)
  - Disabled state during verification

- **Resend Timer**:
  - 60-second countdown
  - Prevents spam
  - Shows "Resend code" when timer expires

## Migration Notes

### For Existing Users
- Existing password-based accounts continue to work
- Email will remain unverified until they reset password or verify email
- No action required from existing users

### Database Migration
Run the migration:
```bash
npx prisma migrate dev
```

This will:
- Add `emailVerified` and `authProvider` to `users` table
- Create `otp_verifications` table
- Set existing users' `emailVerified` to false

## Troubleshooting

### OTP Not Received
1. Check spam/junk folder
2. Verify `RESEND_API_KEY` is correct
3. Check Resend dashboard for delivery status
4. Verify `FROM_EMAIL` is using a verified domain

### Google OAuth Not Working
1. Verify redirect URIs match exactly
2. Check Google Cloud Console for errors
3. Ensure Google+ API is enabled
4. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Rate Limit Errors
- Wait 1 hour before requesting new OTP
- Use @qa.com email for unlimited testing

## Future Enhancements

Potential improvements:
- [ ] SMS OTP as alternative to email
- [ ] Email verification reminders
- [ ] OAuth providers (Facebook, Apple)
- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication
- [ ] Session management dashboard
- [ ] Security audit logs
