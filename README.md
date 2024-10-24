<div align="center">
    <img src=".github/logo.png" alt="Logo" width="200" height="200">
    <h1>🗨️ nin0chat 🗨️</h1>
    <p>A chat application built with TypeScript, Fastify, and Postgres.</p>
</div>

---

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [License](#license)

## 🧐 About 

nin0chat is a chat service that allows users to create accounts, send messages, and view messages from other users. This project was built using TypeScript, Fastify, and Postgres. 

Thanks to all the contributors who helped make this project possible!

## Self-hosting

To get started with nin0chat, you will need to have the following installed on your machine:

- Node.js
- pnpm
- Postgres

Once you have the above installed, you can clone the repository and install the dependencies:

```bash
git clone https://github.com/nin0chat/rewrite.git
cd rewrite
pnpm install
```

After installing the dependencies, there will be a `config.example.ts` file in the root directory. You will need to copy this file to `config.ts` and fill in the necessary variables.

Once you have filled in the variables, you can run the following command to start the server:

```bash
pnpm dev
```

## 🎈 Usage

To use nin0chat, you can navigate to `http://localhost:3000` (or your specified host and port from your config file) in your browser. From there, you can create an account, log in, and start chatting with other users. 

## 📜 License

This project is licensed under the APGL-3.0 License - see the [LICENSE](LICENSE) file for details.