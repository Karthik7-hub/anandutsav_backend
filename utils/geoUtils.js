import axios from 'axios';

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim API
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @returns {Object} { city, state, country, formattedAddress }
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    
    // Nominatim requires a user-agent
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'AnandUtsavApp/1.0 (contact@anandutsav.com)'
      }
    });

    const data = response.data;
    if (data && data.address) {
      return {
        city: data.address.city || data.address.town || data.address.village || data.address.county || '',
        state: data.address.state || '',
        country: data.address.country || '',
        formattedAddress: data.display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error.message);
    return null;
  }
};
