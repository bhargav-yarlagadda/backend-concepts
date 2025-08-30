"use client";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedHome() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to Your Dashboard
            </h1>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800">
              Your Profile
            </h2>
            <p className="text-blue-600 mt-2">Email: {user.email}</p>
            <p className="text-blue-600">User ID: {user.id}</p>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">
                Authentication Status
              </h3>
              <p className="text-green-600 mt-1">
                ✓ Successfully authenticated
              </p>
              <p className="text-gray-600 text-sm mt-2">
                You&apos;re viewing a protected page. This content is only
                visible to authenticated users.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Session Info</h3>
              <p className="text-gray-600 text-sm mt-2">
                Your session is managed securely using{" "}
                {localStorage.getItem("token")
                  ? "JWT stored in localStorage"
                  : "HTTP-only cookies"}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
