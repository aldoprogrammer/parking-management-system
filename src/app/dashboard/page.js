"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPage from "@/components/AdminPage";
import CashierPage from "@/components/CashierPage";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("Data Report");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/"); // Redirect to login if no user is found
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Set the user from localStorage
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/"); // Redirect to the login page
  };

  if (!user) return <div>Loading...</div>;

  // Define menu items for admin and cashier
  const adminMenuItems = [{ name: "Data Report", tab: "Data Report" }];
  const cashierMenuItems = [
    { name: "Data Report", tab: "Data Report" },
    { name: "Add Data Parking", tab: "Add Data Parking" },
  ];

  // Select the menu items based on the user's role
  const menuItems = user.role === "admin" ? adminMenuItems : cashierMenuItems;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">
          {user.role === "admin" ? "Admin" : "Cashier"} Dashboard
        </h2>
        <ul className="space-y-4">
          {/* Dynamically render menu items and handle clicks */}
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`cursor-pointer p-3 rounded-lg transition duration-300 ${
                selectedTab === item.tab
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setSelectedTab(item.tab)} // Set the tab on click
            >
              <span className="text-lg">{item.name}</span>
            </li>
          ))}

          {/* Logout button */}
          <li className="mt-6">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500 text-white rounded-lg text-lg transition duration-300 hover:bg-red-600"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Welcome, {user.username}
        </h1>
        {/* Render content based on the selected tab */}
        {user.role === "admin" ? (
          <AdminPage />
        ) : user.role === "cashier" ? (
          <CashierPage
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ) : (
          <p>Invalid role.</p>
        )}
      </div>
    </div>
  );
}
