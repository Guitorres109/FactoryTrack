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

* React / Vue / Angular
* HTML5 + CSS3
* JavaScript / TypeScript

### Mobile

* React Native / Flutter / Kotlin / Swift

### Back-end

* Node.js / Java / C# / Python
* Express / Spring Boot / .NET

### Banco de Dados

* MySQL / PostgreSQL / MongoDB

---

## 📸 Demonstração

### 📱 Aplicativo Mobile

#### 🔐 Tela de Login

![Login Mobile](./assets/mobile-login.png)

#### 📝 Cadastro de Ordem

![Cadastro Ordem](./assets/mobile-cadastro.png)

#### 📋 Lista de Ordens

![Lista Ordens](./assets/mobile-lista.png)

---

### 🌐 Sistema Web

#### 🔐 Tela de Login

![Login Web](./assets/web-login.png)

#### 📊 Dashboard / Listagem

![Dashboard](./assets/web-dashboard.png)

#### 📄 Detalhes da Ordem

![Detalhes](./assets/web-detalhes.png)

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
├── web/
├── mobile/
└── README.md
```

---

## 👨‍💻 Autores


Pietro Pardim Vieira
* GitHub: [https://github.com/seu-usuario](https://github.com/pietroxz777)

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
