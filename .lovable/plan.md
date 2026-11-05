# Auditoria — Marketing semiautomatizado (Os Ressurgentes)

## Diagnóstico (verificado no código)
| Item | Estado |
|---|---|
| Formulário de leads | Não existe. Nenhum `<form>`, nenhum envio a servidor. |
| Destino dos leads | Só link direto para WhatsApp (`wa.me/5585996983300`), mensagem fixa. Nada é registrado. |
| Checkout | Não existe. Sem pagamento nem dependência de pagamento. |
| CTAs | 6 botões "Solicitar entrevista" → mesmo link WhatsApp (`CTA_URL`/`CONTACT_URL`, linhas 19–20 de `src/routes/index.tsx`). |
| Rastreio UTM | Nenhum. UTMs da URL são ignoradas e não chegam no WhatsApp. |
| Oferta turma mista (4 vagas, R$330, 28/11/2026) | Ausente. Nenhuma menção a preço, vagas, data ou "turma mista". |
| Privacidade / LGPD | Links "Política de privacidade" e "Termos de uso" apontam para `#` (vazios). Sem página, sem caixa de consentimento. Instagram também `#`. |
| CRM | Nenhum. Lovable Cloud não ativado, sem banco, sem integrações conectadas. |

Ponto de atenção: a página fala em "mentoria/comunidade para homens", mas a oferta é "turma mista" — precisa de decisão de texto.

## Arquivos a alterar/criar
- `src/routes/index.tsx` — seção de oferta, formulário, CTAs, links do rodapé.
- `src/routes/privacidade.tsx` e `src/routes/termos.tsx` — novas páginas.
- `src/lib/utm.ts` — captura e guarda UTMs na visita.
- Server function de envio do lead + tabela `leads` (requer Lovable Cloud).

## Plano mínimo em etapas
1. **Oferta**: bloco "Turma mista — lançamento 28/11/2026 · 4 vagas · R$330" acima da convocação final; ajustar copy masculina → decidir com você.
2. **UTM**: ler `utm_source/medium/campaign/content/term` + página de origem na chegada, guardar na sessão, anexar ao texto do WhatsApp.
3. **LGPD**: criar páginas de Privacidade e Termos (texto-base para revisão sua/jurídica), ligar no rodapé.
4. **Formulário real** (nome, WhatsApp, e-mail, motivo, caixa de consentimento obrigatória): salva no banco com UTMs e data, depois abre o WhatsApp. Exige ativar Lovable Cloud.
5. **Painel simples de leads** (opcional, com login) ou exportação CSV — base para CRM.
6. **Checkout** (opcional): link de pagamento (ex.: Stripe ou link Mercado Pago/Hotmart que você já tenha) no lugar do botão, só após confirmação da entrevista.
7. **CRM externo** (opcional): enviar o lead para HubSpot/RD/GoHighLevel via webhook — somente se você indicar qual e fornecer acesso.

## Decisões pendentes
- Copy: manter público masculino ou reescrever para turma mista?
- Formulário antes do WhatsApp, ou só WhatsApp com UTM?
- Checkout agora (qual meio?) ou só após entrevista?
- Quer aviso por e-mail a cada lead? (exige domínio verificado)
