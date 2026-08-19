# Antes de qualquer coisa: force a atualização

Se você já abriu o T-Jet neste celular antes, **o navegador está te servindo a
versão antiga**. Foi isso que quebrou a leitura de placa e a busca de veículos —
as funções novas não estavam no arquivo que rodou aí.

## O que fazer agora

1. Suba **todos** os arquivos desta entrega para o GitHub Pages, substituindo os antigos.
2. No celular, abra o T-Jet.
3. Vá em **Admin → Dados → Forçar atualização**.
4. Confirme no rodapé da tela inicial: deve aparecer **v2.7.0**.

Se o botão não existir na tela, você ainda está na versão velha. Nesse caso:

- **Chrome Android**: ⋮ → Configurações → Privacidade → Limpar dados de navegação
  → escolha só *Imagens e arquivos em cache* → Limpar.
- **App instalado na tela inicial**: desinstale o ícone e instale de novo pelo navegador.
- **Teste rápido**: abra o endereço com `?v=1` no fim
  (`https://seuusuario.github.io/tjet/?v=1`). Isso ignora o cache.

A partir desta versão isso não acontece mais: o service worker foi reescrito para
**nunca** servir HTML velho quando há internet, e o app avisa sozinho quando
baixa uma versão nova.

## Se algo não responder

**Admin → Dados → Diagnóstico do sistema** mostra, em tempo real:

- qual versão está rodando;
- se a câmera está liberada (e se o endereço é HTTPS);
- se o leitor de placa foi baixado;
- se a base de veículos carregou (deve dizer 1.834 modelos);
- quantos erros aconteceram na sessão, com a mensagem de cada um.

O botão **Copiar diagnóstico** monta um texto com tudo isso mais o modelo do seu
celular. Cole numa mensagem para mim e eu vejo exatamente o que aconteceu, em vez
de adivinhar.

## Se a placa não for lida

A câmera abrir e não reconhecer **não é falta de cadastro** — é a leitura da foto
falhando. Agora o sistema diz qual dos dois casos é:

- *"Não enxerguei texto nenhum"* → aproxime até a placa preencher a moldura e
  melhore a luz;
- *"Li caracteres mas não formaram uma placa válida"* → está quase; firme o
  celular e mantenha a placa reta.

Depois de duas tentativas ele abre a digitação sozinho, para você não perder tempo.

Em **Admin → Dados → Diagnóstico** aparece a linha **Última leitura da câmera**
com exatamente o que o OCR enxergou em cada tentativa. Se estiver vindo vazio ou
saindo texto sem sentido, copie o diagnóstico e me mande — é o dado que preciso
para ajustar o pré-processamento da imagem.
