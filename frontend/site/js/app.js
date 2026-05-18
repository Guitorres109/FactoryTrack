import * as services from '/js/services/index.js';

Object.assign(window, services);

const usuario = JSON.parse(localStorage.getItem('pz_usuario') || 'null');

const cProdutos = await services.api('GET', '/produtos');
const cClientes = await services.api('GET', '/clientes');

let cUsuarios = null;
if (usuario?.perfil === 'Administrador') {
  cUsuarios = await services.api('GET', '/usuarios');
}
sessionStorage.setItem('Produtos', JSON.stringify(cProdutos));
sessionStorage.setItem('Clientes', JSON.stringify(cClientes));
if (cUsuarios) {
  sessionStorage.setItem('Usuarios', JSON.stringify(cUsuarios));
}

const socket = io('http://10.106.208.32:3000');

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
      carregarProdutos();
      break;

    case "clientes":
      mensagem = 'Clientes foram atualizados';
      carregarClientes();
      break;

    case "ordens":
      mensagem = 'Ordens foram atualizadas';
      carregarordens();
      break;

    case "usuarios":
      mensagem = 'Usuários foram atualizados';
      carregarUsuarios();
      break;

    default:
      mensagem = 'Dados sincronizados';
  }

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

// export function verificarLogin() {
//   if (!services.TOKEN){
//     window.location.href = '/'
//   }
// }

// document.addEventListener('DOMContentLoaded', () => {
//     verificarLogin();
//     services.enableSidebarSwipe();
// });