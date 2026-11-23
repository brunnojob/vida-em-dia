# Vida em Dia

Um aplicativo web responsivo para organizar o cotidiano e abrir espaço para viver. A primeira versão funciona sem conta, API ou chaves pagas.

## O que já funciona

- Dashboard de hoje, próximos itens, conclusão e orçamento semanal de lazer.
- Tarefas com prazo, detalhes e conclusão.
- Refeições registradas com horários personalizáveis.
- Compromissos com data e hora.
- Consultas médicas com data, hora, local e profissional, sem exigir informações clínicas.
- Corridas com distância em quilômetros, duração em minutos e velocidade média calculada em km/h.
- Serviços com descrição, estimativa de valor e exportação CSV.
- Passeios, fins de semana e férias com custo estimado.
- Exportação e importação de cópia JSON; dados salvos no navegador.
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
npm run dev
npm run build
```

O build estático fica em `dist/` e pode ser publicado em hospedagem estática. O aplicativo guarda registros em `localStorage` do navegador; não há sincronização entre dispositivos nem lembretes automáticos nesta versão. Evite inserir diagnósticos e resultados de exames: as cópias JSON não são criptografadas. Exporte uma cópia periodicamente, especialmente antes de limpar dados do navegador.

## Próximos marcos

- Conta opcional com sincronização privada entre dispositivos.
- Agenda mensal com recorrência, conflitos e lembretes locais.
- Planejamento de refeições e compras com preferências alimentares explícitas.
- Controle de serviços com clientes, etapas, pagamentos e relatórios.
- Itinerários de viagem com reservas, checklist e divisão de orçamento.
- Testes de acessibilidade e revisão de segurança antes de armazenar dados de saúde em servidor.
