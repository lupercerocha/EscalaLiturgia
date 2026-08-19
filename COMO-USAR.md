# T-Jet Sistema v2.0

Arquivo único, sem build e sem dependência de servidor. Os dados ficam no
`localStorage` do próprio aparelho.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O sistema inteiro |
| `manifest.json` | Instalação como app no Android |
| `sw.js` | Funcionamento offline |
| `icons/` | Ícones do app |
| `favicon.ico` + `favicon.svg` | Ícone da aba do navegador |

> **Leia o `LEIA-PRIMEIRO.md` antes de tudo** se você já usou uma versão anterior
> neste celular.

Os quatro precisam ficar **na mesma pasta**.

## Publicar no GitHub Pages

1. Crie um repositório e envie os arquivos mantendo a estrutura.
2. *Settings → Pages → Branch: main / (root)*.
3. Abra o endereço `https://SEUUSUARIO.github.io/REPO/` no celular.
4. Chrome → menu ⋮ → **Adicionar à tela inicial**.

> A câmera **só funciona em HTTPS**. GitHub Pages já é HTTPS.
> Abrindo o arquivo direto por `file://` a leitura de placa não abre a câmera —
> nesse caso use o botão "Digitar a placa".

## Leitura de placa

**A câmera abre sozinha assim que você entra na tela de Entrada.** Encaixe a placa
na moldura e toque no botão redondo — dois toques a menos por carro.

Se preferir digitar, o botão **Digitar a placa** fica logo abaixo do disparador.

O sistema é cuidadoso com isso: só abre quando o formulário está vazio. Se você
veio de um agendamento, de um orçamento ou já começou a preencher alguma coisa, a
câmera não atropela o atendimento. Se você fechar a câmera, ela não reabre na
volta imediata — só na próxima vez que você entrar na tela.

Para desligar de vez: **Admin → Configurações → Atendimento → "Abrir a câmera ao
entrar na tela"**.

Se a permissão da câmera estiver negada no aparelho, a abertura automática
simplesmente não acontece — nada de aviso no meio do caminho. Use o botão manual.

Tocando em **Fotografar placa** a qualquer momento a câmera também abre.
Encaixe a placa e toque no botão redondo.

O que acontece por baixo:

1. Recorta só a região da moldura (descarta o resto da cena);
2. Converte para escala de cinza, normaliza contraste e gera duas versões
   (uma binarizada por Otsu, outra só com contraste);
3. Passa as duas pelo OCR e cruza os resultados;
4. Corrige os erros clássicos **por posição** — nas três primeiras casas um `0`
   vira `O`, um `8` vira `B`; nas casas numéricas um `S` vira `5`, um `I` vira `1`;
5. Valida contra o padrão antigo (`ABC1234`) e o Mercosul (`ABC1D23`);
6. Mostra a placa para você confirmar — dá para corrigir na mão antes de seguir.

### As duas coisas que podem dar errado são diferentes

O sistema nunca mistura *"não consegui ler"* com *"não tem cadastro"*:

- **Não consegui ler a placa** — falha da foto. Aparece o aviso com a orientação
  (aproximar, evitar reflexo, manter reta) e, na segunda tentativa, o sistema
  sugere digitar. Nada foi consultado no cadastro ainda.
- **Placa sem cadastro** — a leitura funcionou. O sistema mostra a placa lida com
  o aviso *"Placa sem cadastro — a leitura funcionou, este veículo é que ainda não
  está no sistema"* e abre o **cadastro rápido**.

Quando a placa já existe, o cartão mostra **"Já é cliente"** com veículo, cor e
dono, e ao confirmar carrega tudo e pula direto para a escolha dos serviços.

### Cadastro rápido

Abre com a placa já preenchida e pede só três coisas: **nome, WhatsApp e
observações**. Salvou, o sistema devolve você para a entrada com os campos
preenchidos e o cursor no modelo.

O botão **"+ Completar cadastro (endereço)"** expande o endereço. Digite o CEP e
rua, bairro, cidade e UF vêm sozinhos — o cursor pula para o número. Se você
trocar o CEP, os campos que vieram automaticamente são substituídos; o que você
digitou à mão nunca é sobrescrito.

A busca usa o **ViaCEP** e, se ele estiver fora do ar, cai automaticamente para o
**BrasilAPI**. Sem internet, o aviso diz para preencher à mão e o cadastro segue
normal. CEP inexistente é informado sem preencher nada errado.

O endereço aparece na ficha do cliente e entra na busca — procurar por um bairro
lista todos os clientes daquela região.

A foto da placa fica anexada à OS.

> O motor de OCR (~4 MB) é baixado na primeira leitura e fica em cache. A partir
> daí funciona offline. A primeira leitura demora uns segundos; as seguintes são
> rápidas porque o worker é reaproveitado.

## Primeiro uso

O sistema começa **vazio**, só com o catálogo de 14 serviços e as formas de
pagamento. Ordem sugerida:

1. **Admin → Configurações**: nome do lava jato, meta do mês, horário, boxes,
   fidelidade e os textos do WhatsApp.
2. **Admin → Serviços**: ajuste os preços **por porte** (Moto a Pickup).
   Preço `0` significa "a combinar" — o sistema pergunta o valor na hora.
3. **Admin → Equipe**: quem lava e o percentual de comissão.
4. **Estoque**: cadastre os insumos e monte a *ficha técnica* de cada serviço.
   É isso que faz a margem aparecer nos indicadores e a baixa acontecer sozinha.
5. **Caixa → Abrir caixa** antes do primeiro atendimento do dia.

Quer ver os relatórios cheios antes de começar de verdade?
**Admin → Dados → Carregar demonstração** cria 45 dias de histórico fictício.
Depois use **Limpar todos os dados** para zerar mantendo serviços e configurações.

## Ciclo do dia

```
Abrir caixa → Entrada (placa/cadastro + vistoria + serviços)
   → Pátio (aguardando → lavando → secando → pronto)
   → Saída (conferência + pagamento + entrega)
   → Fechar caixa
```

Na entrega o sistema lança o recebimento no caixa, dá baixa nos insumos pela
ficha técnica, calcula a comissão do lavador, atualiza o histórico do cliente,
soma o selo de fidelidade e move a OS do pátio para o histórico.

## Backup

**Admin → Dados → Exportar backup** gera um `.json` com tudo. Guarde fora do
aparelho. Trocar de celular, limpar o navegador ou desinstalar o app **apaga os
dados** — o backup é a única rede de proteção. Faça um por semana.


## Indicadores

Seis painéis, todos respondendo aos mesmos filtros do topo — período (incluindo
intervalo escolhido a dedo), porte, marca, serviço, lavador e forma de pagamento.
A busca filtra as linhas de todos os rankings ao mesmo tempo.

| Painel | O que responde |
|---|---|
| **Visão** | Faturamento, ticket e margem contra o período anterior · meta do mês com projeção · tendência de 12 meses · recomendações separadas em operacional, tático e estratégico |
| **Vendas** | Faturamento por dia · quantidade por serviço · ranking de serviços com margem · pares vendidos juntos · ticket médio por porte |
| **Operação** | Tempo médio, % no prazo, carros/dia, receita por hora de box · entradas por hora · mapa de calor dia × faixa · produtividade da equipe · dia da semana |
| **Clientes** | Atendidos, novos, recorrentes, em risco · ranking · curva ABC · retenção em 30/60/90 dias · quem está sumindo · upsell · fidelidade |
| **Veículos** | Marcas, modelos, portes e cores mais atendidos · ticket por marca · % de porte grande |
| **Financeiro** | DRE do período · margem por serviço · insumos consumidos · formas de pagamento · contas a receber |

**Exportar CSV** gera uma linha por OS já com custo, comissão e margem calculados,
respeitando os filtros ativos — pronto para abrir no Excel.

### Como ler os três níveis de recomendação

- **Operacional** — o que resolver hoje: carro atrasado, pronto sem retirar, caixa fechado, insumo no limite.
- **Tático** — o que atacar na semana: cliente sumindo, orçamento sem resposta, revisão vencida, faixa ociosa.
- **Estratégico** — o que decidir no trimestre: dependência de lavagem simples, concentração de carteira, qual serviço realmente deixa dinheiro, retenção baixa.


## Base de veículos (FIPE)

O sistema traz **1.834 modelos de 200 marcas** embarcados — carros, comerciais e
motos —, derivados da tabela FIPE e já **classificados por porte**.

Digite duas letras no campo de modelo. Ao escolher na lista, o sistema preenche
marca, modelo e **marca o porte sozinho** — e os preços dos serviços já
selecionados são recalculados na hora para aquele porte.

```
"hilu"      → Toyota Hilux SW4 [SUV] · Toyota Hilux [Pickup]
"corolla cr"→ Toyota Corolla Cross [SUV]
"t-cro"     → Volkswagen T-Cross [SUV]
"cg 1"      → Honda CG [Moto]
```

### Por que a base é enxuta e não traz as 9.363 versões da FIPE

A FIPE lista cada motorização e acabamento: *"Civic Sedan EXL 2.0 Flex 16V Aut."*,
*"Civic Sedan EX 2.0 16V 156cv Aut."* e mais quarenta variações do mesmo carro.
Isso serve para avaliar preço de veículo — **não** para o balcão de um lava jato.

O que importa aqui é o **porte**, porque é ele que define o preço do serviço. Um
Civic é Médio em qualquer versão. Então a base foi consolidada em modelo-base:
9.363 versões viraram 1.834 modelos, e o arquivo pesa **14 KB** em vez de vários
megabytes. Funciona offline, é instantâneo e o atendente escolhe entre duas
opções em vez de quarenta.

### Se aparecer um carro fora da lista

Digite o modelo à mão e escolha o porte no chip. Funciona normalmente — a lista é
uma conveniência, não uma trava. Se for um carro que aparece sempre, cadastre o
serviço com o preço certo em **Admin → Serviços** e siga.

A base é estática: não depende de internet nem de API de terceiros, então não
quebra se o serviço externo sair do ar. Para atualizar com lançamentos novos,
é só me pedir uma base nova.


## Assinatura do cliente

Duas assinaturas por OS, colhidas com o dedo na tela:

**Na entrada** — dentro da vistoria, em *Aceite do cliente*. O termo é montado na
hora e lista as avarias marcadas: *"Declaro que acompanhei a vistoria do veículo
PBX 4C71 e que a avaria registrada abaixo já existia antes da entrada"*, seguida
de cada marcação (tipo, gravidade e descrição). Se nenhuma avaria foi encontrada,
o termo declara isso — o que também protege você.

**Na saída** — no painel de entrega, logo abaixo de **Quem está recebendo**.

Esse campo já vem com o nome do titular do cadastro. Se quem retira for outra
pessoa, escolha a relação — *Cônjuge, Familiar, Motorista, Funcionário, Outro* —
e o campo abre para você digitar o nome de quem está ali na sua frente.

O termo se ajusta sozinho:

> *"Eu, **João Pedro Lima**, na condição de **motorista** e retirando em nome de
> **Marina Souza**, declaro que recebi o veículo PBX 4C71, conferi o estado da
> lataria e o serviço executado, e que não há divergência em relação à vistoria
> feita na entrada."*

Seguido do total da OS e, se houver, do saldo em aberto. O cliente assina com o
dedo na tela do celular.

Fica registrado em três lugares: no selo da assinatura (*"recebeu como
motorista · em nome de Marina Souza"*), no histórico da OS (*"Recebimento
assinado por João Pedro Lima (motorista, em nome de Marina Souza)"*) e na ficha
da OS quando você consultar depois.

O sistema não deixa assinar sem o nome preenchido — assinatura de "alguém" não
protege ninguém.

O sistema **pede a assinatura de entrega antes de finalizar**. Dá para seguir sem
ela ("Entregar mesmo assim"), e nesse caso fica registrado no histórico da OS que
a entrega foi feita sem assinatura.

As duas ficam guardadas na OS e aparecem juntas ao consultar o histórico do
veículo — com nome de quem assinou, data e hora.

## Link de acompanhamento

No card do pátio, botão **Link**. Envia pelo WhatsApp ou copia para colar onde
quiser. O cliente abre no celular dele e vê uma página limpa com o status do
carro, a barra de progresso, os quatro passos (Recebido → Em lavagem → Secagem →
Pronto), a previsão de conclusão e os serviços contratados.

### O que esse link é — e o que ainda não é

O link carrega um **retrato do momento em que foi gerado**: placa, modelo,
serviços, hora de entrada e previsão de conclusão. A página calcula o progresso
pelo relógio do celular do cliente, então a barra anda sozinha e a previsão vai
diminuindo.

**Mas ele não sabe o que acontece depois.** Se o carro ficar pronto vinte minutos
antes, o cliente continua vendo "em lavagem". Se atrasar, a página avisa que
passou da previsão e pede paciência — sem inventar um horário novo.

Tempo real exige um servidor. Quando a base migrar para o Supabase, esse mesmo
link passa a consultar o status atual e o problema some. Até lá ele já resolve a
maior parte das ligações de "já tá pronto?", porque a maioria acontece **antes**
da previsão, não depois.

O link não expõe telefone, endereço, valores nem histórico do cliente — só o
necessário para acompanhar aquele serviço.


## Previsão de entrega

Toda entrada nasce com **1 hora a partir de agora**. É o padrão e já vem marcado —
não precisa tocar em nada.

Para mudar, toque no horário. As opções mostram:

- **o padrão** (1 hora), sempre em primeiro;
- **o tempo técnico**, calculado pelos serviços escolhidos e pela fila do pátio —
  útil quando o pátio está cheio e uma hora é otimista demais;
- horários de 30 em 30 minutos até o fechamento, com a folga de cada um.

## Quando algo não funciona

A partir da v2.7.0 o sistema é à prova de dependência externa. Antes, se a
biblioteca de arrastar não carregasse (internet instável, CDN bloqueado), **todo o
resto do script morria junto** — câmera, busca de veículo, notas, indicadores.

Agora cada parte é isolada: se a biblioteca de arrastar falhar, você perde apenas
o reordenar manual da fila. Todo o resto continua de pé, e o erro fica registrado
no diagnóstico.

Erros também são capturados e listados em **Admin → Dados → Diagnóstico**, com
horário e mensagem — em vez de o sistema simplesmente parar de responder sem
explicação.


## Layout no celular

A tela inicial é montada em ordens diferentes conforme o aparelho.

**No computador** (tela larga, com menu lateral) nada muda: cabe tudo na mesma
altura, e os indicadores no topo funcionam como painel de controle.

**No celular** a ordem se inverte, porque o polegar de quem está no balcão precisa
alcançar o que se usa a cada carro:

1. Saudação
2. **Entrada · Pátio · Saída · Caixa** — quatro cartões grandes em 2×2
3. Ponto de atenção
4. Indicadores, em faixa compacta de quatro colunas
5. Gestão, Negócio e Sistema

Os quatro cartões de operação ficam com o dobro da área de toque de antes. Os
indicadores continuam ali, só que como consulta rápida — o número segue visível,
a legenda secundária sai.

Em telas muito estreitas (abaixo de 360 px) a faixa de indicadores volta a duas
colunas, para o valor em reais não espremer.


## Confirmar a versão

Na tela inicial, ao lado da data, tem um selo pequeno: **v2.7.0**. É a forma mais
rápida de saber se o cache foi limpo — se mostrar outro número, você ainda está
na versão antiga.

Tocando nele abre o diagnóstico completo sem sair da tela: versão e build, se a
câmera está liberada, se o leitor de placa foi baixado, se a base de veículos
carregou, e os erros da sessão. Os botões **Copiar** e **Forçar atualização**
estão ali dentro.

O selo fica bem apagado no dia a dia. **Se algum erro acontecer, ele muda para
laranja** — é o único aviso de que vale a pena tocar ali.

## Tela inicial no celular

No celular a ordem é outra: **Operação primeiro, indicadores depois.**

```
BOM TRABALHO HOJE
┌───────────┬───────────┐
│  ENTRADA  │   PÁTIO   │   ← cards grandes, 2 por linha
├───────────┼───────────┤
│   SAÍDA   │   CAIXA   │
└───────────┴───────────┘
  ponto de atenção agora
  [ pátio ][ entreg ][ fatur ][ ticket ]   ← faixa fina
  Gestão · Negócio · Sistema
```

Os quatro módulos que a equipe usa o dia inteiro ganharam ícone maior, nome
legível e um fundo tingido com a cor de cada um. Os indicadores viraram uma faixa
de leitura rápida no lugar de quatro blocos com números gigantes — a informação
continua ali, só parou de ocupar meia tela para mostrar zero às oito da manhã.

Os grupos Gestão, Negócio e Sistema ficaram mais discretos, para não disputar
atenção com a operação.

**No computador nada mudou** — a tela larga comporta os indicadores em destaque
e é lá que você olha relatório. A troca de ordem e os tamanhos valem só abaixo de
700px de largura.


## Tela de entrada (v2.7.0)

- **Placa** sobe sempre em maiúsculo, mesmo digitando em minúsculo.
- **Modelo**: digite duas letras e escolha na lista. Marca, modelo e porte entram
  juntos, e os preços já lançados são recalculados.
- **Cor**: grade de quadrados coloridos, sem texto. O nome da cor escolhida
  aparece abaixo. O quadrado **+** abre um campo livre para cores fora da lista.
- **Fotos**: um espaço só. O próximo aparece quando você usar o primeiro.
- **Serviços**: o catálogo saiu da tela e virou o botão **Escolher serviços**.
  Abre um modal com busca, agrupado por tipo, mostrando preço e tempo de cada um.
  O botão mostra quantos você escolheu e o total.

## Mensagens do WhatsApp

`{cliente}` agora traz **nome e sobrenome**. Se em alguma mensagem você preferir
só o primeiro nome — mais informal —, use `{primeiro}`. Os dois funcionam, e você
edita os textos em **Admin → Configurações → Mensagens**.
