"use client";

import { useState } from "react";
import ParkingReport from "./cashier/ParkingReport";
import AddDataParking from "./cashier/AddDataParking";

export default function CashierPage({ selectedTab, setSelectedTab }) {
  return (
    <>
      {/* Render components based on the selectedTab */}
      {selectedTab === "Data Report" && <ParkingReport />} {/* Display Parking Report */}
      {selectedTab === "Add Data Parking" && <AddDataParking />} {/* Display Add Data Parking */}
    </>
  );
}
