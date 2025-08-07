import { useEffect } from 'react';
import Head from 'next/head';

// We'll dynamically import the Leaflet components to avoid SSR issues
const HyderabadMap = () => {
  useEffect(() => {
    // Load Leaflet only on client side
    const loadMap = async () => {
      const L = await import('leaflet');
      require('leaflet/dist/leaflet.css');

      // Initialize the map
      const map = L.map('map').setView([17.3850, 78.4867], 12);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Custom icon (fixes default icon issue in Next.js)
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add Hyderabad marker
      L.marker([17.3850, 78.4867], { icon })
        .addTo(map)
        .bindPopup("<b>Hyderabad</b><br>City of Pearls, India")
        .openPopup();

      // Add circle around city center
      L.circle([17.3850, 78.4867], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.2,
        radius: 2000
      }).addTo(map);

      // Add some famous landmarks
      const landmarks = [
        {
          name: "Charminar",
          coords: [17.3616, 78.4747],
          description: "Iconic monument with 4 minarets"
        },
        {
          name: "Golconda Fort",
          coords: [17.3833, 78.4011],
          description: "Ancient fort with amazing acoustics"
        },
        {
          name: "Hussain Sagar",
          coords: [17.4239, 78.4738],
          description: "Large heart-shaped lake with Buddha statue"
        }
      ];

      landmarks.forEach(landmark => {
        L.marker(landmark.coords, { icon })
          .addTo(map)
          .bindPopup(`<b>${landmark.name}</b><br>${landmark.description}`);
      });
    };

    loadMap();

    // Cleanup function
    return () => {
      const mapElement = document.getElementById('map');
      if (mapElement && mapElement._leaflet_map) {
        mapElement._leaflet_map.remove();
      }
    };
  }, []);

  return (
    <div>
      <Head>
        <title>Hyderabad Map | Next.js + Leaflet</title>
        <meta name="description" content="Map of Hyderabad, India using Leaflet in Next.js" />
      </Head>

      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Hyderabad, India</h1>
      
      <div 
        id="map" 
        style={{ 
          height: '600px', 
          width: '100%',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      />
    </div>
  );
};

export default HyderabadMap;