import React, { useState, useEffect } from "react";

export default function ParkingReport() {
  const [vehicles, setVehicles] = useState([]);
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
  });

  useEffect(() => {
    fetchVehicles();
    // Retrieve the stored total earnings from localStorage and ensure it's in IDR
    const storedTotalEarnings =
      parseFloat(localStorage.getItem("totalPayment")) || 0;
    setEarnings((prevEarnings) => ({
      ...prevEarnings,
      total: storedTotalEarnings, // Set total earnings from storage (formatted in IDR)
    }));
  }, []);

  const totalToday = localStorage.getItem("totalPayment");

  const fetchVehicles = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/vehicles`
      );
      const data = await response.json();
      setVehicles(data);
      calculateEarnings(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const calculateEarnings = (vehicles) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;
    let overallTotal = 0;

    // Filter vehicles based on status "inside"
    const insideVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "inside"
    );

    insideVehicles.forEach((vehicle) => {
      const entryTime = new Date(vehicle.entryTime);
      let hoursParked = (today - entryTime) / 1000 / 3600; // Time parked until now
      if (vehicle.exitTime) {
        const exitTime = new Date(vehicle.exitTime);
        hoursParked = (exitTime - entryTime) / 1000 / 3600; // Time parked during the exit time
      }

      const pricePerHour = vehicle.category === "motorcycle" ? 5 : 10;
      const earnings = pricePerHour * hoursParked;

      if (entryTime >= today.setHours(0, 0, 0, 0)) {
        todayTotal += earnings;
      }

      if (entryTime >= startOfWeek) {
        weekTotal += earnings;
      }

      if (entryTime >= startOfMonth) {
        monthTotal += earnings;
      }

      overallTotal += earnings;
    });

    setEarnings({
      today: todayTotal,
      thisWeek: weekTotal,
      thisMonth: monthTotal,
      total: overallTotal,
    });
  };

  // Filter out vehicles that are still inside for floor 1 and floor 2
  const floor1Vehicles = vehicles.filter(
    (vehicle) => vehicle.floor === "floor1" && vehicle.status === "inside"
  );
  const floor2Vehicles = vehicles.filter(
    (vehicle) => vehicle.floor === "floor2" && vehicle.status === "inside"
  );

  const totalMotorcycleSpaces = 10;
  const totalCarSpaces = 6;
  const parkedMotorcycles = floor1Vehicles.length;
  const parkedCars = floor2Vehicles.length;

  const availableMotorcycleSpaces = totalMotorcycleSpaces - parkedMotorcycles;
  const availableCarSpaces = totalCarSpaces - parkedCars;

  // Function to format numbers to IDR (Indonesian Rupiah)
  const formatIDR = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 bg-white">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">
        Parking Report
      </h1>
      {/* Floor Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Floor 1: Motorcycles */}
        <div className="bg-blue-100 p-6 rounded-lg shadow-lg text-gray-800">
          <h2 className="text-xl font-semibold mb-2">Floor 1 - Motorcycles</h2>
          <div>
            <p className="font-semibold">
              Parked Motorcycles: {parkedMotorcycles} / {totalMotorcycleSpaces}
            </p>
            <p className="font-semibold">
              Available Spaces: {availableMotorcycleSpaces} /{" "}
              {totalMotorcycleSpaces}
            </p>
          </div>
        </div>

        {/* Floor 2: Cars */}
        <div className="bg-green-100 p-6 rounded-lg shadow-lg text-gray-800">
          <h2 className="text-xl font-semibold mb-2">Floor 2 - Cars</h2>
          <div>
            <p className="font-semibold">
              Parked Cars: {parkedCars} / {totalCarSpaces}
            </p>
            <p className="font-semibold">
              Available Spaces: {availableCarSpaces} / {totalCarSpaces}
            </p>
          </div>
        </div>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-200 p-6 rounded-lg shadow-lg text-gray-800">
          <h2 className="text-xl font-semibold mb-2">
            Total Vehicles Parked Today
          </h2>
          <p className="text-4xl font-bold">{parkedMotorcycles + parkedCars}</p>
        </div>

        <div className="bg-yellow-200 p-6 rounded-lg shadow-lg text-gray-800">
          <h2 className="text-xl font-semibold mb-2">Total Earnings Today</h2>
          <p className="text-3xl font-bold">{formatIDR(totalToday)}</p>
        </div>

        <div className="bg-red-200 p-6 rounded-lg shadow-lg text-gray-800">
          <h2 className="text-xl font-semibold mb-2">Total Earnings Ever</h2>
          <p className="text-4xl font-bold">
            {formatIDR(earnings.total)}0,00 {/* Apply formatIDR here */}
          </p>
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Parking Area Real-Time <span className="text-green-600">(Inside)</span>
      </h3>
      <div className="grid grid-cols-2 gap-x-0">
        {/* Parking Area Real-Time Header */}
        {/* Parked Vehicles List - Floor 1 (Motorcycles) */}
        <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-lg mb-8 h-[500px]">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Floor 1 - Motorcycles
          </h2>
          <table className="min-w-full table-auto text-gray-800">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Plate Number</th>
                <th className="py-2 px-4 border-b text-left">Entry Time</th>
              </tr>
            </thead>
            <tbody>
              {floor1Vehicles.map((vehicle, index) => {
                const entryTime = new Date(vehicle.entryTime);
                return (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">
                      {vehicle.vehicleNumber}
                    </td>
                    <td className="py-2 px-4 border-b bg-gray-100">
                      {entryTime.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Parked Vehicles List - Floor 2 (Cars) */}
        <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-lg h-[500px]">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Floor 2 - Cars
          </h2>
          <table className="min-w-full text-gray-800">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Plate Number</th>
                <th className="py-2 px-4 border-b text-left">Entry Time</th>
              </tr>
            </thead>
            <tbody>
              {floor2Vehicles.map((vehicle, index) => {
                const entryTime = new Date(vehicle.entryTime);
                return (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">
                      {vehicle.vehicleNumber}
                    </td>
                    <td className="py-2 px-4 border-b bg-gray-100">
                      {entryTime.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
