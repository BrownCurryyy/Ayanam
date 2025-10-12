import requests
from bs4 import BeautifulSoup

date_str = "12/01/2025"
url = f"https://www.drikpanchang.com/panchang/day-panchang.html?date={date_str}"
res = requests.get(url)
soup = BeautifulSoup(res.text, "html.parser")

# Anchor at the parent div
parent = soup.find("div", id="dpPageWrapper")
inner = parent.find("div", id="dpInnerWrapper")
rashi_nakshatra_card = inner.find("div", id="dpRashiNakshatraCardWrapper")
table_card = rashi_nakshatra_card.find_all("div", id="dpTableCard")[0]

# Grab all child divs inside first table card
inner_divs = table_card.find_all("div")

# Extract Moon Sign (Raashi)
moon_sign = inner_divs[0].text.strip()

# Extract Nakshatra + Pada
nakshatra_info = inner_divs[1].text.strip()
parts = nakshatra_info.split("Pada")
nakshatra_name = parts[0].strip()
nakshatra_pada = "Pada " + parts[1].strip() if len(parts) > 1 else "N/A"

print(f"Moon Sign: {moon_sign}")
print(f"Nakshatra: {nakshatra_name}")
print(f"Pada: {nakshatra_pada}")
