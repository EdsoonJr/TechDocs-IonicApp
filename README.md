# 📚 TechDocs

O TechDocs é um aplicativo mobile desenvolvido com o objetivo de centralizar e otimizar o acesso a recursos educativos na área de Tecnologia da Informação (TI). Ele permite que os usuários façam uploads, downloads e busquem PDFs compartilhados por estudantes e profissionais de TI, facilitando a troca de conhecimento e a organização de materiais de estudo.

---

## 🚀 Funcionalidades

### 🌟 Funcionalidades principais:
- **Login e Cadastro**:
  - Autenticação via Firebase (e-mail e senha).
- **Home**:
  - Exibe PDFs com miniaturas geradas automaticamente.
  - Exibe PDFs sugeridos e recentes.
  - Permite baixar, abrir ou adicionar PDFs a pastas personalizadas.
- **Busca**:
  - Pesquise PDFs por título, tags, ou áreas de interesse.
- **Pastas**:
  - Organize seus PDFs em pastas personalizadas.
- **Perfil**:
  - Acesse "Meus Uploads", "Meus Downloads", "Minhas Avaliações" e "Meus PDFs Avaliados".
- **Upload de PDFs**:
  - Envie seus PDFs com informações adicionais como título, descrição e tags.
  - As miniaturas são geradas automaticamente.
- **Avaliações**:
  - Avalie PDFs com até 5 estrelas diretamente na visualização.
  - Veja a média de avaliações para cada PDF.
  
---

## 🛠️ Tecnologias Utilizadas

### 🔹 Front-End
- **Ionic Framework**:
  - Desenvolvimento de interfaces mobile multiplataforma.
- **Angular**:
  - Estrutura para criação de aplicações web dinâmicas.

### 🔹 Back-End
- **Firebase**:
  - Autenticação (Firebase Authentication).
  - Armazenamento de dados (Firestore Database).
  - Armazenamento de arquivos (Firebase Storage).

### 🔹 Outros
- **Capacitor**:
  - Integração de recursos nativos para dispositivos mobile.
- **Git**:
  - Controle de versão e integração contínua.

---

## 🎯 Estrutura do Projeto

### 📂 Estrutura de Diretórios
```plaintext
src/
├── app/
│   ├── pages/                # Páginas (Home, Login, Profile, Search, etc.)
│   │   ├── home/             # Página inicial
│   │   ├── login/            # Página de login
│   │   ├── profile/          # Página do perfil do usuário
│   │   └── search/           # Página de busca
│   ├── models/               # Modelos de dados
│   └── services/             # Serviços (PDF, Firebase, Review, Folder)
└── assets/                   # Recursos como ícones e imagens

```


## 🌐 Rotas e Navegação

O aplicativo segue uma arquitetura de navegação com base nas seguintes rotas:

| **Página**       | **Rota/URL**       | **Descrição**                                                                                     |
|-------------------|--------------------|---------------------------------------------------------------------------------------------------|
| Login            | `/log-in`          | Página de autenticação para o usuário acessar a plataforma.                                      |
| Cadastro         | `/sign-up`         | Página de registro para novos usuários.                                                          |
| Home             | `tabs/home`        | Página inicial onde os PDFs são listados, incluindo sugestões e recentes.                        |
| Busca            | `tabs/search`      | Página de busca de PDFs por título etags                                                         |
| Pastas           | `tabs/folder`      | Gerencie pastas e organize PDFs.                                                                 |
| Perfil           | `tabs/profile`     | Exibe informações do perfil do usuário, incluindo downloads, uploads e avaliações.               |



### Fluxo de Navegação

1. **Usuário não autenticado:**
   - Acessa a página de **login** ou **cadastro**.
   - Após autenticação, é redirecionado para a **Home**.

2. **Usuário autenticado:**
   - Pode acessar todas as páginas protegidas, como **Home**, **Busca**, **Pastas**, e **Perfil**.
   - A navegação entre as páginas é feita por uma barra de navegação na parte inferior.

3. **Interação com PDFs:**
   - O usuário pode abrir, baixar, adicionar a pastas ou avaliar PDFs diretamente na **Home** ou após buscas na página de **Busca**.

# 🔍 Detalhes de Implementação

## 📤 Upload de PDFs

**Passos:**
1. O arquivo PDF é carregado pelo usuário.
2. O Firebase Storage armazena o arquivo.
3. Metadados como título, descrição e tags são salvos no Firestore.
4. Uma miniatura é gerada e vinculada ao PDF.

---

## 🗂️ Criação e Adição de Pastas

**Funcionalidade:**
- Usuários podem criar novas pastas para organizar seus PDFs.
- As pastas são armazenadas no **Firestore** com informações como nome, data de criação e a lista de PDFs associados.
- Ao adicionar um PDF, o usuário pode selecionar a pasta onde ele deseja organizá-lo.

---

## ⭐ Sistema de Avaliações

**Funcionalidade:**
- Usuários podem avaliar PDFs diretamente na página **Home**.
- As avaliações são armazenadas em uma **collection** no Firestore.
- A média das avaliações é recalculada e atualizada automaticamente.


## 📋 Pré-requisitos para Rodar Localmente

- **Node.js** (v16+)
- **Angular CLI** (v15+)
- **Ionic CLI** (v6+)
- **Configuração Firebase:**
1. Crie um projeto no Firebase.
2. Habilite **Authentication**, **Firestore Database** e **Storage**.
3. Substitua o conteúdo do arquivo `environment.ts` com suas credenciais do Firebase.

---

## 🛠️ Como Rodar o Projeto

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seuusuario/TechDocs.git
   cd tech-docs-master
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3.  **Configure o Firebase:**
   - Substitua o arquivo `src/environments/environment.ts` com suas credenciais.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   ionic serve
   ```
5. **Para testar em dispositivos móveis:**
   ```bash
   ionic capacitor build android
   ionic capacitor run android
   ```

## 👨‍💻 Contribuidores
- [Edson de Araújo Júnior](https://github.com/EdsoonJr) - Desenvolvedor Back-End 🚀💻
- [Giovana de Andrade Lopes](https://github.com/glopes2003) - Desenvolvedora Front-End 🚀📱


## 📄 Licença
Este projeto está licenciado sob a licença MIT. Consulte o arquivo LICENSE para mais informações.

## 🎉 Agradecimentos
Agradecemos a todos os colegas e professores que colaboraram direta ou indiretamente no desenvolvimento deste projeto! 💡





