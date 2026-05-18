import * as services from '/services/index.js';

let clientesCache = [];

export async function carregarClientes(busca = '') {
  const el = document.getElementById('tbl-clientes');

  try {
    if (busca && busca.length < 2) {
      renderClientes(clientesCache);
      return;
    }

    el.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';

    const url = `/clientes${busca ? `?busca=${encodeURIComponent(busca.trim())}` : ''}`;

    const resposta = await api('GET', url);

    clientesCache = Array.isArray(resposta) ? resposta : [];

    renderClientes(clientesCache);

  } catch (e) {
    console.error('Erro carregarClientes:', e);
    el.innerHTML = `<div class="empty" style="color:var(--primary)">Erro ao carregar clientes</div>`;
  }
}

export function renderClientes(lista) {
  const el = document.getElementById('tbl-clientes');

  if (!el) return;

  if (!lista.length) {
    el.innerHTML = '<div class="empty"><span class="ei">👥</span>Nenhum cliente</div>';
    return;
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Telefone</th>
          <th>Endereço</th>
          <th>Obs</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(c => {
          const endereco = c.endereco
            ? [c.endereco.rua, c.endereco.numero, c.endereco.bairro, c.endereco.cidade]
                .filter(Boolean)
                .join(', ')
            : '—';

          return `
            <tr>
              <td><strong>${c.nome || '—'}</strong></td>
              <td>${formatarTelefone(c.telefone)}</td>
              <td style="font-size:.76rem;color:var(--muted)">${endereco}</td>
              <td style="font-size:.76rem;color:var(--muted)">${c.observacoes || '—'}</td>
              <td><div style="display:flex;gap:5px"><button class="btn btn-ghost btn-sm"onclick='abrirEdicaoCliente(${JSON.stringify(c)})'>✏️</button><button class="btn btn-danger btn-sm"onclick="deletarCliente('${c.id || c._id}','${c.nome}')">🗑️</button></div></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function formatarTelefone(tel) {
  if (!tel) return '—';

  // remove tudo que não for número
  const nums = tel.replace(/\D/g, '');

  // se não tiver 10 ou 11 dígitos, retorna original
  if (nums.length !== 10 && nums.length !== 11) {
    return tel;
  }

  const ddd = nums.slice(0, 2);

  // celular (11 dígitos)
  if (nums.length === 11) {
    return `(${ddd}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  }

  // fixo (10 dígitos)
  return `(${ddd}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
}

function normalizar(txt) {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function buscarCli(valor) {
  const query = normalizar(valor)
    .trim()
    .split(' ')
    .filter(Boolean);

  if (!query.length) {
    renderClientes(clientesCache);
    return;
  }

  const filtrados = clientesCache.filter(cli => {
    const nome = normalizar(cli.nome || '');

    return query.every(p => nome.includes(p));
  });

  renderClientes(filtrados);
}


export function abrirCliente() {
  document.getElementById('m-cli-t').textContent = 'Novo Cliente';

  ['c-id','c-nome','c-tel','c-rua','c-num','c-bairro','c-cidade','c-cep','c-comp','c-obs']
    .forEach(id => { 
      const e = document.getElementById(id); 
      if (e) e.value = ''; 
    });

  abrir('m-cliente');

  // 👇 adiciona o listener do CEP
  const cepInput = document.getElementById('c-cep');

  if (cepInput) {
    cepInput.addEventListener('blur', () => {
      buscarCEPCliente(cepInput.value);
    });
  }
}

async function buscarCEPCliente(cep) {
  cep = cep.replace(/\D/g, '');
  
  if (cep.length !== 8) return;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();

    document.getElementById('c-rua').value    = data.logradouro || '';
    document.getElementById('c-bairro').value = data.bairro || '';
    document.getElementById('c-cidade').value = data.localidade || '';

  } catch (err) {
    console.error('Erro ao buscar CEP:', err);
  }
}

//====================================
//função de editar cliente
//====================================


export function abrirEdicaoCliente(c) {
  document.getElementById('c-id').value = c.id || c._id;
  abrir("e-cliente");
  document.getElementById('e-nomeclient').value = c.nome || '';
  document.getElementById('e-tel').value = c.telefone || '';
  const end = c.endereco || {};
  document.getElementById('e-rua').value = end.rua || '';
  document.getElementById('e-num').value = end.numero || '';
  document.getElementById('e-bairro').value = end.bairro || '';
  document.getElementById('e-cidade').value = end.cidade || '';
  document.getElementById('e-cep').value = end.cep || '';
  document.getElementById('e-comp').value = end.complemento || '';
  document.getElementById('e-obs').value = c.observacoes || '';
}

export async function editarCliente() {
  const id = document.getElementById('c-id').value;
  const nome = document.getElementById('e-nomeclient').value.trim();
  const telefone = document.getElementById('e-tel').value.trim();
  const rua = document.getElementById('e-rua').value.trim();
  const numero = document.getElementById('e-num').value.trim();
  const bairro = document.getElementById('e-bairro').value.trim()
  const cidade = document.getElementById('e-cidade').value.trim()
  const cep = document.getElementById('e-cep').value.trim()
  const complemento = document.getElementById('e-comp').value.trim()
  const observacoes = document.getElementById('e-obs').value.trim()
  const usuarioId = JSON.parse(localStorage.getItem('pz_usuario') || '{}').id;
  // Validações iniciais
  if (!nome || !telefone) {
    toast('Nome e telefone são obrigatórios', 'err');
    return;
  }

  if (!id) {
    toast('Erro: ID de cliente inválido', 'err');
    return;
  }

  try {
    const endereco = {rua, numero, bairro, cidade, cep, complemento}
    // Criação do corpo da requisição
    let body = {nome, telefone, endereco, observacoes, usuarioId};

    // Enviar a requisição para a API
    await api('PUT', `/clientes/${id}`, body);
    toast('Cliente atualizado!');
    fechar('e-cliente');
    carregarClientes();
  } catch (e) {
    toast('Erro: ' + (e.message || 'desconhecido'), 'err');
  }
}
//====================================
//função de salvar novo cliente
//====================================

export async function salvarCliente() {
  const id = document.getElementById('c-id').value.trim();
  const nome = document.getElementById('c-nome').value.trim();
  const tel  = document.getElementById('c-tel').value.trim();
  const usuarioId = JSON.parse(localStorage.getItem('pz_usuario') || '{}').id;
  const d = {
    nome,
    telefone: tel,
    endereco: {
      rua: document.getElementById('c-rua').value.trim(),
      numero: document.getElementById('c-num').value.trim(),
      bairro: document.getElementById('c-bairro').value.trim(),
      cidade: document.getElementById('c-cidade').value.trim(),
      cep: document.getElementById('c-cep').value.trim(),
      complemento: document.getElementById('c-comp').value.trim(),
    },
    observacoes: document.getElementById('c-obs').value.trim(),
    usuarioId: usuarioId 
  };

  if (!d.nome || !d.telefone || !d.endereco.rua || !d.endereco.numero || !d.endereco.bairro || !d.endereco.cidade || !d.endereco.cep) {
    toast('Preencha todos os campos obrigatórios', 'err');
    return;
  }

  try {
    const isEdit = !!id;

    if (isEdit) {
      await api('PUT', `/clientes/${id}`, d);
    } else {
      await api('POST', '/clientes', d);
    }

    toast(isEdit ? 'Cliente atualizado!' : 'Cliente cadastrado!');
    fechar('m-cliente');
    carregarClientes();

  } catch (e) {
    toast('Erro: ' + (e?.message || 'desconhecido'), 'err');
  }
}

//====================================
//função de deletar clientes
//====================================

export async function deletarCliente(id, nome) {
  const usuarioId = JSON.parse(localStorage.getItem('pz_usuario') || '{}').id;
  if (!confirm(`Você tem certeza que deseja deletar o cliente "${nome}"?`)) return;
  try {
    await api('DELETE', '/clientes/' + id, { usuarioId });
    toast('Cliente deletado!');
    carregarClientes();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}