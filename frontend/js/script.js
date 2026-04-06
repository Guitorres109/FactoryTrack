const API = "http://localhost:3000/api"; // ajuste se necessário

let token = localStorage.getItem("token");

// ============================
// LOGIN
// ============================
async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("erro").innerText = data.erro;
    return;
  }

  token = data.token;
  localStorage.setItem("token", token);

  iniciarApp();
}

// ============================
// INICIAR APP
// ============================
function iniciarApp() {
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  listarProdutos();
}

// ============================
// LOGOUT
// ============================
function logout() {
  localStorage.removeItem("token");
  location.reload();
}

// ============================
// PRODUTOS
// ============================
async function listarProdutos() {
  const res = await fetch(API + "/produtos", {
    headers: { Authorization: "Bearer " + token }
  });

  const produtos = await res.json();

  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = "";

  produtos.forEach(p => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${p.nome}
      <button onclick="deletarProduto(${p.id})">Excluir</button>
    `;

    lista.appendChild(li);
  });
}

async function criarProduto() {
  const nome = document.getElementById("nomeProduto").value;

  const res = await fetch(API + "/produtos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ nome })
  });

  if (res.ok) {
    listarProdutos();
  }
}

async function deletarProduto(id) {
  await fetch(API + "/produtos/" + id, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  listarProdutos();
}

// ============================
// AUTO LOGIN
// ============================
if (token) {
  iniciarApp();
}