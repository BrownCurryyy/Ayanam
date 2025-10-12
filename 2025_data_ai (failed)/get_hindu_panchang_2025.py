# get_panchang_2025.py
# Requires: pip install requests
import requests, json, datetime, time

LAT = 23.1823900
LNG = 75.7764300
TZ = "Asia/Kolkata"

START_DATE = datetime.date(2025, 1, 1)
END_DATE = datetime.date(2025, 12, 31)
OUTPUT_FILE = "panchang_2025.json"

headers = {
    "x-rapidapi-key": API_KEY
    "x-rapidapi-host": API_HOST
}

def fetch_panchang(date_obj):
    date_str = date_obj.strftime("%d-%m-%Y")
    url = f"{BASE_URL}?lat={LAT}&lng={LNG}&date={date_str}&timezone={TZ}"
    try:
        res = requests.get(url, headers=headers, timeout=20)
        if res.status_code != 200:
            print(f"[!] {date_str}: Failed ({res.status_code})")
            return None
        data = res.json()

        # adjust keys depending on response structure
        maasa = data.get("maasa") or data.get("month") or "N/A"
        nakshatra = data.get("nakshatra") or data.get("nakshatra_name") or "N/A"
        raashi = data.get("rashi") or data.get("moon_sign") or "N/A"

        return {
            "date": date_obj.strftime("%d-%m-%Y"),
            "maasa": maasa,
            "nakshatra": nakshatra,
            "raashi": raashi
        }
    except Exception as e:
        print(f"[x] Error fetching {date_str}: {e}")
        return None

def main():
    results = []
    cur_date = START_DATE
    while cur_date <= END_DATE:
        info = fetch_panchang(cur_date)
        if info:
            results.append(info)
        time.sleep(1.0)
        cur_date += datetime.timedelta(days=1)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Done! Saved {len(results)} entries to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
