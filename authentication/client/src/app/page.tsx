"use client";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 flex flex-col items-center justify-center gap-8">
      <main className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center">
          Authentication Methods Demo
        </h1>

        <div className="grid gap-6 w-full">
          {/* JWT Authentication */}
          <Link
            href="/email-password-jwt"
            className="flex items-center justify-center gap-3 p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email/Password + JWT
            <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
              Client-side storage
            </span>
          </Link>

          {/* Cookie Authentication */}
          <Link
            href="/login-cookie"
            className="flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Email/Password + Cookie
            <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
              HTTP-only Cookie
            </span>
          </Link>

          <Link
            href="/login-oauth"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl 
                 bg-white text-gray-800 shadow-md border border-gray-200 
                 hover:shadow-lg hover:bg-gray-50 transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.8 32.5 29.4 36 24 36c-6.6 
          0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 
          3l5.7-5.7C33.6 6.5 29.1 4 24 4 12.9 4 4 
          12.9 4 24s8.9 20 20 20 20-8.9 
          20-20c0-1.3-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 14 24 
          14c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 
          6.5 29.1 4 24 4 16.1 4 9.2 8.5 
          6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.3 0 10-1.7 13.6-4.7l-6.3-5.2C29.3 
          35.7 26.8 36.6 24 36c-5.4 0-9.8-3.5-11.3-8.3l-6.6 
          5.1C9.2 39.5 16.1 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.3 
          3.8-4.9 6.5-9.3 6.5-5.4 0-9.8-3.5-11.3-8.3l-6.6 
          5.1C9.2 39.5 16.1 44 24 44c11.1 0 
          20-8.9 20-20 0-1.3-.1-2.3-.4-3.5z"
              />
            </svg>
            <span className="font-medium">Login with Google</span>
          </Link>
          {/* Placeholder for future auth methods */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
            <p className="text-center text-gray-500">
              More authentication methods coming soon...
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Each authentication method demonstrates different security
            approaches and best practices.
          </p>
        </div>

        {/* Extra buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>

      <footer className="flex gap-[24px] flex-wrap items-center justify-center mt-8">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
