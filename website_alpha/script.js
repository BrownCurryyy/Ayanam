const nakshatras = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu",
  "Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta",
  "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
  "Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada",
  "Uttara Bhadrapada","Revati"
];

const rashis = [
  "Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrischika",
  "Dhanu","Makara","Kumbha","Meena"
];

// DOM refs
const nakSel = document.getElementById("nakshatra");
const rashSel = document.getElementById("moonsign");
const resultDiv = document.getElementById("result");
const findBtn = document.getElementById("findBtn");
const fileInput = document.getElementById("panchangaFile"); // optional input to select JSON filename

// populate dropdowns
function populateSelects(){
  nakshatras.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    nakSel.appendChild(opt);
  });

  rashis.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    rashSel.appendChild(opt);
  });
}
populateSelects();

// helper: parse dd/mm/yyyy safely -> Date object (local timezone)
function parseDMY(dateStr){
  const parts = dateStr.split("/").map(s => s.trim());
  if(parts.length !== 3) return null;
  const [d,m,y] = parts.map(Number);
  return new Date(y, m - 1, d);
}

// helper: parse iso date YYYY-MM-DD into {day,month,year}
function parseISO(isoStr){
  const [y,m,d] = isoStr.split("-").map(Number);
  return { day: d, month: m, year: y };
}

// month → overlapping lunar months (Maasas). Keep both when ambiguous.
const monthToMasas = {
  1: ["Pausha","Magha"],
  2: ["Magha","Phalguna"],
  3: ["Phalguna","Chaitra"],
  4: ["Chaitra","Vaishakha"],
  5: ["Vaishakha","Jyeshtha"],
  6: ["Jyeshtha","Ashadha"],
  7: ["Ashadha","Shravana"],
  8: ["Shravana","Bhadrapada"],
  9: ["Bhadrapada","Ashwayuja"],
  10:["Ashwayuja","Kartika"],
  11:["Kartika","Margashira"],
  12:["Margashira","Pausha"]
};

// normalize string for robust compare
function norm(s){ return String(s || "").trim().toLowerCase(); }

// main finder
findBtn.addEventListener("click", async () => {
  // inputs
  const birthISO = document.getElementById("birthDate").value; // YYYY-MM-DD
  const nakshatra = nakSel.value;
  const moonsign = rashSel.value;
  const filename = (fileInput && fileInput.value) ? fileInput.value.trim() : "panchanga_2025.json";

  if(!birthISO || !nakshatra || !moonsign){
    alert("Please fill all fields (birth date, nakshatra, moonsign).");
    return;
  }

  // read birth day/month and we'll map to the target year (panchanga file year)
  const { day: birthDay, month: birthMonth } = parseISO(birthISO);

  try {
    const data = await fetch(filename).then(r => {
      if(!r.ok) throw new Error(`Failed to load ${filename}: ${r.status}`);
      return r.json();
    });

    const keys = Object.keys(data);
    if(keys.length === 0) {
      resultDiv.innerHTML = `<p class="error">Panchanga file is empty.</p>`;
      return;
    }

    // derive target year from first entry key (dd/mm/YYYY)
    const firstKeyParts = keys[0].split("/").map(s => s.trim());
    const targetYear = firstKeyParts.length === 3 ? Number(firstKeyParts[2]) : (new Date()).getFullYear();

    // birth date anchored to target year (so distance measured inside that year)
    const birthThisYear = new Date(targetYear, birthMonth - 1, birthDay);

    // choose acceptable lunar months (maasa) for the birth month
    const targetMasas = monthToMasas[birthMonth] || [];

    // find matches over entire JSON (whole year)
    const matches = [];
    for(const [dateStr, info] of Object.entries(data)){
      // make sure fields exist
      if(!info || !info.Nakshatra || !info.Moonsign || !info.Maasa) continue;

      // match nakshatra + moonsign (case-insensitive)
      if(norm(info.Nakshatra) === norm(nakshatra) && norm(info.Moonsign) === norm(moonsign)){
        // if the maasa matches any of the acceptable lunar months (loose contains)
        const maasaOk = targetMasas.length === 0 ? true :
                       targetMasas.some(m => norm(info.Maasa).includes(norm(m)));
        if(maasaOk){
          const dayDate = parseDMY(dateStr);
          if(!dayDate) continue;
          // compute absolute day difference vs birthThisYear (in days)
          const diffDays = Math.abs((dayDate - birthThisYear) / (1000 * 60 * 60 * 24));
          matches.push({ date: dateStr, info, diffDays, dateObj: dayDate });
        }
      }
    }

    if(matches.length === 0){
      resultDiv.classList.add("show");
      resultDiv.innerHTML = `<p>No matches found for <strong>${nakshatra}</strong> (${moonsign}) in lunar month(s): <em>${targetMasas.join(", ")}</em>.</p>`;
      return;
    }

    // sort by absolute closeness (days)
    matches.sort((a,b) => a.diffDays - b.diffDays);

    // pick the nearest — ties resolved by earlier date (stable sort)
    const nearest = matches[0];

    // display only the nearest match
    resultDiv.classList.add("show");
    resultDiv.innerHTML = `
      <div class="result-card">
        <h3>Your Birthday is on 🎂:</h3>
        <p class="match-date">${nearest.date} — ${nearest.info.Tithi}, ${nearest.info.Nakshatra}, ${nearest.info.Moonsign}, ${nearest.info.Maasa}</p>
      </div>
    `;

  } catch(err){
    console.error(err);
    resultDiv.classList.add("show");
    resultDiv.innerHTML = `<p class="error">⚠️ Error loading/processing data: ${err.message}</p>`;
  }
});
