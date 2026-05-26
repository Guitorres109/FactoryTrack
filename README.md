# 🏭 FactoryTrack

### Sistema de Registro e Acompanhamento de Produção

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![API](https://img.shields.io/badge/API-REST-green)

---

## 📌 Sobre o Projeto

O **FactoryTrack** é um sistema desenvolvido para digitalizar e otimizar o processo de gestão de ordens de produção da empresa fictícia **MetalTech Indústria**.

Atualmente, a empresa utiliza um processo manual baseado em papel, o que gera diversos problemas como:

* ❌ Retrabalho
* ❌ Falhas de comunicação
* ❌ Atrasos na produção
* ❌ Falta de rastreabilidade

💡 Este projeto resolve esses problemas através de uma solução completa composta por:

* 📱 Aplicativo Mobile (Líder de Produção)
* 🌐 Sistema Web (Administrativo)
* 🔗 Back-end com API REST

---

## 🎯 Objetivo

Criar um sistema integrado que permita:

* ✔ Registrar ordens de produção digitalmente
* ✔ Enviar automaticamente para o setor produtivo
* ✔ Acompanhar o status em tempo real
* ✔ Garantir organização e controle do processo

---

## 🧱 Arquitetura do Sistema

```
         📱 Mobile App
              │
              ▼
     🔗 API REST / Back-end
              │
              ▼
        🗄 Banco de Dados
              ▲
              │
         🌐 Sistema Web
```

---

## ⚙️ Funcionalidades

### 📱 Aplicativo Mobile (Produção)

* 🔐 Login de usuário
* 📝 Cadastro de ordens de produção:

  * Cliente
  * Produto
  * Quantidade
  * Prazo
* 📋 Listagem de ordens cadastradas
* 🔄 Atualização de status:

  * Aguardando Produção
  * Em Produção
  * Finalizado

---

### 🌐 Sistema Web (Administrativo)

* 🔐 Tela de login
* 📊 Listagem de ordens de produção
* 🔎 Filtro por status:

  * Aguardando Produção
  * Em Produção
  * Finalizado
* 📄 Visualização detalhada:

  * Cliente
  * Produto
  * Quantidade
  * Prazo
  * Status
* ⏱ Monitoramento de prazos
* 🔄 Atualização automática das informações

---

### 🔗 Back-end (API REST)

* 🧠 Gerenciamento de ordens de produção
* 📦 Cadastro e controle de produtos
* 🔐 Autenticação de usuários
* 🔄 Controle de status das ordens
* 🌍 Disponibilização de endpoints REST

---

## 🛠 Tecnologias Utilizadas

> ⚠️ Edite conforme o que você realmente usou

### Front-end Web

* HTML5 + CSS3
* JavaScript

### Mobile

* React Native / Flutter / Kotlin / Swift

### Back-end

* Node.js
* Express

### Banco de Dados

* SQLite

---

## 📸 Demonstração

### 📱 Aplicativo Mobile

#### 🔐 Tela de Login

<img width="397" height="834" alt="image" src="https://github.com/user-attachments/assets/dfae5e91-67ce-4de2-a683-e3ce9ae30600" />


#### 📝 Cadastro de Ordem

<img width="386" height="818" alt="image" src="https://github.com/user-attachments/assets/12387180-8ede-46b2-8738-44285a377c8a" />


#### 📋 Lista de Ordens

<img width="384" height="820" alt="image" src="https://github.com/user-attachments/assets/cd4a6fab-5e26-41f8-a604-0b4ebd033f73" />


---

### 🌐 Sistema Web

#### 🔐 Tela de Login

<img width="1920" height="940" alt="{93C17862-0284-48D2-9657-C7933F9320E4}" src="https://github.com/user-attachments/assets/c3ab6223-c199-4b0c-baed-d9ce214cca4e" />


#### 📊 Dashboard / Listagem

<img width="1919" height="938" alt="image" src="https://github.com/user-attachments/assets/5d7fa7ba-7a07-4c23-a45b-a5309bc32e17" />


#### 📄 Detalhes da Ordem

<img width="1919" height="946" alt="image" src="https://github.com/user-attachments/assets/b3d0c87e-460f-4028-b227-16e0a5692f23" />


---

## 🔌 Endpoints da API (Exemplo)

### 🔐 Autenticação

```
POST /auth/login
```

### 📦 Ordens de Produção

```
GET    /orders
GET    /orders/:id
POST   /orders
PUT    /orders/:id/status
```

### 📦 Produtos

```
GET    /products
POST   /products
```

---

## 🚀 Como Executar o Projeto

### 🔧 Back-end

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/factorytrack.git

# Entrar na pasta
cd backend

# Instalar dependências
npm install

# Rodar servidor
npm run dev
```

---

### 🌐 Front-end Web

```bash
cd web
npm install
npm start
```

---

### 📱 Mobile

```bash
cd mobile
npm install
npx expo start
```

---

## 📊 Status do Projeto

* 🚧 Em desenvolvimento
* ✔ Funcionalidades principais implementadas
* 🔄 Melhorias em andamento

---

## 📌 Melhorias Futuras

* 📈 Dashboard com gráficos de produção
* 🔔 Notificações em tempo real
* 📷 Upload de imagens das peças
* 🧾 Relatórios exportáveis (PDF/Excel)
* 👥 Controle de permissões de usuários

---

## 📁 Estrutura do Projeto

```
factorytrack/
│
├── backend/
├── frontend/
├── mobile/
└── README.md
```

---

## 👨‍💻 Autores


Pietro Pardim Vieira
* GitHub: https://github.com/pietroxz777

Nicolas Stekl Tordino
* GitHub: https://github.com/nttordino

Guilherme Barbosa Torres
* GitHub: https://github.com/guitorres109

João Pedro Nascimento Ferreira
* GitHub: https://github.com/joaozinhotx/javazin


---

## 📄 Licença

Este projeto está sob a licença MIT.

Sinta-se livre para usar e modificar 🚀

Eclesiastes 4:9-12 (NVI): "É melhor ter companhia do que estar sozinho, porque maior é a recompensa pelo trabalho de duas pessoas...".
