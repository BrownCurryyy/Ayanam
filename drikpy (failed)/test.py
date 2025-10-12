from drik import *

# Define a place (your city)
my_place = Place(12.972, 77.594, 5.5)  # Bangalore

# Define date (year, month, day)
my_date = Date(2025, 10, 12)

# Convert to Julian day
jd = gregorian_to_jd(my_date)

# Run the functions
print("Tithi:", tithi(jd, my_place))
print("Nakshatra:", nakshatra(jd, my_place))
print("Yoga:", yoga(jd, my_place))
print("Vaara:", vaara(jd))
print("Masa:", masa(jd, my_place))
