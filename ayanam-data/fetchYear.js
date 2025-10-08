// fetchYear.js
// Usage: node fetchYear.js 2025
// Requires node-fetch: npm i node-fetch

import fs from "fs";
import fetch from "node-fetch";

const API_KEY = "K2CU9-XeVtkhbOVimFDwEKZOWeLJg--KN97H4VOahV27TMb-ia";
const BASE_URL = "https://Hindu-Panchang.proxy-production.allthingsdev.co/panchang";

// default location (India center-ish)
const DEFAULT_LAT = "23.1823900";
const DEFAULT_LNG = "75.7764300";
const DEFAULT_ALT = "0.494";
const DEFAULT_TZ = "Asia/Kolkata";

function toDDMMYYYY(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
}

// fetch Panchang for one date
async function fetchPanchang(date) {
  const formatted = toDDMMYYYY(date);
  const url = `${BASE_URL}?date=${encodeURIComponent(formatted)}&lat=${encodeURIComponent(DEFAULT_LAT)}&lng=${encodeURIComponent(DEFAULT_LNG)}&alt=${encodeURIComponent(DEFAULT_ALT)}&tz=${encodeURIComponent(DEFAULT_TZ)}`;

  const headers = {
    "Accept": "application/json",
    "x-apihub-key": API_KEY,
    "x-apihub-host": "Hindu-Panchang.allthingsdev.co",
    "x-apihub-endpoint": "a925b172-7b98-4142-9348-c1524fe9abd4"
  };

  const resp = await fetch(url, { headers });
  const txt = await resp.text();
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}

async function fetchYear(year) {
  const data = {};

  for (let month = 0; month < 12; month++) {
    for (let day = 1; day <= 31; day++) {
      try {
        const dateObj = new Date(year, month, day);
        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month) continue; // skip invalid
        const iso = dateObj.toISOString().slice(0, 10);

        console.log(`Fetching: ${iso}`);
        const panchang = await fetchPanchang(iso);
        data[iso] = panchang;

        // save after each day
        fs.writeFileSync(`${year}.json`, JSON.stringify(data, null, 2));

        // Respect API limits: 1000/hr ~ 1 call every 3.6 seconds
        await new Promise(r => setTimeout(r, 3600));
      } catch (e) {
        console.error("Error fetching date:", year, month + 1, day, e);
      }
    }
  }

  console.log(`Completed! Saved ${year}.json`);
}

// get year from command line
const year = process.argv[2] ? parseInt(process.argv[2]) : new Date().getFullYear();
fetchYear(year);
