// ¿Contra qué backend trabaja la app?
//  - 'produccion': el servidor en la nube (funciona con datos móviles, desde cualquier lugar)
//  - 'local':      tu laptop (para desarrollar; celular y laptop en el mismo Wi-Fi)
const ENTORNO = 'produccion';

const URLS = {
  local: 'http://192.168.18.162:3000', // actualiza esta IP si cambia (ipconfig)
  produccion: 'https://hogar-app-production.up.railway.app',
};

export const API_URL = URLS[ENTORNO];