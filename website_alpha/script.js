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

const nakSel = document.getElementById('nakshatra');
const rashSel = document.getElementById('moonsign');
const resultDiv = document.getElementById('result');

// populate dropdowns
nakshatras.forEach(n => {
  const opt = document.createElement('option');
  opt.value = n;
  opt.textContent = n;
  nakSel.appendChild(opt);
});
rashis.forEach(r => {
  const opt = document.createElement('option');
  opt.value = r;
  opt.textContent = r;
  rashSel.appendChild(opt);
});

// month → masas
const monthToMasas = {
  1: ["Pausha"], 2: ["Magha"], 3: ["Phalguna"], 4: ["Chaitra"], 5: ["Vaishakha"],
  6: ["Ashadha"], 7: ["Ashadha","Shravana"], 8: ["Shravana"], 9: ["Bhadrapada"],
  10:["Ashwayuja"], 11:["Kartika"], 12:["Margashira"]
};

// hide result initially
resultDiv.classList.remove('show');

document.getElementById('findBtn').addEventListener('click', async () => {
  const birthDateStr = document.getElementById('birthDate').value;
  const nakshatra = nakSel.value.trim();
  const moonsign = rashSel.value.trim();

  if(!birthDateStr || !nakshatra || !moonsign) { alert('Please fill all fields'); return; }

  const birthDate = new Date(birthDateStr);
  const birthDay = birthDate.getDate();
  const birthMonth = birthDate.getMonth() + 1;
  const masas = monthToMasas[birthMonth];

  try {
    const data = await fetch('panchanga_2025.json').then(r=>r.json());

    const matches = Object.entries(data).filter(([date, info]) =>
      info.Nakshatra.toLowerCase() === nakshatra.toLowerCase() &&
      info.Moonsign.toLowerCase() === moonsign.toLowerCase() &&
      masas.some(m => info.Maasa.toLowerCase().includes(m.toLowerCase()))
    );

    if(matches.length === 0){
      resultDiv.innerHTML = `<p>No matches found for ${nakshatra} (${moonsign}) in ${masas.join(', ')}.</p>`;
      resultDiv.classList.add('show');
      return;
    }

    // sort by closest day
    matches.sort(([d1],[d2]) => {
      const day1 = parseInt(d1.split('/')[0]);
      const day2 = parseInt(d2.split('/')[0]);
      return Math.abs(day1 - birthDay) - Math.abs(day2 - birthDay);
    });

    const [date, info] = matches[0];

    resultDiv.innerHTML = `
      <h3>Your Birthday is on</h3>
      <h3>${date} → ${info.Tithi}, ${info.Nakshatra}, ${info.Moonsign}, ${info.Maasa}</h3>
    `;
    resultDiv.classList.add('show');

  } catch(err){
    console.error(err);
    resultDiv.innerHTML = `<p style="color:red;">Error loading data.</p>`;
    resultDiv.classList.add('show');
  }
});

// fade-in body after load
window.addEventListener('load', () => {
  document.body.classList.add('fade-in');
});

// mobile nav toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('show');
});
