'use client'

import { useEffect, useState } from 'react'
import { Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

const locationIcon = L.divIcon({
  html: `<div class="relative flex h-4 w-4"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-sm"></span></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
})

export default function CurrentLocation() {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  
  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, 16, { duration: 1.5 })
    },
    locationerror(e) {
      console.error('Location error:', e)
    }
  })

  useEffect(() => {
    const LocateControl = L.Control.extend({
      options: { position: 'bottomright' },
      onAdd: function () {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom hover:bg-slate-100 transition-colors');
        div.style.backgroundColor = 'white';
        div.style.width = '30px';
        div.style.height = '30px';
        div.style.cursor = 'pointer';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.title = 'Locate Me';
        
        div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-700"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`;

        div.onclick = function (e) {
          L.DomEvent.stopPropagation(e);
          e.preventDefault();
          // Provide some visual feedback? Leaflet doesn't do it automatically for custom controls
          map.locate({ setView: false, enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
        };

        return div;
      }
    });

    const control = new LocateControl();
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={locationIcon}>
      <Popup>
        <div className="font-medium text-slate-800 text-sm m-0 p-0">You are here</div>
      </Popup>
    </Marker>
  )
}
