'use client';

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { Search, Loader2 } from 'lucide-react';
import { addScrapedLead } from './actions';

function MapEvents({ setCenter }) {
  useMapEvents({
    moveend: (e) => {
      setCenter(e.target.getCenter());
    },
  });
  return null;
}

export default function LeafletMap() {
  const [center, setCenter] = useState({ lat: 23.0225, lng: 72.5714 }); // Ahmedabad
  const [places, setPlaces] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [saveStatus, setSaveStatus] = useState({});

  async function handleScrape() {
    setIsScraping(true);
    setPlaces([]);
    
    // Overpass API Query: Find clinics & hospitals within 5km of the center
    const radius = 5000;
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="clinic"](around:${radius},${center.lat},${center.lng});
        way["amenity"="clinic"](around:${radius},${center.lat},${center.lng});
        node["amenity"="hospital"](around:${radius},${center.lat},${center.lng});
        way["amenity"="hospital"](around:${radius},${center.lat},${center.lng});
        node["amenity"="dentist"](around:${radius},${center.lat},${center.lng});
      );
      out body;
      >;
      out skel qt;
    `;

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await res.json();
      
      // Filter out nodes without names
      const validPlaces = data.elements.filter(e => e.tags && e.tags.name);
      setPlaces(validPlaces);
    } catch (err) {
      alert("Error scraping area. Overpass API might be busy.");
    } finally {
      setIsScraping(false);
    }
  }

  async function handleAddLead(place) {
    setSaveStatus(prev => ({ ...prev, [place.id]: 'loading' }));
    
    const addressStr = [
      place.tags['addr:housenumber'],
      place.tags['addr:street'],
      place.tags['addr:city']
    ].filter(Boolean).join(', ');

    try {
      await addScrapedLead({
        clinicName: place.tags.name,
        doctorName: '',
        phone: place.tags.phone || place.tags['contact:phone'] || '',
        whatsapp: '',
        email: place.tags.email || place.tags['contact:email'] || '',
        address: addressStr || place.tags['addr:full'] || ''
      });
      setSaveStatus(prev => ({ ...prev, [place.id]: 'saved' }));
    } catch (e) {
      setSaveStatus(prev => ({ ...prev, [place.id]: 'error' }));
    }
  }

  return (
    <div className="flex h-[80vh] w-full relative">
      {/* Sidebar List */}
      <div className="w-96 bg-white border-r border-slate-100 flex flex-col h-full absolute z-[1000] left-0 shadow-2xl">
        <div className="p-4 border-b border-slate-100 bg-slate-50/90 backdrop-blur">
          <button 
            onClick={handleScrape}
            disabled={isScraping}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isScraping ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            {isScraping ? 'Scanning Area...' : 'Scrape This Area'}
          </button>
          <p className="text-xs text-slate-500 text-center mt-2">Pan the map and click Scrape (5km radius)</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {places.length === 0 && !isScraping && (
            <div className="text-center p-8 text-slate-400 text-sm">
              No leads scraped yet. Move the map and hit scan!
            </div>
          )}
          {places.map((place) => (
            <div key={place.id} className="p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0">
              <h4 className="font-bold text-slate-800 text-sm">{place.tags.name}</h4>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {place.tags['addr:city'] || place.tags.amenity}
              </p>
              
              <button 
                onClick={() => handleAddLead(place)}
                disabled={saveStatus[place.id]}
                className={`mt-3 text-xs font-medium py-1.5 px-3 rounded-lg w-full transition-colors ${
                  saveStatus[place.id] === 'saved' ? 'bg-green-100 text-green-700' :
                  saveStatus[place.id] === 'loading' ? 'bg-slate-100 text-slate-700' :
                  'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {saveStatus[place.id] === 'saved' ? 'Added to CRM' : 
                 saveStatus[place.id] === 'loading' ? 'Adding...' : 
                 '+ Add to CRM'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 ml-96 h-full relative z-0">
        <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents setCenter={setCenter} />
          {places.map(place => (
            place.lat && place.lon && (
              <Marker key={place.id} position={[place.lat, place.lon]}>
                <Popup>
                  <strong>{place.tags.name}</strong><br/>
                  {place.tags.amenity}
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
