import * as services from '/js/services/index.js';

export const LINK = 'http://10.106.208.32:3000'
export const API = `${LINK}/api`;

export async function api(method, url, body) {
  const opts = {
    method,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${services.TOKEN}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(API + url, opts);
  const data = await res.json();

  if (res.status === 401) { sair(); throw new Error('Sessão expirada'); }
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}
export function abrirQrCode(id, cliente, data) {

  const link = `http://10.106.208.32:3010/metaltech/ordem?id=${id}&cliente=${encodeURIComponent(cliente)}&data=${encodeURIComponent(data)}`;

  const url = `http://10.106.208.32:3000/api/qrcode?url=${encodeURIComponent(link)}`;

  window.open(url, '_blank');
}