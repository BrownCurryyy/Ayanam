// fetchVedicMonth.js
// Usage: node fetchVedicMonth.js 2025 1
// Requires: npm i node-fetch

import fs from "fs";
import fetch from "node-fetch";

const API_KEY = "K2CU9-XeVtkhbOVimFDwEKZOWeLJg--KN97H4VOahV27TMb-ia";
const PLANETS_URL = "https://Vedic-Astrology-API.proxy-production.allthingsdev.co/planets";

// default location
const DEFAULT_LAT = 23.18239;
const DEFAULT_LNG = 75.77643;
const DEFAULT_TZ = 5.5;

// fetch planetary positions
async function fetchPlanets({ year, month, day, hour = 11 }) {
  const body = {
    year,
    month,
    date: day,
    hours: hour,
    minutes: 0,
    seconds: 0,
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    timezone: DEFAULT_TZ,
    config: { observation_point: "topocentric", ayanamsha: "lahiri" }
  };

  const headers = {
    "Content-Type": "application/json",
    "x-apihub-key": API_KEY,
    "x-apihub-host": "Vedic-Astrology-API.allthingsdev.co",
    "x-apihub-endpoint": "afdb51dc-c781-4b66-b269-d2567e0f3154"
  };

  try {
    const resp = await fetch(PLANETS_URL, { method: "POST", headers, body: JSON.stringify(body) });
    return await resp.json();
  } catch (err) {
    console.error("Planets fetch error:", err);
    return null;
  }
}

async function fetchMonth(year, month) {
  const data = {};
  for (let day = 1; day <= 31; day++) {
    const dateObj = new Date(year, month - 1, day);
    if (dateObj.getMonth() !== month - 1) continue; // skip invalid dates

    const isoDate = dateObj.toISOString().slice(0, 10);
    console.log(`Fetching planets: ${isoDate}`);

    const planets = await fetchPlanets({ year, month, day });
    data[isoDate] = planets;

    // save dynamically after each day
    fs.writeFileSync(`${year}-${String(month).padStart(2,"0")}.json`, JSON.stringify(data, null, 2));

    // wait 4 sec to respect ~1000 calls/hour limit
    await new Promise(r => setTimeout(r, 3600));
  }

  console.log(`Saved planetary data: ${year}-${String(month).padStart(2,"0")}.json`);
}

// get year and month from CLI
const year = process.argv[2] ? parseInt(process.argv[2]) : new Date().getFullYear();
const month = process.argv[3] ? parseInt(process.argv[3]) : 1; // default Jan

fetchMonth(year, month);
