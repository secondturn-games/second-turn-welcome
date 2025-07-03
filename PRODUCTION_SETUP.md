# Production Setup: Landing Page Only

This guide explains how to deploy only your landing page to production while keeping all other pages in preview mode.

## Approach 1: Environment-Based Conditional Rendering (Recommended)

### 1. Update your middleware to handle production routing

The middleware has been updated to redirect non-landing pages to a maintenance page in production.

### 2. Set up environment variables

In your Vercel dashboard:
- Go to your project settings
- Add environment variable: `PRODUCTION_MODE=landing_only`
- Set it for "Production" environment only

### 3. Deploy to production

```bash
git add .
git commit -m "Setup production mode for landing page only"
git push origin main
```

## Approach 2: Branch-Based Deployment (Alternative)

### 1. Create separate branches

```bash
# Create a production branch with only landing page
git checkout -b production
```

### 2. In Vercel dashboard

1. Go to your project settings
2. Set "Production Branch" to `production` 
3. Set main branch to deploy to preview only
4. Configure custom domains:
   - yourdomain.com → production branch
   - preview.yourdomain.com → main branch

### 3. Deploy workflow

```bash
# For landing page updates (goes to production)
git checkout production
git merge main -- src/app/page.tsx src/app/layout.tsx
git push origin production

# For full site updates (goes to preview)
git checkout main
# Make your changes
git push origin main
```

## Approach 3: Vercel Configuration

### 1. Create a custom vercel.json

```json
{
  "functions": {
    "src/app/page.tsx": {
      "runtime": "@vercel/node"
    }
  },
  "routes": [
    {
      "src": "^/$",
      "dest": "/api/landing"
    },
    {
      "src": "^/((?!api|_next|static).*)",
      "dest": "/maintenance"
    }
  ]
}
```

### 2. Set up redirects in next.config.ts

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    if (process.env.NODE_ENV === 'production' && process.env.PRODUCTION_MODE === 'landing_only') {
      return [
        {
          source: '/((?!^/$|api|_next|static|maintenance).*)',
          destination: '/maintenance',
          permanent: false,
        },
      ]
    }
    return []
  },
}

export default nextConfig
```

## Current Setup

✅ **Maintenance page created** at `/maintenance`
✅ **Middleware updated** to handle production routing
✅ **Landing page preserved** at `/`

## Testing

### Local testing
```bash
# Test production mode locally
NODE_ENV=production PRODUCTION_MODE=landing_only npm run build
npm run start
```

### Preview testing
```bash
# Test preview mode
npm run dev
```

## Deployment Commands

```bash
# Deploy to production (landing page only)
vercel --prod

# Deploy to preview (full site)
vercel
```

## Environment Variables Needed

- `PRODUCTION_MODE=landing_only` (Production environment only)
- Keep all other env vars as they are

## Monitoring

- Production: Only landing page accessible
- Preview: Full site accessible
- All API routes work in both environments
- Authentication flows work in preview only

## Rollback Plan

To enable full site in production:
1. Remove `PRODUCTION_MODE` environment variable
2. Redeploy

## Notes

- Your landing page (`src/app/page.tsx`) will be fully functional in production
- All other pages redirect to maintenance page in production
- Preview deployments have full functionality
- API routes remain accessible in both environments