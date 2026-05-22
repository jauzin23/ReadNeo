# ReadNeo - Neofetch Profile Card

<div align="center">
  <img src="https://media.tenor.com/ijjz-HzDh_cAAAAM/matrix.gif" alt="Matrix Rain" />
</div>

**A zero-config GitHub Action that generates a dynamic, auto-updating Neofetch-style profile card for your README. Featuring custom ASCII art, automatic cache-busting, and live GitHub stats.**

This GitHub Action puts a Neofetch-style card directly on your profile. It's zero-setup and runs in your own repository using GitHub Actions.
## English

### Quick Start

All you have to do is create a file in your repository at `.github/workflows/neofetch.yml` with this exact code:

> **Note on ASCII Art:** For the best visual layout, we recommend using an ASCII art design that is roughly **800 characters** in total size and around **35 lines** tall. The Action will automatically trim empty padding, but keeping it within these dimensions ensures it aligns beautifully with the stats panel! You can load your ASCII art dynamically by creating a text file in your repo (e.g. `.github/ascii.txt`) and passing its path via the `ascii_path` variable.
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
      - uses: jauzin23/ReadNeo@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          # You can toggle any of these modules on or off
          ascii_path: ".github/ascii.txt" # Reads your custom ASCII art from a file in your repo
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
      - name: Bust Image Cache
        run: |
          sed -i -E "s/neofetch\.svg(\?v=[0-9]+)?/neofetch.svg?v=$(date +%s)/g" README.md
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

> **Nota sobre a Arte ASCII:** Para obteres o melhor resultado visual, recomendamos o uso de uma arte ASCII com cerca de **800 caracteres** no total e cerca de **35 linhas** de altura. O Action irá cortar automaticamente o espaço vazio, mas manter estas dimensões garante que a arte se alinha perfeitamente com o painel de estatísticas! Podes carregar a tua arte ASCII dinamicamente criando um ficheiro de texto no teu repositório (ex: `.github/ascii.txt`) e passando o caminho através da variável `ascii_path`.
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
      - uses: jauzin23/ReadNeo@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          # Podes ativar ou desativar qualquer um destes módulos
          lang: "pt" # Define o idioma para Português
          ascii_path: ".github/ascii.txt" # Lê a tua arte ASCII de um ficheiro de texto no repositório
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
      - name: Quebrar Cache da Imagem
        run: |
          sed -i -E "s/neofetch\.svg(\?v=[0-9]+)?/neofetch.svg?v=$(date +%s)/g" README.md
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
