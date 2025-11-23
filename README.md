# SIGEG-BV - Sistema de Gestão de Grupos

## Project info

**URL**: https://lovable.dev/projects/17a7840a-c2cf-47f0-a644-de9e03b44677

## 🔄 Atualizações e Cache do Navegador

### Hard Refresh (Atualização Forçada)

Quando o aplicativo é atualizado, pode ser necessário fazer um **hard refresh** para ver as mudanças mais recentes:

#### Chrome / Edge / Brave (Windows/Linux):
- Pressione `Ctrl + Shift + R` ou `Ctrl + F5`
- Ou: `Shift + F5`

#### Chrome / Edge (Mac):
- Pressione `Cmd + Shift + R`

#### Firefox (Windows/Linux):
- Pressione `Ctrl + Shift + R` ou `Ctrl + F5`

#### Firefox (Mac):
- Pressione `Cmd + Shift + R`

#### Safari (Mac):
- Pressione `Cmd + Option + R`
- Ou: Mantenha `Shift` pressionado e clique no botão Recarregar

#### Mobile (Chrome/Safari):
1. Abra as configurações do navegador
2. Encontre "Limpar dados de navegação" ou "Limpar histórico"
3. Selecione "Imagens e arquivos em cache"
4. Limpe e recarregue a página

### Por que isso é necessário?

O navegador armazena versões antigas de arquivos (cache) para carregar o site mais rápido. Após uma atualização, um hard refresh força o navegador a baixar os arquivos mais recentes do servidor.

**Nota:** Após fazer o deploy de atualizações no Lovable, aguarde 1-2 minutos antes de fazer o hard refresh.

## 📱 PWA - Progressive Web App

Este aplicativo pode ser instalado em dispositivos móveis e desktop:

### Android / Chrome:
1. Abra o site no Chrome
2. Toque no menu (⋮) > "Adicionar à tela inicial"
3. O app será instalado como **SIGEG-BV**

### iOS / Safari:
1. Abra o site no Safari
2. Toque no botão Compartilhar
3. Selecione "Adicionar à Tela de Início"
4. O app será instalado como **SIGEG-BV**

### Desktop (Chrome/Edge):
1. Abra o site
2. Clique no ícone de instalação (⊕) na barra de endereços
3. Ou vá em Menu > "Instalar SIGEG-BV"

**Recursos do PWA:**
- ✅ Funciona offline
- ✅ Responsivo (adapta-se automaticamente ao tamanho da tela do dispositivo)
- ✅ Ícone personalizado na tela inicial
- ✅ Abre como um aplicativo nativo

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/17a7840a-c2cf-47f0-a644-de9e03b44677) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- PWA (Progressive Web App)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/17a7840a-c2cf-47f0-a644-de9e03b44677) and click on Share -> Publish.

**Important:**
- **Frontend changes** (UI, styles, client-side code) require clicking "Update" in the publish dialog
- **Backend changes** (edge functions, database migrations) deploy automatically

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

**Note:** A paid Lovable plan is required for custom domains.
