# Neofetch Profile Card

Hey there! Want to make your GitHub profile README stand out without hosting a server, writing complex API scripts, or paying for anything?

This GitHub Action puts a Neofetch-style card directly on your profile. It's zero-setup and runs in your own repository using GitHub Actions.

## English

### Quick Start

All you have to do is create a file in your repository at `.github/workflows/neofetch.yml` with this exact code:

```yaml
name: Generate Neofetch Card
on:
  schedule:
    - cron: "0 0 * * *" # Updates your stats every day
  workflow_dispatch: # Lets you trigger it manually anytime

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: jauzin23/ReadNeo@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          # You can toggle any of these modules on or off
          os: "Windows 11"
          ide: "VS Code"
          show_os: "true"
          show_uptime: "true"
          show_ide: "true"
          show_languages: "true"
          show_repos: "true"
          show_stars: "true"
          show_stars: "true"
          show_commits: "true"
          show_followers: "true"
      - name: Commit and push changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: Update Neofetch card
```

Once that runs, just drop this line into your `README.md`:

```markdown
![Neofetch Profile](./neofetch.svg)
```

Boom! You're done.

### Previews

Here is what the default setup looks like:

**[PLACE SCREENSHOT OF THE DEFAULT DRACULA THEME HERE]**

And here is one with custom ASCII art and colors:

**[PLACE SCREENSHOT OF A CUSTOM ASCII ART HERE]**

---

## Português (Portugal)

### Como usar

Este repositório tem um GitHub Action que cria um card de terminal top, estilo Neofetch, no teu perfil.

Basta criares um ficheiro no teu repositório em `.github/workflows/neofetch.yml` com este código:

```yaml
name: Gerar Cartão Neofetch
on:
  schedule:
    - cron: "0 0 * * *" # Atualiza as estatísticas todos os dias
  workflow_dispatch: # Permite atualizar manualmente quando quiseres

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: jauzin23/ReadNeo@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          # Podes ativar ou desativar qualquer um destes módulos
          os: "Windows 11"
          ide: "VS Code"
          show_os: "true"
          show_uptime: "true"
          show_ide: "true"
          show_languages: "true"
          show_repos: "true"
          show_stars: "true"
          show_stars: "true"
          show_commits: "true"
          show_followers: "true"
      - name: Commit and push changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: Update Neofetch card
```

Depois de correr, adiciona esta linha ao teu `README.md`:

```markdown
![Perfil Neofetch](./neofetch.svg)
```

Feito!

### Exemplos

Aqui tens o aspeto da configuração padrão:

**[COLOCAR CAPTURA DE ECRÃ DO TEMA DRACULA PADRÃO AQUI]**

E aqui está um com arte ASCII e cores personalizadas:

**[COLOCAR CAPTURA DE ECRÃ DE UMA ARTE ASCII PERSONALIZADA AQUI]**
