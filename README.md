# Abathwa Capital - Community Investment Platform

A production-ready investment platform connecting Zimbabwean entrepreneurs with investors, featuring full isiNdebele language support and community-driven economic growth.

## 🌟 Features

- **Multi-language Support**: Full isiNdebele and English support
- **Role-based Authentication**: Entrepreneur, Investor, Service Provider, Admin, and Observer roles
- **Real-time Dashboard**: Live updates and notifications
- **Investment Management**: Complete investment lifecycle tracking
- **Secure Payments**: Escrow services and milestone-based releases
- **Document Management**: Digital agreements and file uploads
- **Mobile Responsive**: Works perfectly on all devices
- **Dark Mode**: Full dark/light theme support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd abathwa-capital-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📦 Production Deployment

### Automated Deployment

1. **Run the deployment script**
   ```bash
   ./deploy.sh
   ```

2. **Upload the dist folder to your web server**

### Manual Deployment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build for production**
   ```bash
   npm run build:prod
   ```

3. **Deploy the dist folder**
   ```bash
   # Upload dist/ to your web server
   ```

## 🛠️ Configuration

### Environment Variables

#### Development (.env)
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_API_BASE_URL=http://localhost:54321/functions/v1
```

#### Production (.env.production)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1
```

### Supabase Setup

1. **Create a new Supabase project**
2. **Run the migration**
   ```sql
   -- Use the SQL in supabase/migrations/001_initial_schema.sql
   ```
3. **Configure authentication settings**
4. **Update environment variables**

## 🎯 User Roles

- **Entrepreneurs**: Create funding opportunities, track milestones
- **Investors**: Browse opportunities, make investments, track ROI
- **Service Providers**: Offer professional services to businesses
- **Admins**: Platform management and oversight
- **Observers**: Read-only monitoring access

## 🌍 Language Support

The platform supports:
- **English** (Default)
- **isiNdebele** (Native Zimbabwean language)

Language switching is available in the top navigation bar.

## 🔐 Authentication

- Secure email/password authentication
- Role-based access control
- Email verification
- Password reset functionality
- Session management

## 📱 Mobile Support

The application is fully responsive and provides an excellent mobile experience across all features.

## 🎨 Theming

- Light and dark mode support
- Consistent design system
- Accessibility compliant
- Modern UI components

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build with production optimizations
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run preview` - Preview production build
- `npm run deploy` - Full deployment process

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── services/      # API and external services
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── i18n/          # Internationalization
└── locales/       # Language files
```

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Custom Server
Upload the `dist/` folder to your web server's document root.

## 📊 Performance

- **Build Size**: ~1MB gzipped
- **First Load**: <3 seconds
- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **PWA Ready**: Service worker included

## 🔍 SEO Features

- Meta tags optimized
- Open Graph support
- Structured data
- Sitemap generation
- Multi-language SEO

## 🛡️ Security

- HTTPS enforced
- Content Security Policy
- XSS protection
- CSRF protection
- Input validation
- SQL injection prevention (via Supabase)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Email**: admin@abathwa.com
- **Phone**: +263789989619
- **WhatsApp**: wa.me/789989619

## 📄 License

This project is proprietary software. All rights reserved.

---

Built with ❤️ for the Zimbabwean entrepreneurial community.
