# Auditoria de conexão GitHub (somente leitura)

## Evidências encontradas
- Remotos git do ambiente: apenas o armazenamento interno do Lovable (`origin` e `secondary`, ambos com o ID do projeto 406d1bb9…). Nenhum remoto aponta para github.com.
- Branch atual do ambiente: `edit/edt-…` (branch de edição interna), último commit "Substitui vídeo por versão fluida com cartela final incorporada".
- README: menciona GitHub só como texto genérico do template — não é prova de conexão.
- Não tenho acesso de leitura ao status do Git sync (fica em Configurações do projeto → Git). Portanto: **não há evidência de conexão com RichardFonteles/Os-Ressurgentes**, mas também não consigo confirmar a ausência.

## Ponto crítico
- O Git sync do Lovable **sempre cria um repositório novo**; não vincula um repositório já existente como `RichardFonteles/Os-Ressurgentes`.
- Ele sincroniza só **uma branch** (padrão `main`). A branch `lancamento/piloto-misto` (PR #1) só chega ao Lovable se for mesclada na branch sincronizada.

## Como verificar / conectar
1. Abra Configurações do projeto → Git (ou + → Projeto → GitHub) e veja se há repositório e branch listados.
2. Se não houver: conecte o GitHub → será criado um repo novo privado.
3. Para trazer o código de `Os-Ressurgentes`: copiar o conteúdo da branch desejada para o repo criado (push na branch sincronizada), ou baixar o ZIP e usar "Importar projeto" (gera outro projeto).
4. Se já estiver conectado a `Os-Ressurgentes`: mesclar o PR #1 na branch sincronizada (ou trocar a branch no seletor) para sincronizar.

Nenhuma alteração de código ou publicação será feita.
