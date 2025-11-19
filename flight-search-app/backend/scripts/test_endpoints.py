from fastapi.testclient import TestClient
import json
import sys
import os

# Ensure parent folder (backend) is on sys.path so we can import main
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from main import app

client = TestClient(app)

print('Checking /health')
r = client.get('/')
print('Status code:', r.status_code)
print('Body:', r.json())

# Test availableDates
print('\nChecking availableDates WAW->ALC')
r = client.get('/api/ryanair/availableDates', params={'origin':'WAW','destination':'ALC'})
print('Status', r.status_code)
print('Body keys:', list(r.json().keys()))

# Test farfinder (round-trip) without confirm
print('\nChecking farfinder (WAW->ALC) without confirm')
params = {
    'departureAirportIataCode': 'WAW',
    'arrivalAirportIataCode': 'ALC',
    'outboundDepartureDateFrom': '2025-11-19',
    'outboundDepartureDateTo': '2025-11-20',
    'inboundDepartureDateFrom': '2025-11-20',
    'inboundDepartureDateTo': '2025-11-21',
    'durationFrom': 1,
    'durationTo': 7,
    'adultPaxCount': 1
}

r = client.get('/api/ryanair/farfinder', params=params)
print('Status', r.status_code)
data = r.json()
print('fares count:', len(data.get('fares', [])))
if data.get('fares'):
    first = data['fares'][0]
    print('First fare keys:', list(first.keys()))
    ob = first.get('outbound') or {}
    price = ob.get('price')
    print('Outbound price raw:', price)
    if isinstance(price, dict):
        print('value:', price.get('value'), 'currency:', price.get('currencyCode'))
        print('priceInPLN:', price.get('priceInPLN'))

# Test oneWay
print('\nChecking oneWay (WAW->ALC)')
params2 = {
    'departureAirportIataCode': 'WAW',
    'arrivalAirportIataCode': 'ALC',
    'outboundDepartureDateFrom': '2025-11-19',
    'outboundDepartureDateTo': '2025-11-20',
    'outboundDepartureDaysOfWeek': 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY',
    'outboundDepartureTimeFrom': '00:00',
    'outboundDepartureTimeTo': '23:59',
    'adultPaxCount': 1
}

r = client.get('/api/ryanair/oneWayFares', params=params2)
print('Status', r.status_code)
data2 = r.json()
print('fares count:', len(data2.get('fares', [])))
if data2.get('fares'):
    first = data2['fares'][0]
    ob = first.get('outbound') or {}
    p = ob.get('price')
    print('Outbound price:', p)

# Test anyDestination - limited small range
print('\nChecking anyDestination (WAW -> ANY)')
params3 = {
    'departureAirportIataCode': 'WAW',
    'outboundDepartureDateFrom': '2025-11-19',
    'outboundDepartureDateTo': '2025-11-20',
    'adultPaxCount': 1
}

r = client.get('/api/ryanair/anyDestination', params=params3)
print('Status', r.status_code)
print('fares count:', len(r.json().get('fares', [])))

print('\nDone')
