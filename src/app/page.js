"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State to handle loading
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true); // Set loading to true when the request starts

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.status === 200) {
      // Save user and token in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      // Redirect to the dashboard page
      router.push("/dashboard"); // Always redirect to /dashboard
    } else {
      // Show error message
      setError(data.message || "Login failed");
    }

    setLoading(false); // Set loading to false when the request finishes
  };

  return (
    <div className="flex flex-col gap-6 justify-center items-center min-h-screen bg-gray-100">
      <h1 class="mb-0 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Parking Management System <br/>
      </h1>
      <span class="mb-4 text-xl font-normal leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl dark:text-white">
      Created By: Aldo Lata Soba
      </span>
      

      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-semibold mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full p-3 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={loading} // Disable button when loading
          >
            {loading ? "Logging in..." : "Login"}{" "}
            {/* Button text changes to 'Logging in...' when loading */}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-red-500 font-semibold">{error}</p>
        )}
      </div>
    </div>
  );
}
