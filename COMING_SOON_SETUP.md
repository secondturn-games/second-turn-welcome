# Coming Soon Page Setup

This project now includes a beautiful "coming soon" landing page that you can easily toggle on/off using environment variables.

## 🚀 How to Use

### Enable Coming Soon Page
To show the coming soon page instead of your full site:

1. Set the environment variable in your `.env.local` file:
   ```bash
   NEXT_PUBLIC_COMING_SOON=true
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

### Disable Coming Soon Page (Show Full Site)
To show your full application:

1. Change the environment variable in your `.env.local` file:
   ```bash
   NEXT_PUBLIC_COMING_SOON=false
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

## 🎨 Features

The coming soon page includes:
- **Beautiful, animated design** using Framer Motion
- **Email signup form** for collecting interested users
- **Mobile responsive** design
- **Board game theme** matching your site's aesthetic
- **Professional animations** and interactions
- **Feature preview** showcasing what's coming

## 🔧 Customization

### Update Content
Edit `src/components/coming-soon.tsx` to customize:
- Heading text and messaging
- Brand name (currently "Board Game Hub")
- Feature descriptions
- Color scheme
- Animation timing

### Email Integration
The email signup currently shows a success message. To integrate with your email service:

1. Open `src/components/coming-soon.tsx`
2. Find the `handleEmailSubmit` function
3. Replace the mock implementation with your email service API call

Example integrations:
- **Mailchimp**: Use their API to add subscribers
- **ConvertKit**: Use their forms API
- **Email providers**: Any REST API for email collection

### Deployment

For different environments:

**Development**: Use `.env.local`
```bash
NEXT_PUBLIC_COMING_SOON=true
```

**Production (Coming Soon)**: Set environment variable in your hosting platform
```bash
NEXT_PUBLIC_COMING_SOON=true
```

**Production (Full Site)**: Set environment variable in your hosting platform
```bash
NEXT_PUBLIC_COMING_SOON=false
```

## 🌐 Hosting Platform Setup

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add: `NEXT_PUBLIC_COMING_SOON` with value `true` or `false`
4. Redeploy

### Netlify
1. Go to Site settings > Environment variables
2. Add: `NEXT_PUBLIC_COMING_SOON` with value `true` or `false`
3. Redeploy

### Other Platforms
Add the environment variable through your platform's interface or deployment configuration.

## 📱 What Visitors See

When coming soon mode is enabled, visitors will see:
1. A professional landing page with your brand
2. Email signup form to collect interested users
3. Feature previews of what's coming
4. Consistent design with your main site

When disabled, they see your full application as normal.

## 🔄 Easy Switching

This setup allows you to:
- Launch with coming soon page active
- Collect email signups from interested users
- Switch to full site when ready (just change env variable)
- Switch back to coming soon if needed for maintenance

Perfect for soft launches, beta testing, or maintenance periods!