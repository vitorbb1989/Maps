# Instruções de Deploy (VPS + Docker + Traefik)

## Pré-requisitos
- Servidor VPS (DigitalOcean, AWS, etc.) com Docker e Docker Compose instalados.
- Domínio configurado apontando para o IP da VPS (opcional, mas recomendado).
- Variáveis de ambiente do Supabase (URL e ANON_KEY).

## Passo a Passo

1. **Preparar o Projeto na VPS**
   Clone o repositório ou copie os arquivos para a VPS.
   ```bash
   git clone <seu-repo> app
   cd app
   ```

2. **Configurar Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz (baseado no `.env` local) para que o build do Vite possa injetar as variáveis.
   > **Nota:** Como o Vite injeta variáveis em tempo de build, elas precisam estar disponíveis *durante* a construção da imagem Docker.

   Crie/Edite o `.env`:
   ```bash
   nano .env
   ```
   Conteúdo:
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_key_supabase
   ```

3. **Ajustar Domínio no Docker Compose**
   Edite o `docker-compose.yml` e altere a regra do Traefik para seu domínio.
   ```yaml
   - "traefik.http.routers.mindmap.rule=Host(`seu-dominio.com`)"
   ```

4. **Subir os Containers**
   Execute o comando:
   ```bash
   docker-compose up -d --build
   ```

5. **Verificar Deploy**
   - Acesse `http://seu-dominio.com` (ou o IP se manteve localhost/configuração padrão).
   - Verifique logs se algo der errado: `docker-compose logs -f app`

## Manutenção
- **Atualizar código:**
  ```bash
  git pull
  docker-compose up -d --build
  ```
- **Parar:**
  ```bash
  docker-compose down
  ```
