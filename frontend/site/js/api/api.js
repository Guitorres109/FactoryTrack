import * as services from '/js/services/index.js';

//Rotas de APi e do qrcode gerado pelo server

const IP = '10.106.224.145'
export const LINK = `http://${IP}:3000`
export const API = `${LINK}/api`;

//Pegar dados do Server
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

  if (res.status === 401) { services.sair(); throw new Error('Sessão expirada'); }
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}
export function abrirQrCode(id, cliente, data) {

  const link = `${IP}:3010/metaltech/ordem?id=${id}&cliente=${encodeURIComponent(cliente)}&data=${encodeURIComponent(data)}`;

  const url = `${LINK}/api/qrcode?url=${encodeURIComponent(link)}`;

  window.open(url, '_blank');
}