# AssetScribe

A comprehensive IT asset management system built with Next.js, Prisma, and TypeScript.

![License](https://img.shields.io/github/license/LunarVigilante/assetscribe)

## Overview

AssetScribe is a modern web application designed to help organizations track and manage their IT assets, licenses, users, and configuration items. It provides a clean, intuitive interface for asset lifecycle management.

### Features

- **Asset Management**: Track hardware assets with detailed information
- **User Management**: Manage users and their assigned assets
- **License Management**: Track software licenses and assignments
- **CMDB**: Configuration Management Database for IT infrastructure
- **Workflows**: Customizable workflows for onboarding, offboarding, and more
- **Activity Logging**: Comprehensive audit trail of all system activities

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (planned)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LunarVigilante/assetscribe.git
   cd assetscribe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to add your database connection string and other settings.

4. Run database migrations and seed data:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

This project uses Next.js with the App Router. You can start editing the pages by modifying files in the `src/app` directory.

## License

This project is licensed under the [GPL-3.0 License](LICENSE).

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework for the Web
- [Prisma](https://prisma.io/) - Next-generation ORM for Node.js and TypeScript
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. 