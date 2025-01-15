import React, { useState, useEffect } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;

export default function AddDataParking() {
  const [vehicles, setVehicles] = useState([]); // Store all vehicles from the API
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [category, setCategory] = useState("motorcycle"); // Default to motorcycle
  const [payment, setPayment] = useState(0);
  const [duration, setDuration] = useState(0);
  const [alertMessage, setAlertMessage] = useState(""); // State to store alert message
  const [alertType, setAlertType] = useState(""); // State to store alert type (success or error)

  useEffect(() => {
    fetch(`${baseUrl}/vehicles`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched raw data:", data);
        setVehicles(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const vehicleNumbers = vehicles
    .filter((vehicle) => vehicle.status === "inside")
    .map((vehicle) => vehicle.vehicleNumber);
  console.log("Filtered vehicle numbers (inside only):", vehicleNumbers);

  const handleSelectVehicle = (vehicleNumber) => {
    console.log("Selected vehicle number:", vehicleNumber);
    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.vehicleNumber === vehicleNumber
    );
    console.log("Selected vehicle details:", selectedVehicle);

    if (selectedVehicle) {
      setVehicleNumber(selectedVehicle.vehicleNumber);
      setCategory(selectedVehicle.category);
      setEntryTime(formatDateWithTime(selectedVehicle.entryTime));
      setExitTime(selectedVehicle.exitTime || "");
      calculateDurationAndPayment(selectedVehicle);
    }
  };

  const formatDateWithTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleString("en-GB", options);
  };

  const calculateDurationAndPayment = (vehicle) => {
    console.log("Calculating payment for vehicle:", vehicle);
    if (vehicle.entryTime) {
      const entry = new Date(vehicle.entryTime);
      const exit = exitTime ? new Date(exitTime) : new Date();
      const durationInMs = exit - entry;
      const durationInHours = durationInMs / (1000 * 60 * 60);

      setDuration(durationInHours);
      console.log("Calculated duration:", durationInHours);

      const rate = 2000; // IDR 2,000 per hour
      let totalPayment = rate * durationInHours;

      // Round the total payment to the nearest integer
      totalPayment = Math.round(totalPayment);

      setPayment(totalPayment);
      console.log("Calculated payment (rounded):", totalPayment);
    }
  };

  const formatCurrency = (amount) => {
    const roundedAmount = Math.round(amount); // Round the amount before formatting
    const amountStr = roundedAmount.toString();

    if (amountStr.length > 3) {
      let integerPart = amountStr.split(".")[0];
      let decimalPart = amountStr.split(".")[1] || "";
      const formattedInteger = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
      );
      return `IDR ${formattedInteger}${decimalPart ? "." + decimalPart : ""}`;
    }
    return `IDR ${amountStr}`;
  };

  const handleExitVehicle = () => {
    console.log("Exiting vehicle with number:", vehicleNumber);
    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.vehicleNumber === vehicleNumber
    );

    if (selectedVehicle) {
      const updatedVehicle = {
        ...selectedVehicle,
        status: "exit",
        exitTime: new Date().toLocaleString(),
      };

      fetch(`${baseUrl}/vehicles/${updatedVehicle.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedVehicle),
      })
        .then((response) => response.json())
        .then(() => {
          // Retrieve the current total payment from localStorage (or default to 0 if not set)
          let storedPayment =
            parseFloat(localStorage.getItem("totalPayment")) || 0;

          // Update the total payment with the current vehicle's payment and round it
          const updatedTotalPayment = Math.round(storedPayment + payment);

          // Save the updated total payment back to localStorage
          localStorage.setItem("totalPayment", updatedTotalPayment.toFixed(0));

          setVehicles(
            vehicles.filter(
              (vehicle) => vehicle.vehicleNumber !== vehicleNumber
            )
          );
          setAlertMessage(
            `Vehicle ${updatedVehicle.vehicleNumber} has exited successfully.`
          );
          setAlertType("success");
        })
        .catch((error) => {
          console.error("Error updating vehicle status:", error);
          setAlertMessage("Failed to update vehicle status. Please try again.");
          setAlertType("error");
        });
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">
        Manage Parking Status
      </h1>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium">
          Select Vehicle Number
        </label>
        <select
          value={vehicleNumber}
          onChange={(e) => handleSelectVehicle(e.target.value)}
          className="w-full p-3 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Vehicle Number</option>
          {vehicles
            .filter((vehicle) => vehicle.status === "inside")
            .map((vehicle) => (
              <option key={vehicle.vehicleNumber} value={vehicle.vehicleNumber}>
                {vehicle.vehicleNumber}
              </option>
            ))}
        </select>
      </div>

      {vehicleNumber && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
          <p className="text-gray-700 font-medium">Category: {category}</p>
          <p className="text-gray-700 font-medium">Entry Time: {entryTime}</p>
          <p className="text-gray-700 font-medium">
            Duration: {duration.toFixed(2)} hours
          </p>
          <p className="text-gray-700 font-medium">
            Total Payment: {formatCurrency(payment)}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            * Exit time will be set automatically when you click the "Mark as
            Exited" button.
          </p>
        </div>
      )}

      {vehicleNumber && (
        <button
          onClick={handleExitVehicle}
          className="bg-red-500 text-white p-3 w-full rounded-md shadow-sm hover:bg-red-600 transition duration-300"
        >
          Mark as Exited
        </button>
      )}

      {/* Display the alert below the button */}
      {alertMessage && (
        <div
          className={`mt-4 p-3 rounded-md text-white ${
            alertType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {alertMessage}
        </div>
      )}
    </div>
  );
}
