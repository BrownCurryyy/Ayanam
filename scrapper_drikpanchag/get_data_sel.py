from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

chrome_options = Options()
chrome_options.add_argument("--headless")  # runs in background

driver = webdriver.Chrome(options=chrome_options)
url = "https://www.drikpanchang.com/panchang/day-panchang.html?date=12/01/2025"
driver.get(url)

html = driver.page_source
soup = BeautifulSoup(html, "html.parser")

# now parent div exists
parent = soup.find("div", id="dpPageWrapper")
print(parent)  # should not be None

driver.quit()
