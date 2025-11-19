import requests

# Quick script to check /api/ryanair/anyDestination
# Usage: python scripts/check_anydest.py

BASE = 'http://127.0.0.1:9000/api'
ORIGIN = 'LUZ'
DATE_FROM = '2026-06-01'
DATE_TO = '2026-06-10'

params = {
    'departureAirportIataCode': ORIGIN,
    'outboundDepartureDateFrom': DATE_FROM,
    'outboundDepartureDateTo': DATE_TO,
    'adultPaxCount': 1,
}

print('Querying', params)
resp = requests.get(f"{BASE}/ryanair/anyDestination", params=params)
print('Status:', resp.status_code)
if resp.ok:
    data = resp.json()
    print('Fares returned:', len(data.get('fares', [])))
    for fare in data.get('fares', [])[:10]:
        out = fare.get('outbound', {})
        dest = (out.get('arrivalAirport') or {}).get('iataCode') or (out.get('arrivalAirport') or {}).get('code')
        price_obj = out.get('price')
        price = None
        if isinstance(price_obj, dict):
            # Backend returns price.value as provided by FareFinder (no confirmation)
            price = price_obj.get('value')
            currency = price_obj.get('currencyCode') or price_obj.get('currency')
        else:
            price = price_obj
            currency = 'PLN'
        print(f"{ORIGIN} -> {dest}: {price} {currency}")

else:
    print(resp.text)
