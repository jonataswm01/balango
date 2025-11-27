# balango-v3

Projeto criado a partir da basejota.

## 🚀 Como começar

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione suas credenciais do Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase

3. Execute as migrações do Supabase (se necessário):
```bash
# Configure o Supabase CLI e execute:
supabase db push
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📚 Estrutura do Projeto

- `app/`: Páginas e rotas do Next.js
- `components/`: Componentes React reutilizáveis
- `lib/`: Utilitários e configurações
- `supabase/`: Migrações do banco de dados

## 🛠️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a build de produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter
