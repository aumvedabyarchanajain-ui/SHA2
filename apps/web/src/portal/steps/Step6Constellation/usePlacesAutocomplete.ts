'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

export interface PlaceResult {
  description: string
  lat: number
  lng: number
}

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, opts?: Record<string, unknown>) => {
            addListener: (event: string, cb: () => void) => void
            getPlace: () => {
              formatted_address?: string
              geometry?: { location: { lat: () => number; lng: () => number } }
            }
          }
        }
      }
    }
    __aumvedaPlacesLoading?: Promise<void>
  }
}

const COMMON_CITIES: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  london: { lat: 51.5074, lng: -0.1278 },
  'new york': { lat: 40.7128, lng: -74.006 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  san_francisco: { lat: 37.7749, lng: -122.4194 },
}

export function resolveCityCoordinates(cityName: string): { lat: number; lng: number } {
  const clean = cityName.trim().toLowerCase()
  for (const [key, coords] of Object.entries(COMMON_CITIES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords
    }
  }
  // Default to New Delhi coordinates for Vedic calculations if unresolved
  return { lat: 28.6139, lng: 77.209 }
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (window.google?.maps?.places) return Promise.resolve()
  if (window.__aumvedaPlacesLoading) return window.__aumvedaPlacesLoading

  window.__aumvedaPlacesLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Places script'))
    document.head.appendChild(script)
  })

  return window.__aumvedaPlacesLoading
}

/**
 * Progressive enhancement: wires Google Places Autocomplete onto the given input ref
 * when NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is configured. Without a key, fallback coordinate
 * resolution ensures astrology computations never fail.
 */
export function usePlacesAutocomplete(
  inputRef: RefObject<HTMLInputElement | null>,
  onSelect: (result: PlaceResult) => void,
) {
  const [available, setAvailable] = useState(false)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!apiKey || !inputRef.current) return

    let cancelled = false
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) return
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['(cities)'],
          fields: ['formatted_address', 'geometry'],
        })
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (!place.geometry?.location) return
          onSelectRef.current({
            description: place.formatted_address ?? '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          })
        })
        setAvailable(true)
      })
      .catch((err) => {
        console.warn('[usePlacesAutocomplete] Falling back to local coordinate resolver:', err)
      })

    return () => {
      cancelled = true
    }
  }, [inputRef])

  return { available }
}
