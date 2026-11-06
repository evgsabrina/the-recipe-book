# The Recipe Book — Cloudflare Pages + D1

## O que está configurado
- Site público em `public/index.html`.
- Receitas criadas pela administração salvas no Cloudflare D1 e exibidas publicamente.
- Área administrativa em `/admin`, com senha verificada no servidor e cookie HttpOnly.
- Visitantes não veem o atalho de cadastro e não podem criar/excluir receitas pela API.
- Receitas iniciais que já estavam no HTML foram preservadas.

## Antes de publicar
1. Crie um repositório GitHub e envie todos os arquivos/pastas deste projeto.
2. No Cloudflare, crie um banco D1 chamado `the-recipe-book-db`.
3. Copie o `database_id` exibido pelo Cloudflare e substitua `PREENCHER_COM_O_ID_DO_D1` em `wrangler.toml`.
4. No terminal, na pasta do projeto, execute:
   ```bash
   npx wrangler d1 migrations apply the-recipe-book-db --remote
   ```
5. No Cloudflare Pages, conecte o repositório GitHub. Build command: deixe vazio. Build output directory: `public`.
6. Em Pages > Settings > Variables and Secrets, configure:
   - `ADMIN_PASSWORD`: uma senha forte para sua área administrativa.
   - `AUTH_SECRET`: uma chave aleatória longa (mínimo 32 caracteres).
   - Binding D1: variável `DB`, vinculada ao banco `the-recipe-book-db`.
7. Faça um novo deploy.
8. Acesse `https://SEU-DOMINIO/admin` para entrar e cadastrar receitas.

## Observações importantes
- O banco guarda os dados estruturados e imagens que forem incluídas no cadastro como parte do conteúdo da receita. Para uso intenso com fotos/vídeos, o próximo aprimoramento recomendado é integrar Cloudflare R2 e enviar os arquivos para lá; esta versão limita o payload por receita a aproximadamente 1,5 MB.
- Favoritos e capas personalizadas continuam locais no navegador de cada visitante; receitas cadastradas são compartilhadas via D1.
- Não coloque senhas no código nem no GitHub. Configure-as somente como Secrets/Variables no painel Cloudflare.
- A área administrativa usa HTTPS e cookie HttpOnly. Defina `AUTH_SECRET` como segredo privado.
