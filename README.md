#  SecureVault - Advanced Password Manager

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.io/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**SecureVault** is a modern, high-security password management solution built for the web. It combines a premium user experience with robust cryptographic standards to ensure your digital identities are protected, organized, and always accessible.

---

##  Security & Privacy First

The core philosophy of SecureVault is "Zero Knowledge." Your sensitive data is encrypted before it ever leaves your device.

###  Military-Grade Encryption (AES-256)
All passwords and PINs are protected using the **AES-256-GCM** (Advanced Encryption Standard). 
- **Client-Side Processing**: Encryption and decryption happen locally in your browser. 
- **Data Sovereignty**: The database only stores "Ciphertext." Even if the server were compromised, your passwords remain mathematically unreadable.
- **Crypto-JS implementation**: We utilize the industry-standard `crypto-js` library for all cryptographic operations.

### Multi-Layer Protection
1. **User Authentication**: Powered by **Clerk**, providing secure JWT session management and multi-factor authentication (MFA) capabilities.
2. **Access Control (RLS)**: **Supabase Row Level Security** ensures that every database query is verified. Users can only fetch, update, or delete data belonging to their unique ID.
3. **Action-Level PIN**: An optional 4-digit PIN can be assigned to sensitive records, requiring a secondary layer of verification for viewing or modifying.

---

##  Features

-  **Premium Interface**: A sleek, glassmorphism-inspired design with professional dark and light modes.
-  **Real-time Performance**: Direct cloud database integration via Supabase for lightning-fast response times.
-  **Global Search**: Instantly find any credential by name, username, or website.
-  **Insightful Dashboard**: At-a-glance statistics showing your vault's health and composition.
-  Organize by **Social, Work, Finance, Entertainment**, and more.

---

##  Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase account and a Clerk project.

### Quick Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_ENCRYPTION_KEY=your_custom_secret_key
   ```



3. **Run Application**
   ```bash
   npm run dev
   ```

---

## Technical Stack

- **Frontend Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Interactions**: Framer Motion, Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Identity**: Clerk Auth

---

##  Encryption Detail

```typescript
// Core security logic located in src/lib/encryption.ts
export function encryptPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
}
```
Passwords are encrypted using a global `VITE_ENCRYPTION_KEY`. Ensure this key is kept secret and never checked into source control.

---

## 📄 License

This project is licensed under the MIT License.

**SecureVault** — *Securing your digital world, Your Security our Priority.* 🛡️🌐

**With Love**

Se-Security Team ❤️