# 📚 Entrelinhas

O **Entrelinhas** é um diário de leitura para organizar seus livros e registrar o que acontece a cada página. Cadastre um livro na sua estante e, depois, acompanhe seu progresso, escreva anotações ou guarde uma resenha.

Os dados são salvos no **MongoDB**. Cada livro fica em um documento que reúne suas informações, tags e registros de leitura — incluindo páginas lidas, notas e datas.

---

## ✨ O que você pode fazer

- Cadastrar livros com título, autor, número de páginas e tags.
- Acompanhar o status: **Quero ler**, **Lendo** ou **Concluído**.
- Registrar sessões de leitura com páginas lidas e anotações.
- Escrever uma resenha para cada livro.
- Consultar no cartão o histórico completo de anotações e resenhas do livro.
- Atualizar o progresso automaticamente; ao chegar à última página, o livro é concluído.
- Buscar por título, autor, tag ou texto das anotações.
- Filtrar a biblioteca por status.

---

## 🛠️ Tecnologias utilizadas

- **Frontend:** React, TypeScript, Vite e Tailwind CSS
- **Backend:** Python e FastAPI
- **Banco de dados:** MongoDB
- **Containers:** Docker e Docker Compose

---

## 🚀 Como executar com Docker

O Docker Compose inicia o MongoDB, a API Python e a interface web juntos.

1. Abra um terminal na pasta raiz do projeto.
2. Execute:

   ```bash
   docker compose up --build
   ```

3. Quando os serviços estiverem prontos, acesse:

   - **Aplicação:** http://localhost:3000
   - **API:** http://localhost:8000/api
   - **Documentação interativa da API:** http://localhost:8000/docs

Para encerrar os serviços, pressione `Ctrl+C` e execute:

```bash
docker compose down
```

Os livros ficam guardados no volume Docker `mongo_data` e continuam salvos quando os containers são encerrados. Para iniciar novamente, use `docker compose up`.

---

## 💻 Como executar para desenvolvimento

Você também pode iniciar a API e o frontend separadamente. Essa opção requer Python, Node.js, npm e um MongoDB local na porta `27017`.

### Passo 1: iniciando o backend

Abra um terminal e entre na pasta da API:

```bash
cd api
```

Crie e ative um ambiente virtual e instale as dependências:

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Inicie o servidor Python:

```bash
uvicorn app.main:app --reload --port 8000
```

A API ficará disponível em http://localhost:8000.

### Passo 2: iniciando o frontend

Abra **outro terminal**, volte à pasta raiz do projeto e instale as dependências:

```bash
npm install
```

Inicie o Vite:

```bash
npm run dev
```

Abra o endereço mostrado no terminal, normalmente http://localhost:5173. Durante o desenvolvimento, o Vite encaminha as chamadas da interface para a API na porta `8000`.

---

## 🗂️ Estrutura dos dados

Cada livro é salvo como um documento na coleção `books`. Além de título, autor, páginas, status e tags, o documento contém um array `entries` com o histórico de sessões e resenhas daquele livro.

Assim, os registros relacionados à leitura ficam reunidos no próprio documento do livro no MongoDB.

---

### 🌿 Boa leitura!

Um capítulo de cada vez.
