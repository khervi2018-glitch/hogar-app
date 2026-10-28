// Decodifica el payload de un JWT sin verificar firma
// (la verificacion la hace el backend; aqui solo leemos los datos)
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    // base64url → base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// Extrae el id del usuario, sea cual sea el nombre del campo en tu payload
export function getUserIdFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;
  return payload.sub ?? payload.id ?? payload.userId ?? null;
}