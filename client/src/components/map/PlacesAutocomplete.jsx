import { Autocomplete, useJsApiLoader } from '@react-google-maps/api'
import { useId, useRef, useState } from 'react'

import Input from '@/components/ui/Input'
import { MAP_LIBRARIES, MAPS_API_KEY, NAIROBI_CENTER } from '@/utils/constants'

const KENYA_BOUNDS = {
  north: 5.02,
  south: -4.72,
  west: 33.9,
  east: 41.92,
}

export default function PlacesAutocomplete(props) {
  if (!MAPS_API_KEY) {
    return (
      <ManualCoordinates
        label={props.label}
        value={props.value}
        onChange={props.onChange}
        error={props.error}
        hint="Add VITE_GOOGLE_MAPS_API_KEY for address search. Enter coordinates for now."
      />
    )
  }
  return <PlacesField {...props} />
}

function PlacesField({ label, value, onChange, error, hint, placeholder }) {
  const { isLoaded } = useJsApiLoader({
    id: 'deliveroo-google-maps',
    googleMapsApiKey: MAPS_API_KEY,
    libraries: MAP_LIBRARIES,
  })
  const [text, setText] = useState(value?.address || '')
  const widget = useRef(null)
  const inputId = useId()

  const handlePlaceChanged = () => {
    const place = widget.current?.getPlace()
    if (!place?.geometry?.location) return

    const next = {
      address: place.formatted_address || place.name || text,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    }
    setText(next.address)
    onChange(next)
  }

  const handleManualEntry = (event) => {
    setText(event.target.value)
    if (!event.target.value) onChange(null)
  }

  if (!isLoaded) {
    return (
      <ManualCoordinates
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        hint="Loading Google Places…"
      />
    )
  }

  return (
    <Autocomplete
      onLoad={(instance) => {
        widget.current = instance
        instance.setFields(['formatted_address', 'geometry.location', 'name'])
        instance.setBounds(KENYA_BOUNDS)
        instance.setOptions({ strictBounds: false, componentRestrictions: { country: 'ke' } })
      }}
      onPlaceChanged={handlePlaceChanged}
    >
      <Input
        id={inputId}
        label={label}
        value={text}
        onChange={handleManualEntry}
        placeholder={placeholder || 'Start typing an address'}
        error={error}
        hint={hint || (value?.lat ? `Pinned at ${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}` : undefined)}
        autoComplete="off"
      />
    </Autocomplete>
  )
}

function ManualCoordinates({ label, value, onChange, error, hint }) {
  const update = (patch) => {
    const next = {
      address: value?.address || '',
      lat: value?.lat ?? NAIROBI_CENTER.lat,
      lng: value?.lng ?? NAIROBI_CENTER.lng,
      ...patch,
    }
    onChange(next.address ? next : null)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Input
        label={label}
        value={value?.address || ''}
        onChange={(event) => update({ address: event.target.value })}
        placeholder="Sarit Centre, Westlands"
        error={error}
        hint={hint}
      />
      <div className="grid grid-cols-2 gap-2.5">
        <Input
          label="Latitude"
          type="number"
          step="0.0001"
          value={value?.lat ?? ''}
          onChange={(event) => update({ lat: Number(event.target.value) })}
        />
        <Input
          label="Longitude"
          type="number"
          step="0.0001"
          value={value?.lng ?? ''}
          onChange={(event) => update({ lng: Number(event.target.value) })}
        />
      </div>
    </div>
  )
}
