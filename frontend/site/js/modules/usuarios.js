import * as services from '/services/index.js';

export async function carregarUsuarios() {
  const el = document.getElementById('tbl-usuarios');
  el.innerHTML = '<div class="spin-wrap"><div class="spin"></div> Carregando...</div>';
  try {
    const us = await api('GET', '/usuarios');
    if (!us.length) {
      el.innerHTML = '<div class="empty"><span class="ei">🔐</span>Nenhum usuário</div>';
      return;
    }
    el.innerHTML = `
      <table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Criado em</th><th>Ações</th></tr></thead>
        <tbody>
          ${us.map(u => `
            <tr>
            <input type="hidden" id="u-id" value="${u.id || u._id}">
              <td style="display:flex;align-items:center;gap:10px">
                <img src="${u.foto ? `${API}/uploads/usuarios/${u.foto}` : `${API}/uploads/usuarios/default.png`}" 
                    style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
                <div><strong>${u.nome}</strong></div>
              </td>
              <td>${u.email}</td>
              <td><span class="badge ${u.perfil === 'Administrador' ? 'b-admin' : 'b-atend'}">${u.perfil}</span></td>
              <td><span class="badge ${u.ativo ? 'b-on' : 'b-off'}">${u.ativo ? 'Ativo' : 'Inativo'}</span></td>
              <td style="font-size:.73rem;color:var(--muted)">
                ${new Date(u.createdAt).toLocaleDateString('pt-BR')}
              </td>
              <td>
                <div style="display:flex;gap:5px">
                  <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); abrirEdicaoUsuario('${u._id}', '${u.nome}', '${u.email}', '${u.perfil}', '${u.ativo}', '${u.foto}')">✏️</button>
                  <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deletarUsuario('${u._id}','${u.nome}')">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    el.innerHTML = `<div class="empty" style="color:var(--red)">${e.message}</div>`;
  }
}

//====================================
//função de abrir usuarios
//====================================

function abrirUsuario() {
  ['u-nome','u-email','u-senha'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('u-perfil').value = 'Atendente';
  abrir('m-usuario');
}

//====================================
//função de salvar usuarios
//====================================

function preview_foto(funcao) {

  let preview_foto;
  let input_foto;
  let foto_perfil;

  if (funcao === 'criar') {
    preview_foto = document.getElementById('preview-foto');
    input_foto = document.getElementById('u-foto');
    foto_perfil = input_foto.files[0];
  }

  
  else if (funcao === 'editar') {
    preview_foto = document.getElementById('preview-foto-edit');
    input_foto = document.getElementById('e-foto');
    foto_perfil = input_foto.files[0];
  }

  // Se removeu a imagem
  if (!foto_perfil) {
    preview_foto.src = 'http://10.106.208.32:3000/api/uploads/usuarios/default.png';
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    preview_foto.src = e.target.result;
  };

  reader.readAsDataURL(foto_perfil);
}

async function salvarUsuario() {
  const nome  = document.getElementById('u-nome').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const senha = document.getElementById('u-senha').value;
  const confirmarSenha = document.getElementById('u-confirmarSenha').value;
  const foto_perfil = document.getElementById('u-foto').files[0];
  const perfil = document.getElementById('u-perfil').value;

  const usuarioStorage = JSON.parse(localStorage.getItem('pz_usuario') || '{}');

  if (!nome || !email || !senha) {
    toast('Preencha todos os campos obrigatórios', 'err');
    return;
  }

  if (senha !== confirmarSenha) {
    toast('As senhas não correspondem', 'err');
    return;
  }

  try {
    const formData = new FormData();

    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('senha', senha);
    formData.append('perfil', perfil);
    formData.append('usuarioId', usuarioStorage?.id || usuarioStorage?._id);

    if (foto_perfil) {
      formData.append('foto', foto_perfil); 
    }

    const token = localStorage.getItem('pz_token'); // ou onde você salva

    await fetch(`${API}/usuarios`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    toast('Usuário criado!');
    fechar('m-usuario');
    carregarUsuarios();
    USUARIO_LOGADO.foto = `${API}/uploads/usuarios/${foto_perfil ? foto_perfil.name : 'default.png'}`;
  } catch (e) {
    toast('Erro: ' + e.message, 'err');
  }
}

function abrirEdicaoUsuario(id, nome, email, perfil, ativo, foto) {
  abrir('e-usuario'); // abre modal
  document.getElementById("u-id").value = id;
  document.getElementById('e-nome').value = nome;
  document.getElementById('e-email').value = email;
  document.getElementById('e-perfil').value = perfil;
  document.getElementById('u-senha').value = ''; // senha sempre vazia
  document.getElementById('u-ativo').value = ativo || true;
  const foto_perfil = document.getElementById('preview-foto-edit');
  foto_perfil.src = `${API}/uploads/usuarios/${foto || 'default.png'}`
}

async function editarUsuario() {
  const id = document.getElementById('u-id').value;
  const nome = document.getElementById('e-nome').value.trim();
  const email = document.getElementById('e-email').value.trim();
  const perfil = document.getElementById('e-perfil').value;
  const ativoValue = document.getElementById('u-ativo').value;
  const foto_perfil = document.getElementById('e-foto').files[0];

  const ativo = ativoValue === "true" ? 1 : 0;

  const senha = document.getElementById('e-senha').value.trim();
  const confirmarSenha = document.getElementById('e-confirmarSenha').value.trim();

  const usuarioStorage = JSON.parse(localStorage.getItem('pz_usuario') || '{}');
  const usuarioId = usuarioStorage?.id || usuarioStorage?._id;

  if (!nome || !email) {
    toast('Nome e email são obrigatórios', 'err');
    return;
  }

  if (!id) {
    toast('Erro: ID de usuário inválido', 'err');
    return;
  }

  if (senha && senha !== confirmarSenha) {
    toast('Erro: As senhas não correspondem', 'err');
    return;
  }

  try {
    const formData = new FormData();

    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('perfil', perfil);
    formData.append('ativo', ativo);
    formData.append('usuarioId', usuarioId);

    if (senha) {
      formData.append('senha', senha);
    }

    if (foto_perfil) {
      formData.append('foto', foto_perfil); // 🔥 aqui é o arquivo real
    }

    await fetch(`${API}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('pz_token')}`
      },
      body: formData
    });

    toast('Usuário atualizado!');
    fechar('e-usuario');
    carregarUsuarios();
    carregarFoto()
  } catch (e) {
    console.error(e);
    toast('Erro: ' + e.message, 'err');
  }
}

async function removerFotoUsuario() {
  const usuarioId = document.getElementById("u-id").value;

  try {
    if (!confirm(`Você tem certeza que deseja deletar esta foto de perfil?`)) return;
    const res = await fetch(`${API}/usuarios/${usuarioId}/foto`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    // 🔥 evita quebrar quando não vem JSON
    let data;
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
      toast('Foto de perfil removida com sucesso!')
      fechar('e-usuario');
      carregarUsuarios();
      carregarFoto()
    } else {
      const text = await res.text();
      toast(text, 'err')
      throw new Error(`Resposta inválida do servidor: ${text.substring(0, 100)}`);
    }

    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao remover foto');
    }

    return data;

  } catch (err) {
    console.error('Erro ao remover foto:', err.message);
    throw err;
  }
}

//====================================
//função de deletar usuarios
//====================================

async function deletarUsuario(id, nome) {
  if (!confirm(`Você tem certeza que deseja deletar o usuário "${nome}"?`)) return;
  try {
    await api('DELETE', '/usuarios/' + id, { usuarioId: JSON.parse(localStorage.getItem('pz_usuario'))?.id || JSON.parse(localStorage.getItem('pz_usuario'))?._id });
    toast('Usuário deletado!');
    carregarUsuarios();
  } catch (e) { toast('Erro: ' + e.message, 'err'); }
}