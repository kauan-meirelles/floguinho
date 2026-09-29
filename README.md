# 📸 Floguinho

> Uma releitura moderna e nostálgica das clássicas redes sociais de fotorrecados dos anos 2000, inspirada na série **De Volta aos 15** (Netflix) 💖🎸.

<div align="center">
  <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/React-18-blue" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-Python-green" alt="FastAPI">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-darkgreen" alt="MongoDB">
</div>

---

## 🌟 Sobre o Projeto

O **Floguinho** é um projeto *full-stack* desenvolvido para recriar a essência visual e interativa dos antigos "flogs" (flogões), combinando uma estética retro muito marcante com uma arquitetura web moderna, rápida e responsiva[cite: 1, 2, 3].

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna e robusta[cite: 1, 2, 3]:

* **Frontend:**
  * ⚛️ **React** & **TypeScript**
  * ⚡ **Vite** (Build tool de alta performance)
  * 🎨 **Tailwind CSS** (Estilização com identidade visual personalizada)
  * 🧭 **React Router** (Gestão de rotas)
  * 🔄 **TanStack React Query** (Gestão de estado do servidor e cache)

* **Backend:**
  * ⚙️ **FastAPI** (Framework Python assíncrono de alta performance)
  * 🔒 **Pydantic v2** (Validação rigorosa de dados)
  * 🍃 **MongoDB Atlas** (Base de dados NoSQL em nuvem)

---

## ✨ Funcionalidades

* 🔐 **Sistema de Autenticação:** Registo e início de sessão seguro com sessões persistentes.
* 🖼️ **Feed de Fotos:** Publicação e visualização de fotos com filtros personalizados.
* 💬 **Recados Privados:** Sistema de mensagens e recados entre utilizadores.
* 🤝 **Interações de Perfil:** Gestão completa de perfil, fãs, "migos" e galerias de fotos.

---

## 🛠️ Como Executar o Projeto Localmente

Certifica-te de que tens o **Node.js** e o **Python** instalados no teu computador.

### 1. Clonar o repositório
```bash
git clone [https://github.com/kauan-meirelles/floguinho.git](https://github.com/kauan-meirelles/floguinho.git)
cd floguinho
```

### 2. Configurar e Executar o Backend
No terminal, entra na pasta do backend, ativa o ambiente virtual e inicia o servidor:

```bash
cd backend
python -m venv venv
```
No Windows (PowerShell):
venv\Scripts\Activate

Instalar dependências
```bash
   pip install -r requirements.txt
```
Iniciar o servidor FastAPI

```bash
uvicorn server:app --reload
```

### 3. Configurar e Executar o Frontend
Abre um novo terminal, entra na pasta do frontend, instala as dependências e inicia a aplicação:

```bash
cd frontend
npm install
npm run dev
```
Acede a aplicação através do link local fornecido pelo Vite (geralmente http://localhost:5173).

Desenvolvido por Kauan Meirelles

