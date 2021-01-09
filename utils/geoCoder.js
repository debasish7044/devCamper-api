const NodeGeocoder = require('node-geocoder');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const options = {
  provider: process.env.GEOCODER_PROVIDER,

  // Optional depending on the providers
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};

console.log();

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
