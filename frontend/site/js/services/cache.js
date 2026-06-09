import * as services from '/js/services/index.js';

//====================================
//Salvar os dados no cache do navegador
//====================================


export async function cache() {
  const [cProdutos, cClientes, cOrdens, cUsuarios] = await Promise.all([
    services.api('GET', '/produtos'),
    services.api('GET', '/clientes'),
    services.api('GET', '/ordens'),
    services.api('GET', '/usuarios')
  ]);

  const usuario = JSON.parse(localStorage.getItem('pz_usuario'));

  if (usuario?.perfil === 'Administrador') {
    sessionStorage.removeItem('Usuarios');
  }

  sessionStorage.setItem('Produtos', JSON.stringify(cProdutos));
  sessionStorage.setItem('Clientes', JSON.stringify(cClientes));
  sessionStorage.setItem('Ordens', JSON.stringify(cOrdens));
  sessionStorage.setItem('Usuarios', JSON.stringify(cUsuarios));
}