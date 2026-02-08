# RAG Chat - AI Chatbot with Retrieval-Augmented Generation

AI-powered chatbot that answers questions based on your documents using RAG technology. Built with Next.js 15, tRPC, and Prisma.

## Features

- 🔐 **Authentication System**: Complete user authentication with email/password, password reset, and email verification
- 💬 **Chat Interface**: Interactive chat with AI-powered responses
- 📊 **Chat History**: Persistent chat history with database storage
- 🎨 **Modern UI**: Built with Radix UI components and Tailwind CSS
- 🔒 **Type-Safe API**: tRPC for end-to-end type safety
- 🗄️ **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: tRPC, Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI**: Radix UI, Tailwind CSS 4
- **Validation**: Zod

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database - Use Neon, Vercel Postgres, or your PostgreSQL provider
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication - Generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-key-here"

# Environment
NODE_ENV="development"
```

## Local Development

```bash
# Clone the repository
git clone https://github.com/dayOneAbu/RAG-chat
cd RAG-chat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Setup

This project uses PostgreSQL. For local development and production:

1. **Local Development**: Use a local PostgreSQL instance or a cloud provider
2. **Production (Vercel)**: Use [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

After setting up your database:

```bash
# Push the Prisma schema to your database
npm run db:push

# Or run migrations
npm run db:generate
```

## Deployment on Vercel

### Prerequisites
- A Vercel account
- A PostgreSQL database (Neon, Vercel Postgres, etc.)

### Deployment Steps

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NODE_ENV`: `production`

4. **Deploy**
   - Vercel will automatically build and deploy
   - Build command: `npm run build`
   - Output directory: `.next`

5. **Run Migrations** (first deployment only):
   ```bash
   # After deployment, run migrations via Vercel CLI or your database provider
   npx prisma migrate deploy
   ```

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dayOneAbu/RAG-chat)

Remember to configure environment variables after deployment!

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run typecheck    # Run TypeScript type checking
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
```

## Project Structure

```
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── _components/ # React components
│   │   ├── api/         # API routes
│   │   └── auth/        # Authentication pages
│   ├── server/          # Server-side code
│   │   ├── api/         # tRPC routers
│   │   └── db.ts        # Prisma client
│   ├── trpc/            # tRPC configuration
│   └── env.js           # Environment validation
└── vercel.json          # Vercel configuration
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
