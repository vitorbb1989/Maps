# Mindmap AntropIA 🧠

MVP de mapeamento mental com identidade visual **AntropIA** (Apple-like, clean, dark).

## 🚀 Tecnologias
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS.
- **Canvas**: React Flow (gerenciamento de nós e conexões).
- **Backend**: Supabase (Auth & PostgreSQL).
- **Estado**: Zustand & React Router 7.
- **Infra**: Docker + Traefik (Pronto para VPS).

## 🛠️ Configuração Local

1. **Dependências**:
   ```bash
   npm install
   ```

2. **Variáveis de Ambiente**:
   O arquivo `.env` deve conter:
   ```env
   VITE_SUPABASE_URL=https://jzeqadbpsyumpohobdan.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_anon_key
   ```

3. **Banco de Dados**:
   Aplique o script em `supabase/migrations/20240101000000_init_schema.sql` no SQL Editor do seu projeto Supabase.

4. **Execução**:
   ```bash
   npm run dev
   ```

## 🏗️ Arquitetura
- **Autosave**: Implementado com debounce de 2 segundos. Salva o estado atual e gera um snapshot imutável no histórico.
- **Snapshots**: Permite restaurar versões anteriores do mapa mental através do painel lateral.
- **Design System**: Baseado em tokens semânticos definidos em `tailwind.config.js` e `index.css`.

## 🐳 Docker & Deploy
Para rodar via Docker localmente ou em VPS:
```bash
docker-compose up -d --build
```
A configuração inclui **Traefik** para gerenciamento de proxy e SSL.

---
Desenvolvido com foco em velocidade de prototipagem e solidez arquitetural.
