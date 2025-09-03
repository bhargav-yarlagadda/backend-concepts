"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);

  // Fetch profile after login (backend reads token from cookies)
  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8080/profile", {
        credentials: "include", // send cookies
      });
      if (res.ok) {
        const text = await res.text();
        setUser(text);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching or user not logged int");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:8080/auth/google";
  };

  const handleLogout = async () => {
    await fetch("http://localhost:8080/logout", {
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      {!user ? (
        <>
          <h1 className="text-2xl font-bold">Login with Google</h1>
          <button
            onClick={handleLogin}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </>
      ) : (
        <div className="text-center">
          <div dangerouslySetInnerHTML={{ __html: user }} />
          <button
            onClick={handleLogout}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </main>
  );
}
