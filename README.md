# Trein-Final

App pessoal de transição (PWA mobile-first, 100% local).

## Quick start

```bash
npm install
npm run dev          # localhost:5173
npm run test         # Vitest
npm run build        # gera dist/
npm run preview      # preview do build em localhost:4173
```

## Instalar no celular (PWA)

App publicado em **https://arthur-sac.github.io/Treino-TF/**

### Primeira vez — ativar GitHub Pages

1. Vá pra: https://github.com/Arthur-SAC/Treino-TF/settings/pages
2. Em **Source**, selecione **GitHub Actions**
3. O deploy roda automaticamente em cada `git push origin main`. Acompanhe em https://github.com/Arthur-SAC/Treino-TF/actions

### Instalar no celular

1. Abra https://arthur-sac.github.io/Treino-TF/ no **Chrome do Android**
2. Toque no menu **⋮** → **"Instalar app"** ou **"Adicionar à tela inicial"**
3. Aparece como ícone na tela inicial — abre em fullscreen, funciona offline, notificações ativas

### Adicionar à lista "não otimizar bateria"

Pra notificações chegarem no horário certo:
- Android puro: Configurações → Apps → Trein-Final → Bateria → Sem restrições
- Xiaomi/MIUI: Configurações → Bateria → Otimização de bateria → Trein-Final → Sem restrições + Configurações → Apps gerenciados → Trein-Final → Autoinício

## Stack

React 18 + TypeScript + Vite + Tailwind CSS + Dexie.js + React Router 7 + vite-plugin-pwa + Vitest.

## Estrutura

Veja o [plano de implementação](docs/superpowers/plans/2026-05-26-onda-1-parte-1-fundacao-corpo.md) e o [spec](docs/superpowers/specs/2026-05-26-app-transicao-design.md).

## Status

- **Onda 1:** ✅ Concluída
- **Onda 2:** ✅ Concluída (Pele&Cabelo + Estilo + Trilha)
- **Onda 3:** ✅ Concluída — Movimento
- **Onda 4:** ✅ Concluída — Maquiagem + Polimento

App está pronto pra uso diário. Suporta todos os pilares da transição.
