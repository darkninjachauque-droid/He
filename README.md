# HelioTech - Salva Arquivos ZIP

Seu cofre pessoal seguro para armazenamento de arquivos ZIP importantes.

## 🚀 Como colocar no seu GitHub e Netlify

### 1. Preparar o GitHub
- Crie um novo repositório no seu GitHub chamado `heliotech-salva-arquivos`.
- No seu terminal, dentro da pasta do projeto, rode:
  ```bash
  git init
  git add .
  git commit -m "Primeira versão HelioTech"
  git branch -M main
  git remote add origin https://github.com/SEU_USUARIO/heliotech-salva-arquivos.git
  git push -u origin main
  ```

### 2. Configurar no Netlify
- Entre no Netlify e clique em **"Add new site"** -> **"Import from GitHub"**.
- Escolha o repositório `heliotech-salva-arquivos`.
- O Netlify vai detectar automaticamente que é um projeto Next.js.
- **Importante**: Vá em "Site settings" -> "Environment variables" e adicione as chaves do Firebase se quiser segurança extra, mas o código já tem os valores padrão que você configurou.

### 3. Usar seu Domínio Próprio
- No Netlify, vá em **"Domain management"**.
- Clique em **"Add custom domain"**.
- Digite `heliotech-salva-arquivos.com`.
- O Netlify vai te dar os endereços DNS para você colocar onde comprou o domínio.

---
Desenvolvido por HelioTech.
