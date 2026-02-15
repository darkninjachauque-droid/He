# HelioTech - Salva Arquivos ZIP

Seu cofre pessoal seguro para armazenamento de arquivos ZIP importantes.

## 🛠️ Como mudar o Nome e Logo no Google (Tela de Login)

Se o Google estiver mostrando "studio-..." em vez de "HelioTech", siga estes passos:

1. **Acesse o Console do Google Cloud**:
   Vá para [https://console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)
2. **Selecione seu Projeto**:
   No topo, certifique-se de que está no projeto correto.
3. **Clique em "Editar App"**:
   - Mude o **Nome do App** para `HelioTech`.
   - No campo **Logotipo do app**, envie sua imagem (recomendado 120x120px).
   - Coloque seu e-mail em **E-mail de suporte**.
4. **Salve**:
   Vá até o fim da página e clique em **Salvar e Continuar**.

---

## 🚀 Como colocar no seu GitHub e Netlify

### 1. Preparar o GitHub
- Crie um novo repositório no seu GitHub chamado `heliotech-salva-arquivos`.
- No seu terminal, dentro da pasta do projeto, rode:
  ```bash
  git init
  git add .
  git commit -m "Versão Profissional HelioTech"
  git branch -M main
  git remote add origin https://github.com/SEU_USUARIO/heliotech-salva-arquivos.git
  git push -u origin main
  ```

### 2. Configurar no Netlify
- O Netlify vai detectar automaticamente o projeto Next.js.
- **Importante**: Vá em "Site settings" -> "Domain management" e adicione seu domínio próprio se tiver.

### 3. Autorizar Domínio no Firebase
- Vá no [Console do Firebase](https://console.firebase.google.com/) -> Authentication -> Settings -> Authorized Domains.
- Adicione o link do seu site da Netlify lá para o login funcionar.

---
Desenvolvido por HelioTech.
