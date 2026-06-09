import * as services from '/js/services/index.js';
import { cache } from '/js/services/cache.js';
Object.assign(window, services);


//====================================
//Função para carregar o cache ao entrar na pagina
//====================================

async function bootstrap() {
  try {
    await cache(); // 👈 PRIMEIRO passo obrigatório
  } catch (e) {
    console.error('Erro ao carregar cache:', e);
  }

  // depois disso o site inicia
  verificarLogin();
  services.enableSidebarSwipe();
}

//====================================
//Socket com o servidor para ter mudanças instantâneas
//====================================

//IP aqui

const socket = io('http://10.106.224.145:3000');

if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

socket.on("sync", (data) => {

  // ✅ DEFINE AS VARIÁVEIS
  let titulo = 'Sistema atualizado';
  let mensagem = '';

  switch (data.entity) {

    case "produtos":
      mensagem = 'Produtos foram atualizados';
      services.syncProdutosCache()
      break;

    case "clientes":
      mensagem = 'Clientes foram atualizados';
      services.syncClientesCache()
      break;

    case "ordens":
      mensagem = 'Ordens foram atualizadas';
      services.syncOrdensCache()
      break;

    case "usuarios":
      mensagem = 'Usuários foram atualizados';
      services.syncUsuariosCache()
      break;

    default:
      mensagem = 'Dados sincronizados';
  }

  services.cache()
  services.carregarDashboard();

  if (Notification.permission === 'granted') {

    const notificacao = new Notification(titulo, {
      body: mensagem,
      icon: '/icon.png'
    });

    notificacao.onclick = () => {
      window.focus();
    };
  }
  const n = new Notification(titulo, {
    body: mensagem,
    icon: '/icon.png'
  });
  
  n.onclick = () => {
    window.focus();
    window.location.href = '/dashboard';
  };
  
});

//====================================
//Verifica se o server esta ON
//====================================


export async function verificar() {
    const tela_erro = document.getElementById('tela-erro');
    const tela_login = document.getElementById('tela-login');
    const app = document.getElementById('app');

    try {
      const res = await fetch(services.API + '/verificar');

      if (!res.ok) {
        throw new Error("Servidor offline");
      }

      const data = await res.json();
      console.log(data.message);

    } catch (e) {
      console.log('Erro:', e.message);

      app.style.display = 'none';
      tela_login.style.display = 'none';
      tela_erro.style.display = 'block';
    }
  }
verificar()

export function verificarLogin() {
  if (!services.TOKEN){
    window.location.href = '/'
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);