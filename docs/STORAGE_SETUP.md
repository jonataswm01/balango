# Configuração do Storage do Supabase

## Criar Bucket "avatars"

Para que o upload de imagens (logo e foto de perfil) funcione, você precisa criar o bucket `avatars` no Supabase Storage.

### Passos:

1. Acesse o Dashboard do Supabase
2. Vá em **Storage** no menu lateral
3. Clique em **New bucket**
4. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Marque como público (para permitir acesso às imagens)
   - **File size limit**: 5 MB (ou o valor que preferir)
   - **Allowed MIME types**: `image/*` (ou deixe vazio para permitir todos)

5. Clique em **Create bucket**

### Configurar Políticas RLS do Storage

Após criar o bucket, configure as políticas de acesso:

```sql
-- Permitir leitura pública de avatares
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Permitir atualização para o próprio usuário
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir deleção para o próprio usuário
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Estrutura de Pastas

O sistema usa a seguinte estrutura:
- `avatars/profiles/{user-id}-{timestamp}.jpg` - Fotos de perfil
- `avatars/logos/org-{user-id}-{timestamp}.jpg` - Logos de organizações

