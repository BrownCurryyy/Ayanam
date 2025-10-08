// script.js — fetches the proxy-production Hindu Panchang endpoint and prints raw JSON.
// Defaults: India-ish coordinates & Asia/Kolkata timezone.
// NOTE: API key is included client-side for demo only. Remove / proxy via backend in production.

const API_KEY = "K2CU9-XeVtkhbOVimFDwEKZOWeLJg--KN97H4VOahV27TMb-ia";
const BASE_URL = "https://Hindu-Panchang.proxy-production.allthingsdev.co/panchang";

// default location (India center-ish) — change if you want another default
const DEFAULT_LAT = "23.1823900";
const DEFAULT_LNG = "75.7764300";
const DEFAULT_ALT = "0.494";
const DEFAULT_TZ = "Asia/Kolkata";

const dateInput = document.getElementById("date");
const goBtn = document.getElementById("goBtn");
const output = document.getElementById("output");
const status = document.getElementById("status");

// Set date input default to today
(function setToday() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${yyyy}-${mm}-${dd}`;
})();

// helper: convert YYYY-MM-DD -> DD-MM-YYYY (API expects dd-mm-yyyy in example)
function toDDMMYYYY(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
}

async function fetchPanchangForDate(isoDate) {
  // isoDate is 'YYYY-MM-DD'
  const formatted = toDDMMYYYY(isoDate);
  const url = `${BASE_URL}?date=${encodeURIComponent(formatted)}&lat=${encodeURIComponent(DEFAULT_LAT)}&lng=${encodeURIComponent(DEFAULT_LNG)}&alt=${encodeURIComponent(DEFAULT_ALT)}&tz=${encodeURIComponent(DEFAULT_TZ)}`;

  // prepare headers exactly like example
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("x-apihub-key", API_KEY);
  myHeaders.append("x-apihub-host", "Hindu-Panchang.allthingsdev.co");
  myHeaders.append("x-apihub-endpoint", "a925b172-7b98-4142-9348-c1524fe9abd4");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  status.textContent = `Fetching Panchang for ${isoDate} (query date=${formatted})...`;
  try {
    const resp = await fetch(url, requestOptions);

    // If the endpoint returns text rather than JSON, try text then JSON parse fallback
    const txt = await resp.text();
    try {
      const parsed = JSON.parse(txt);
      status.textContent = `Success — data received for ${isoDate}`;
      return parsed;
    } catch (e) {
      // not JSON — return raw text
      status.textContent = `Success — raw text received for ${isoDate}`;
      return txt;
    }
  } catch (err) {
    status.textContent = `Request failed: ${err.message || err}`;
    console.error("fetch error:", err);
    return null;
  }
}

async function handleClick() {
  output.textContent = "Loading...";
  const isoDate = dateInput.value;
  if (!isoDate) {
    alert("Please pick a date.");
    output.textContent = "No date selected.";
    return;
  }

  const data = await fetchPanchangForDate(isoDate);
  if (!data) {
    output.textContent = "No data received. Check console for errors or API limits.";
    return;
  }

  // Pretty-print if it's JSON object, otherwise show raw text
  if (typeof data === "object") {
    output.textContent = JSON.stringify(data, null, 2);
  } else {
    output.textContent = String(data);
  }
}

goBtn.addEventListener("click", handleClick);

// also allow pressing Enter inside date input to trigger fetch
dateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleClick();
});


const birthDateInput = document.getElementById("birthDate");
const targetDateInput = document.getElementById("targetDate");
const matchBtn = document.getElementById("matchBtn");

// Function to compare Panchang results
async function handleMatch() {
  output.textContent = "Loading...";
  const birthIso = birthDateInput.value;
  const targetIso = targetDateInput.value;

  if (!birthIso || !targetIso) {
    alert("Please pick both dates.");
    output.textContent = "Missing date(s).";
    return;
  }

  const birthData = await fetchPanchangForDate(birthIso);
  const targetData = await fetchPanchangForDate(targetIso);

  if (!birthData || !targetData || !birthData.data || !targetData.data) {
    output.textContent = "Could not fetch Panchang for one or both dates.";
    return;
  }

  const birthTithi = birthData.data.tithi;
  const birthNak = birthData.data.nakshatra;
  const targetTithi = targetData.data.tithi;
  const targetNak = targetData.data.nakshatra;

  let msg = `📅 Birth/Anniversary (${birthIso}):\nTithi = ${birthTithi}\nNakshatra = ${birthNak}\n\n`;
  msg += `📅 Target Date (${targetIso}):\nTithi = ${targetTithi}\nNakshatra = ${targetNak}\n\n`;

  if (birthTithi && targetTithi && birthNak && targetNak) {
    if (birthTithi.split(" ")[0] === targetTithi.split(" ")[0] &&
        birthNak.split(" ")[0] === targetNak.split(" ")[0]) {
      msg += "✅ Match found! This target date has the same Tithi & Nakshatra.";
    } else {
      msg += "❌ No match on this date. You’d need to scan other days in this year.";
    }
  }

  output.textContent = msg;
}

matchBtn.addEventListener("click", handleMatch);
