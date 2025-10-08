// panchangaCalc.js
// Usage: node panchangaCalc.js 2025 1
// Requires: npm i suncalc

import fs from "fs";
import SunCalc from "suncalc";

// default location (India center-ish)
const DEFAULT_LAT = 23.18239;
const DEFAULT_LNG = 75.77643;
const DEFAULT_TZ = 5.5;

// read month JSON
const year = process.argv[2] ? parseInt(process.argv[2]) : 2025;
const month = process.argv[3] ? parseInt(process.argv[3]) : 1;
const monthFile = `${year}-${String(month).padStart(2,"0")}.json`;
const monthData = JSON.parse(fs.readFileSync(monthFile));

// Panchanga calculation helpers
function normalizeDegree(deg) {
  deg = deg % 360;
  if (deg < 0) deg += 360;
  return deg;
}

function getTithi(sunLong, moonLong) {
  const diff = normalizeDegree(moonLong - sunLong);
  return Math.floor(diff / 12) + 1; // 1-30
}

function getNakshatra(moonLong) {
  return Math.floor(normalizeDegree(moonLong) / 13.3333333333) + 1; // 1-27
}

function getYoga(sunLong, moonLong) {
  const sum = normalizeDegree(sunLong + moonLong);
  return Math.floor(sum / 13.3333333333) + 1; // 1-27
}

function getKarana(tithi) {
  const karanas = [
    "Kimstughna", "Bava", "Balava", "Kaulava", "Taitila", "Garija",
    "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga"
  ];
  return karanas[(tithi - 1) % 11];
}

function getRashi(longitude) {
  return Math.floor(normalizeDegree(longitude) / 30) + 1; // 1-12
}

// calculate Rahu/Gulika/Yamaganda for day (approx)
function getKalaTimes(sunrise, sunset) {
  const dayDuration = sunset - sunrise;
  const rahuStart = new Date(sunrise.getTime() + dayDuration * (8/24));
  const gulikaStart = new Date(sunrise.getTime() + dayDuration * (2/24));
  const yamagandaStart = new Date(sunrise.getTime() + dayDuration * (12/24));
  return {
    rahuKalam: rahuStart.toTimeString().slice(0,5),
    gulikaKalam: gulikaStart.toTimeString().slice(0,5),
    yamaganda: yamagandaStart.toTimeString().slice(0,5)
  };
}

// main calculation
const panchangaMonth = {};

for (const dateStr in monthData) {
  const dayData = monthData[dateStr];
  if (!dayData.output || !dayData.output[1]) continue;

  const planets = dayData.output[1]; // named planets object
  const sun = planets.Sun?.normDegree ?? null;
  const moon = planets.Moon?.normDegree ?? null;

  if (sun === null || moon === null) continue;

  const tithi = getTithi(sun, moon);
  const nakshatra = getNakshatra(moon);
  const yoga = getYoga(sun, moon);
  const karana = getKarana(tithi);
  const sunRashi = getRashi(sun);
  const moonRashi = getRashi(moon);

  // calculate sunrise/sunset
  const [y,m,d] = dateStr.split("-").map(Number);
  const sunriseSunset = SunCalc.getTimes(new Date(y, m-1, d), DEFAULT_LAT, DEFAULT_LNG);
  const kalaTimes = getKalaTimes(sunriseSunset.sunrise, sunriseSunset.sunset);

  panchangaMonth[dateStr] = {
    tithi, nakshatra, yoga, karana,
    sunRashi, moonRashi,
    sunrise: sunriseSunset.sunrise.toTimeString().slice(0,5),
    sunset: sunriseSunset.sunset.toTimeString().slice(0,5),
    ...kalaTimes
  };
}

// save
const outputFile = `${year}-${String(month).padStart(2,"0")}-panchanga.json`;
fs.writeFileSync(outputFile, JSON.stringify(panchangaMonth, null, 2));
console.log(`Saved Panchanga data to ${outputFile}`);
