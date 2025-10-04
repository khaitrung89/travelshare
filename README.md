
# TravelShare 🌍✈️

**TravelShare** is a modern web application for sharing and tracking trip expenses among friends. Built with Next.js, PostgreSQL, and Prisma, it helps groups settle expenses fairly and efficiently.

![TravelShare](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.7-2D3748?logo=prisma)

## ✨ Features

### 🎯 Core Features
- **Trip Management**: Create and manage trips with destinations, dates, and descriptions
- **Expense Tracking**: Record expenses with multiple payers and split costs among members
- **Smart Settlement**: Get optimal settlement suggestions to minimize transactions
- **Member Management**: Add members via email invitations, shareable links, or QR codes
- **Real-time Notifications**: Stay updated with trip invites and expense notifications

### 🔐 Authentication & Security
- Secure authentication with NextAuth.js
- Email and password-based login
- Protected routes and API endpoints
- Session management

### 💰 Financial Features
- **Balance Summary**: Visual chart showing who owes whom
- **Debt Matrix**: Interactive grid for recording manual settlements
- **Settlement Suggestions**: Optimal payment transfers to settle all debts
- **Recent Expenses**: Track the latest spending with member details

### 🎨 Design & UX
- Responsive travel-themed design
- Blue, gray, and white color scheme
- Smooth animations and hover effects
- Mobile-friendly interface
- Dark mode support (via theme toggle)

### 📱 Mobile Support
- PWA-ready with Capacitor
- Android app support
- Optimized for mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14.2, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Lucide Icons
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Mobile**: Capacitor for Android builds
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/khaitrung89/travelshare.git
   cd travelshare
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/travelshare"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Email (optional - for invite emails)
   EMAIL_FROM="noreply@travelshare.com"
   ```

4. **Set up the database**
   ```bash
   # Run Prisma migrations
   yarn prisma migrate dev
   
   # Generate Prisma client
   yarn prisma generate
   
   # (Optional) Seed the database
   yarn prisma db seed
   ```

5. **Run the development server**
   ```bash
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Database Schema

The app uses the following main models:

- **User**: User accounts with authentication
- **Trip**: Trip details with destinations and dates
- **TripMember**: Junction table linking users to trips
- **Expense**: Individual expenses with amounts and descriptions
- **ExpenseShare**: Tracks which members share each expense
- **Invite**: Invitation system with unique tokens
- **Notification**: User notifications for various actions

See `prisma/schema.prisma` for the complete schema.

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub** (already done!)

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your `travelshare` repository

3. **Configure Environment Variables**
   
   Add these in Vercel dashboard:
   ```env
   DATABASE_URL=your_production_database_url
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_production_secret
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Get your production URL

### Database Options

For production database, consider:
- **Supabase**: Free tier with PostgreSQL
- **Neon**: Serverless PostgreSQL
- **Railway**: Simple database hosting
- **AWS RDS**: Enterprise-grade PostgreSQL

## 📱 Building for Android

The app includes Capacitor configuration for Android:

1. **Configure environment**
   ```bash
   cp .env.capacitor.example .env.capacitor
   # Edit .env.capacitor with your API server URL
   ```

2. **Build the web app**
   ```bash
   yarn build
   ```

3. **Sync with Android**
   ```bash
   npx cap sync android
   ```

4. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

See `HOW_TO_BUILD_APK.md` for detailed instructions.

## 🧪 Test Accounts

For testing, use these accounts:
- Email: `trungtrankhaitung@gmail.com` / Password: `[your password]`
- Email: `hylam358@gmail.com` / Password: `[test password]`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Happy Traveling! 🌍✈️**
