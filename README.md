# Vida em Dia

Um aplicativo web responsivo para organizar o cotidiano e abrir espaço para viver. Funciona sem conta no dispositivo e oferece conta opcional para sincronização privada entre dispositivos.

## O que já funciona

- Dashboard de hoje, próximos itens, conclusão e orçamento semanal de lazer.
- Tarefas com prazo, detalhes e conclusão.
- Refeições registradas com horários personalizáveis.
- Compromissos com data e hora.
- Consultas médicas com data, hora, local e profissional, sem exigir informações clínicas.
- Corridas com distância em quilômetros, duração em minutos e velocidade média calculada em km/h.
- Serviços com descrição, estimativa de valor e exportação CSV.
- Passeios, fins de semana e férias com custo estimado.
- Conta opcional por email e senha, com sincronização em Supabase e acesso privado por RLS.
- Exportação e importação de cópia JSON; modo local disponível sem conta.
- Interface em português, responsiva para desktop e celular.

## Ciência e limites

As orientações exibidas são gerais e remetem diretamente a documentos oficiais:

1. [Ministério da Saúde — Guia Alimentar para a População Brasileira](https://www.gov.br/saude/pt-br/assuntos/saude-brasil/publicacoes-para-promocao-a-saude/guia_alimentar_populacao_brasileira_2ed.pdf/view).
2. [Organização Mundial da Saúde — Healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet).
3. [Organização Mundial da Saúde — Guidelines on physical activity and sedentary behaviour](https://www.who.int/publications/i/item/9789240015128).

Não há recomendação de horários universais, cálculo de calorias, diagnóstico nem prescrição de dieta. Requisitos individuais precisam ser tratados com profissionais habilitados. Referências consultadas em 23/11/2026.

## Desenvolvimento

Requer Node.js 22.12 ou superior.

```sh
npm ci
cp .env.example .env
npm run dev
npm run build
```

O build estático fica em `dist/`. O deploy do GitHub Pages usa a URL e a chave **publishable** do Supabase (públicas por definição); nunca exponha uma chave `service_role`. A tabela `public.vida_em_dia_profiles` tem RLS para restringir leitura e escrita ao `auth.uid()` da conta. O SQL da migração está em `supabase/migrations/20261123_create_vida_em_dia_private_profiles.sql`.

No primeiro login, os registros locais são enviados à nuvem se a conta estiver vazia. Se a conta já tiver dados, os registros remotos são carregados; faça uma cópia JSON dos dados locais antes de entrar se quiser conservá-los. Alterações são salvas automaticamente e outras abas/dispositivos são atualizados ao voltar à janela ou em até 30 segundos. A versão atual detecta concorrência por número de revisão; em conflito, exporte a cópia antes de recarregar. O aplicativo não sincroniza offline ou mescla edições simultâneas automaticamente.

O cadastro pode exigir confirmação por email, conforme as configurações de Auth do projeto Supabase. Adicione a URL `https://brunnojob.github.io/vida-em-dia/` à lista de URLs de redirecionamento permitidas em Authentication → URL Configuration para que o link retorne ao aplicativo. Evite registrar diagnósticos ou resultados de exames; o JSON exportado não é criptografado.

## Próximos marcos

- Melhorar resolução de conflitos entre dispositivos e suporte a alterações offline.
- Agenda mensal com recorrência, conflitos e lembretes locais.
- Planejamento de refeições e compras com preferências alimentares explícitas.
- Controle de serviços com clientes, etapas, pagamentos e relatórios.
- Itinerários de viagem com reservas, checklist e divisão de orçamento.
- Testes de acessibilidade e revisão de segurança antes de armazenar dados de saúde em servidor.
