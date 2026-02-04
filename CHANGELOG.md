# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0] - 2024-02-03
### Adicionado
- **Auth System**: Login e Cadastro integrados com Supabase Auth.
- **Dashboard**: Listagem de mapas mentais, criação de novos projetos e exclusão.
- **Editor de Mindmap**: 
  - Canvas interativo usando React Flow.
  - Adição dinâmica de nós.
  - Edição de títulos e labels.
  - Conexões entre nós.
- **Persistence Layer**:
  - Autosave com debounce de 2 segundos.
  - Sistema de Snapshots (histórico de versões) para recuperação de dados.
  - Exportação de mindmap para arquivo JSON.
- **UI/UX (AntropIA Design System)**:
  - Tema dark "Apple-like" com tokens semânticos.
  - Tipografia Inter integrada.
  - Componentes responsivos e minimalistas.
- **Infraestrutura**:
  - Dockerfile para build multi-stage.
  - Docker Compose com Traefik pronto para VPS.
  - Scripts de migração SQL inicial.
