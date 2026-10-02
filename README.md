# Doce Sabor Ivoti

Site da **Padaria e Confeitaria Doce Sabor** — Av. Presidente Lucena, 1983,
bairro Harmonia, Ivoti/RS.

HTML, CSS e JavaScript puros, sem build e sem dependência externa. O
`index.html` fica na raiz: abre com dois cliques e funciona em qualquer
hospedagem estática.

```
index.html        página única
404.html          página de erro do GitHub Pages, com link de volta
                  (usa <base> porque o Pages a serve em qualquer caminho)
style.css         estilos e as cinco @font-face
script.js         menu, ampliação de foto, selo de horário e animações
favicon.png
site.webmanifest  instalação como app no celular
robots.txt
sitemap.xml
assets/           fotos reais, logo, ícones, fontes WOFF2 e imagem de
                  compartilhamento
ferramentas/      gera-logo-topo.py: refaz assets/logo-topo.png a partir da
                  logo oficial (requer Pillow); não entra na página
PRODUCT.md        briefing do produto
```

## Estrutura

A página segue o padrão das redes grandes de cafeteria e padaria:

1. **Barra de utilidade** — "aberto agora", endereço e telefone, sempre no topo
   (no celular, numa linha só).
2. **Topo de vidro**: logo, navegação com a seção em leitura marcada e o botão
   de WhatsApp. Papel com a linha fina de sempre no alto da página; vira vidro
   translúcido só quando gruda e há conteúdo passando por baixo. No celular, o
   menu abre como bandeja, com cortina, e prende o Tab enquanto está aberto.
3. **Hero de largura total** com a foto das cucas, chamada, duas ações, o selo
   da nota e o crédito da foto. No celular a foto vem primeiro.
4. **A casa em números**: notas, posição no Tripadvisor, prêmios e horário.
   Só dados conferidos em fonte pública.
5. **Menu** — o café colonial em destaque, de ponta a ponta; padaria e
   confeitaria lado a lado, cada uma com a foto ao lado do texto e o selo do
   prêmio de 2024 da própria categoria. Toda foto tem a etiqueta de origem.
6. **Encomendas** — os três passos, os dois canais e atalhos por ocasião que
   abrem o WhatsApp com a mensagem pronta.
7. **Prêmios** numa faixa escura, com os três títulos de 2024.
8. **Nossa casa** — a história, desde 1999.
9. **Rota Romântica** — por que a casa está no caminho de quem viaja, com a
    linha das 14 cidades e Ivoti marcada.
10. **Avaliações** — Google, Tripadvisor e o convite para avaliar.
11. **Fotos e novidades** — publicações reais do Instagram e do Facebook (no
    celular, em fileiras com botões de anterior e próximo).
12. **Perguntas frequentes** — cinco respostas, em `<details>` nativo.
13. **Visite** — mapa, endereço, horário com relógio na hora de Ivoti e as
    ações de contato num bloco só.
14. **Rodapé largo** em quatro colunas, aberto pela assinatura "Café com gosto
    de casa." sob um telhado de enxaimel, a trama das casas de Ivoti.

No celular, WhatsApp e "Como chegar" ficam numa cápsula flutuante, que sobe
quando os botões do hero começam a sumir sob a barra: nunca há trecho sem
botão de ação, e botão quase transparente não recebe toque.

## O que está ligado

| Recurso | Onde |
|---|---|
| Mapa do Google embutido | seção Visite |
| Ficha do Google (avaliações) | cartão "Google" e link "Ver ficha no Google" |
| Avaliar no Google | botão no cartão amarelo "Sua vez" |
| Tripadvisor | cartão ao lado do Google |
| Instagram | seis publicações embutidas (três do feed, três reels), cabeçalho e rodapé |
| Facebook | linha do tempo ao vivo, cabeçalho e rodapé |
| Traçar rota | hero, seção Visite e barra fixa do celular |
| Waze | seção Visite |
| WhatsApp | topo, menu, Facebook, Visite e barra fixa do celular |
| Telefone | barra de utilidade, menu do celular, Visite e rodapé |
| Aberto agora / fechado | três selos calculados da tabela de horários, no fuso de Ivoti |
| Mensagem pronta no WhatsApp | botão de Encomendas, atalhos por ocasião e quadro do Facebook |
| Seção em leitura marcada | navegação do topo e menu do celular |

As perguntas frequentes também saem como `schema.org/FAQPage`, que é o que
faz o Google mostrar as perguntas direto na busca.

Sobre as respostas: só entrou o que dá para sustentar. Horário, endereço,
canais de encomenda e o que é café colonial são verificáveis. Pergunta que
eu não sabia responder de verdade ficou de fora.

Também configurados: dados estruturados `schema.org/Bakery` (endereço,
telefone, horários, prêmios, mapa e perfis), Open Graph com imagem
própria, manifest, robots, sitemap com data, página 404, pré-carregamento da
foto de abertura e DNS antecipado para Instagram, Facebook e Google.

O selo "aberto agora" calcula no **horário de Ivoti** (America/Sao_Paulo),
não no do visitante — quem olha de outro fuso vê o estado real da casa.

## Fotos e redes sociais

Cada fotografia aparece **uma única vez**. São quatro imagens reais:
`cucas` é o fundo do hero, e `buffet`, `casa-real` e `confeitaria` são as
fotos dos três cartões do menu. Repetir uma foto em duas seções faz o site
parecer montado por robô.

Cada foto do menu mostra embaixo uma etiqueta (`.dish-credit`) com o mesmo
texto do `data-caption`: de onde veio e que tratamento recebeu.

As fotos do balcão e da confeitaria têm só 666 px de largura. Por isso ficam
lado a lado na linha de baixo do menu, com no máximo ~470 px na tela: numa
tela de densidade 2x, nenhuma foto do menu é ampliada mais que 1,4x. Foto nova
para o menu precisa de pelo menos 700 px de largura.

Para acrescentar um item ao menu: coloque a foto em `assets/` (de preferência
`.webp`) e copie um bloco `<article class="dish">` no `index.html`, sem a
classe `dish--feature`, trocando `src`, `alt`, `data-photo`, `data-caption`, a
etiqueta, a categoria, o nome e a lista. O selo `.dish-award` só entra se houver
prêmio conferido. A ampliação ao clique já funciona sozinha.

A logo do topo é `assets/logo-topo.png`: o mesmo desenho de `logo-oficial.jpg`,
recortado e com fundo transparente, porque sobre o vidro o JPG mostrava a caixa
branca. As duas tintas saem do miolo sólido da própria logo (marrom `#603610`,
rosa `#d01d41`), com alfa cheio dentro das letras; 4,5 KB. Para refazer, depois
de trocar a logo oficial: `python3 ferramentas/gera-logo-topo.py .` (requer
Pillow). `--confere` compara o PNG sobre o papel com o JPG: Delta E médio 1,0
no marrom e 0,5 no rosa (abaixo de 2, a diferença não se vê). Rodapé e página
404 continuam com o JPG.

O feed do **Facebook** é o plugin oficial da página e se atualiza sozinho: o
que a equipe postar aparece ali sem ninguém mexer no site.

Do **Instagram** (@docesaborivoti) a seção traz seis publicações reais —
três do feed e três reels —,
embutidas pelo recurso oficial `.../p/CODIGO/embed` — gratuito e sem token.
Elas são fixas: para trocar, substitua os códigos em `.ig-post iframe` e
`.reel-post iframe` no `index.html`. Os códigos atuais são `Dbf_5jQCZcc`,
`DBOlZ7gMIoE` e `DLfYNy6T6G8` (feed) e `DGBcKmetGy_`, `DG0zEr8JA1o` e
`DEp2kk8sWYR` (reels).

As publicações carregam no navegador de quem visita, direto do Instagram —
por isso são a forma mais barata de ter muita foto real na página sem
guardar arquivo nenhum no repositório.

Um feed do Instagram que se atualiza sozinho não existe de graça: o Meta só
oferece isso pela Graph API com token renovável, ou por serviço de terceiro
(LightWidget, SnapWidget, Elfsight), que envolve conta externa e às vezes
mensalidade.

## Peso da página

Primeira visita em desktop, do jeito que o GitHub Pages entrega (HTML, CSS e
JS comprimidos): **663 KB**, 6 KB a mais que antes do redesenho (657 KB). Em
bytes crus, 753 KB contra 703 KB — e 1.502 KB antes da limpeza. O acréscimo é
só texto (o CSS e o JS do novo acabamento); nenhuma imagem, fonte ou biblioteca
nova, e o topo trocou o JPG de 11 KB por `logo-topo.png`, de 4,5 KB. Teto
combinado: até 15 KB acima de antes, medido comprimido.

O `style.css` bloqueia a primeira pintura, então cada KB dele conta: os
comentários longos saíram do CSS e do script para as "Notas de manutenção",
no fim deste arquivo, e o `style.css` comprimido caiu de 18 para 13,4 KB.

| O que mudou | Ganho |
|---|---|
| Nove TTF completos viraram cinco WOFF2 com subconjunto latino | 611 KB → 74 KB |
| A foto dentro do diálogo fechado baixava em toda visita | −259 KB |
| `og.png` virou JPEG | 739 KB → 115 KB no repositório |
| `favicon.jpg` era byte a byte a logo de 720px, baixada duas vezes | −13 KB |
| Degrau de 1200px no hero, que só tinha 800 e 1536 | −150 KB em celular 3x |
| `sizes` das fotos do menu pedia quase o dobro do slot real | −139 KB em desktop 2x |

O Playfair 600 e o 400 normais foram colapsados no 500: apareciam em um selo
e numa citação, onde a diferença não se vê, e cada face solta custava mais de
120 KB. Sobraram DM Sans 400/600/700 e Playfair 500 normal e itálico.

## Dados: o que é verificado e o que não é

Verificado em fonte pública:

- **4,5 no Google** — confirmado na ficha pública.
- **4,3 no Tripadvisor, 86 avaliações, 2º entre 26 restaurantes de Ivoti** —
  confirmado no Tripadvisor.
- **Endereço e CEP** — Av. Presidente Lucena, 1983, Harmonia, 93900-000.
- **Prêmios 2024** — Os Melhores da Gastronomia, VIPS DO SUL, Ivoti: a casa
  foi eleita melhor confeitaria, melhor padaria e melhor mini café colonial de
  Ivoti. O cartão do café colonial dizia "Três vezes premiado em 2024", como se
  os três prêmios fossem dele; agora diz "A casa foi eleita o melhor mini café
  colonial de Ivoti em 2024" (ver o item 6 abaixo).

**Não verificado — confirme antes de divulgar:**

1. **"2.343 avaliações"** (primeira dobra e cartão do Google). Esse número
   veio da ficha que foi passada para quem montou o site, não de uma fonte
   que eu pudesse conferir. Confira no perfil e ajuste os dois textos do
   `index.html` (selo do hero e cartão do Google). A nota não vai para o
   bloco `application/ld+json`: o Google não aceita, em dado estruturado da
   própria empresa, nota agregada vinda de outro site.
2. **Horários** — agora **7h às 20h, todos os dias**, conforme a bio do
   próprio Instagram da casa. Antes o site dizia 7h30–21h30, que veio de
   agregador. Para corrigir, mexa só na tabela `.hours-table` do
   `index.html`: o selo "aberto agora" (topo, menu do celular e seção de
   horários) acompanha sozinho. O `openingHoursSpecification` do JSON-LD
   precisa ser ajustado à mão para bater.
3. **"desde 1999"**, no hero, na seção Nossa casa e no rodapé.
4. **Telefone** (51) 98037-5842, usado em `wa.me/5551980375842` e `tel:`.
5. **Ordem das 14 cidades da Rota Romântica** (linha da seção Rota). A lista e
   a ordem vieram de guias de viagem e da Wikipédia, não da fonte oficial.
   Confira em rotaromantica.com.br e ajuste o `<ol class="route-line">` no
   `index.html`.
6. **A qual produto cada prêmio se refere.** A VIPS DO SUL premia a casa nas
   categorias melhor padaria, melhor confeitaria e melhor mini café colonial,
   sem citar produto nem foto. Por isso os selos "Melhor padaria de Ivoti ·
   2024" e "Melhor confeitaria de Ivoti · 2024" ficam no texto dos cartões de
   mesmo nome, nunca sobre a foto, e o cartão do café colonial não tem selo:
   nada nas fontes liga o "mini café colonial" ao buffet fotografado. Se a
   casa confirmar que é o buffet, o selo pode voltar àquele cartão.
7. **Origem da foto do balcão** (`casa-real`). O crédito — Kátia Della Tôrres
   para a VIPS DO SUL, edição de 2021 — vem dos créditos da primeira versão
   deste site, que apontavam para
   `vipsdosul.com.br/site/index.php/edicoes-686` (o arquivo original se
   chamava `doce-sabor-2021.jpg`). Não foi reconferido agora: o site da VIPS
   DO SUL não abre daqui. Se não bater, tire o crédito da etiqueta, do
   `data-caption` e do diálogo "Fotos e fontes".
8. **Café colonial por encomenda.** O buffet de café colonial servido na casa
   é conferido (e premiado); que ele também saia por encomenda não foi. Está
   no título de Encomendas, no atalho "Café colonial" e no quadro do Facebook,
   sempre com a ressalva de que a equipe confirma disponibilidade. Se a casa
   não fizer, tire os três. A "bandeja", que aparecia ali sem fonte nenhuma,
   já saiu: o campo da mensagem pronta agora é só "O que vai ser:".
9. **Depoimento de Carla Costa** (seção Avaliações). Veio da primeira versão
   do site, tirado da ficha do Google Maps passada para quem montou a página,
   como o total do item 1. Não foi reconferido: confira na ficha do Google e,
   se não estiver mais lá, troque ou tire a citação.

## Movimento

Cada animação tem um porquê e mexe em `transform` (translate, scale, rotate)
ou `opacity`, que rodam no compositor. Exceções conscientes, curtas ou presas
à rolagem: `clip-path` na bandeja do menu do celular (escala distorceria os
links), `background-size` no marca-texto do período do dia,
`background-position` na citação que enche com a rolagem, `block-size` na
abertura do FAQ (onde há `::details-content`) e `filter` (desfoque de 2 px) na
troca do ícone do botão do menu. Recorte que anima tem as duas pontas em
`inset()`: entre `none` e `inset()` o navegador salta em vez de animar.

Ação de teclado não anima: Esc fecha menu e diálogos na hora; pelo teclado, o
botão do menu, os links dele, "Fotos e fontes" e as perguntas abrem e fecham
sem transição; abrir a foto pelo teclado é só um esmaecer de 150 ms; e o Tab
rola a página sem deslizar.
Com "reduzir movimento", deslocamento vira opacidade (menos e mais suave, não
zero). Os efeitos ligados à rolagem (citação e sumiço do texto do
hero) só existem onde o navegador suporta; nos outros, o estado parado já é o
final.

Recusado de propósito, para uma próxima rodada não trazer de volta:

- contagem progressiva nos números (mostraria notas falsas no caminho);
- paralaxe, deriva ou movimento contínuo na foto do hero (ela só assenta 3%
  na carga, uma vez, e nunca muda de opacidade);
- qualquer faixa ou letreiro de produtos correndo de lado, sozinho ou com a
  rolagem: o dono pediu para tirar a fita de sabores porque parecia robô;
- pulso infinito no "aberto agora" (o anel sai uma vez, só na barra de cima);
- topo que encolhe ou some na rolagem, e cápsula que some;
- efeito que segue o cursor e brilho piscando nos embeds;
- citação quebrada palavra por palavra;
- destaque animado no "1999" e anel de texto no selo: dariam ênfase a dados
  não verificados.

## Notas de manutenção

O CSS e o script vão para o ar como estão, sem build: por isso carregam só
comentários curtos, e o porquê de cada escolha mora aqui.

### Folha de estilo

- **Fontes.** Só as cinco faces da lista; pedir Playfair acima de 500 ou DM
  Sans em itálico faz o navegador sintetizar. Número de dado (faixa de
  números, notas, ficha da Rota) é DM Sans 600: o Playfair do subconjunto só
  tem algarismos de estilo antigo, que sobem e descem.
- **Cores e raios.** Toda cor é variável no `:root`. `--muted` era `#7b6960`,
  que reprovava no blush (4,37:1); `#6b5950` dá 5,6:1. `--ph-*` é o tom médio
  de cada foto, mostrado enquanto ela carrega. Faixas de ponta a ponta (hero,
  faixa dos prêmios, Visite, rodapé) ficam retas. O "E" em camadas da logo
  (`--layers-*`) e a trama enxaimel (`--enxaimel`) são ornamentos de Ivoti,
  não enfeite para tirar.
- **Gutter.** `--gutter` nunca fica menor que a área segura do iPhone deitado
  (`viewport-fit=cover`); fora do iPhone, `env()` vale 0. `.utility-inner` e
  `.hero-inner` levam o gutter no próprio box, para a borda esquerda cair no
  mesmo x das seções. Nas grades, `minmax(0,1fr)` e não `1fr`: coluna `1fr`
  não encolhe abaixo do conteúdo, e um rótulo longo alargava a página a 320px.
- **Toque e foco.** Botão, chip, seta e cápsula afundam (.97 em 100 ms, soltam
  em 160 ms); texto que se toca (links, perguntas, menu, rodapé, barra de
  utilidade) responde por opacidade, porque o tap highlight está desligado. Um
  ouvinte de toque no documento faz o Safari do iPhone aplicar `:active`. Os
  alvos têm 44px: os links do topo com folga de 4px devolvida pela margem
  negativa, as linhas do rodapé com 40px (44 no celular). Cada container escuro
  declara o próprio `--focus`. O anel de foco da barra de utilidade fica dentro
  dela: fora, o topo da tela e a barra grudada o cortavam. Navegando pelo
  teclado, a página pula na hora (`html:has(:focus-visible)`); o clique desliza.
- **Topo.** Em repouso, papel com a linha fina; vira vidro (`.is-scrolled`)
  só quando gruda, isto é, quando a rolagem passa da barra de utilidade. O
  sublinhado do link cresce e recolhe pela esquerda: trocar a origem no meio do
  caminho fazia o traço saltar de lado.
- **Hero.** `overflow:clip`, não `hidden`: `hidden` faria do hero um contêiner
  de rolagem e prenderia as animações ligadas à rolagem a um scroll que não
  anda. O véu diagonal nunca clareia antes de 560px (a coluna do texto) e o de
  baixo segura o crédito de 12px (sem ele, 3,1:1 em 901px). A máscara de cada
  linha do título é só vertical: a cauda do "g" itálico passa da caixa. Cada
  peça (sobrelinha, texto, botões, selo, crédito) tem um invólucro `.hero-sai`
  que carrega a saída ligada à rolagem; a entrada fica no elemento de dentro.
  Assim nenhum elemento leva duas animações de opacidade e deslocamento, e o
  compositor roda as duas. No celular a comida vem primeiro e o véu escurece em
  px (`--hero-pt`), não em % da altura: manteiga sobre a foto dá 5,1:1 no pior
  pixel. O anel de foco do selo tem duas cores, porque manteiga sobre manteiga
  sumia na parte clara da foto.
- **Faixa de números e avaliações.** Acima de 900px os cinco números ficam numa
  linha. Abaixo, `flex-basis: clamp(calc(20% - 20px), (680px - 100%) * 999,
  calc(50% - 13px))`: o termo do meio é enorme abaixo de 680px de conteúdo e
  negativo acima, então a base salta de 1/5 para 1/2. Dá cinco numa linha ou
  2+2+1, nunca 4+1. Os três cartões de avaliação usam a mesma conta (1/3 ou
  100%, limite de 600px): três lado a lado ou um embaixo do outro, nunca 2+1.
- **Menu.** O café colonial abre de ponta a ponta. Padaria e confeitaria
  dividem a linha de baixo, foto ao lado do texto, na proporção da própria foto
  (3:2, sem recorte). A foto tem 1,05fr contra 1fr do texto: a caixa fica
  perto de 300px no desktop (até 1,4x em tela 2x) e o selo do prêmio cabe numa
  linha de 1240px para cima. Abaixo disso o selo quebra equilibrado, com o ano
  preso a "de Ivoti". O selo fica no texto, nunca sobre a foto (ver "Dados",
  item 6). Até 1080px a foto vai para cima e o texto ocupa o cartão inteiro.
- **Embeds e fotos.** `.aguarda` só esconde o que o script marcou para esperar;
  sem script, nada se esconde. Enquanto o embed carrega, ou se o navegador
  bloquear rede social, o quadro mostra a marca de quem vai aparecer.
- **Rota.** Acima de 1080px, uma linha de 14 cidades. Abaixo, duas colunas de
  sete, porque em 14 colunas estreitas os nomes quebravam em três linhas.
- **Perguntas.** O título usa `margin-inline:0`: margem automática em item de
  grade vira largura justa e centrada.
- **Diálogos.** A foto ampliada não tem moldura, e a caixa tem a proporção da
  foto (`--ar`, posta pelo script). O fundo não tem desfoque: atrás de um véu
  88% opaco ele quase não se vê e custaria um desfoque de tela inteira a cada
  quadro do voo. A legenda não define a largura (`width:0; min-width`), senão,
  com o celular deitado, o "x" ficava fora da foto. "Fotos e fontes" é
  `position:fixed`; com `relative` o diálogo ia para o topo do documento e a
  página rolava até lá ao abrir.
- **Cápsula.** Escondida fica `visibility:hidden`, para o foco nunca cair fora
  da tela. As margens somam a área segura; `scroll-padding-bottom` mantém o
  foco longe dela, e o rodapé reserva a altura dela mais a área segura.
- **Movimento.** O CSS decide; o script só põe e tira classes. A primeira dobra
  usa `fill: backwards`, nunca `both`: depois de pousar, hover e toque voltam a
  valer. Na entrada por grupo os filhos sobem com 70ms de intervalo (`--i`, no
  máximo 6) e armar é instantâneo: a transição mora só no estado visível, então
  esconder o que está fora da tela não custa nada na carga. O pano das fotos do
  menu e as réguas dos prêmios animam por escala, não por recorte; os ponteiros
  do relógio são `<svg>` próprios girados por `transform` (em elemento SVG, a
  propriedade `rotate` não vai para o compositor). Ação de teclado liga
  `data-instant` no `<html>` por dois quadros, e uma regra só desliga as
  transições do menu, do diálogo de fontes e das perguntas. Todo `:hover` mora
  no bloco `(hover:hover) and (pointer:fine)`, com a versão reduzida aninhada.
- **Preferências do sistema.** Sem vidro, ou sem o sumiço do hero (Firefox), o
  vidro fica quase sólido. Com mais contraste, todo material vira quase sólido
  com borda definida. Em cores forçadas o modo preserva o alfa do fundo, então
  o material translúcido vira `Canvas` sólido, e o que só existia por fundo ou
  sombra ganha borda ou cor de sistema.

### Script

- **Partes.** Cada parte roda isolada em `parte()`: um erro numa não derruba as
  outras, e a classe que esconde é posta pela mesma parte que depois a tira.
  `reduz` e `largo` são lidos a cada uso.
- **Carga sem layout forçado.** Só a parte de entrada lê posições na carga, de
  uma vez, antes de escrever. O resto espera os observadores: o primeiro aviso
  do `ResizeObserver` dá a altura da barra de utilidade, a posição dos botões do
  hero e o estado das setas; o do `IntersectionObserver` aponta os iframes
  longe da tela (`rootBounds`, nunca `innerHeight`). `--cocoa` e `--paper` são
  lidos na primeira virada do topo.
- **Iframes.** Iframe não diz se já carregou: o `load` é ouvido desde o início,
  e só os que estão longe da tela esperam por ele, com 6s de garantia contados
  de quando se aproximam.
- **Foto ampliada.** A foto do cartão cresce até o diálogo e volta a ele (FLIP
  com Web Animations). Fechar no meio do caminho parte de onde a foto está, em
  ease-out; inverter a abertura seria ease-in. Legenda e "x" também saem do
  valor em que estão. A miniatura some e volta por `visibility`, que não tem
  transição. A limpeza fica presa à foto, porque o `close` chega depois e a
  pessoa pode já ter aberto outra. A proporção da caixa vem da imagem que vai
  aparecer, mesmo que a miniatura ainda não tenha chegado. Sem script, a foto
  do cartão é um link para o arquivo.
- **Fotos e fontes.** Sem script, `command`/`commandfor` abrem e fecham o
  diálogo. Com script, o mouse fecha animado (`preventDefault` segura o comando
  nativo) e um Esc no meio da saída cancela o temporizador velho.
- **Selo e relógio.** A tabela de horários é a única fonte. Depois do
  fechamento o selo diz quando a casa abre amanhã. Os ponteiros só andam para
  a frente: ao virar a hora, soma uma volta.
- **Cápsula.** O estado sai da posição da rolagem a cada evento (o topo dos
  botões do hero menos a barra e, com o sumiço, mais 120px), e não de um
  cruzamento de limite: salto de página, link, "Voltar ao topo" e celular
  deitado acertam do mesmo jeito.
- **Setas das fileiras.** No fim da fileira a seta fica `aria-disabled`, não
  `disabled`: botão desligado com foco jogaria o foco do teclado no `<body>`.
- **Entrada.** Arma o que está fora da tela e alcança a faixa de disparo; o que
  mora nos últimos 10% da página nunca entraria nela e ficaria invisível. A
  conta inclui os até 28px que o elemento desce quando armado, mais 8px de
  folga. No celular cada cartão do menu entra sozinho, quando chega. Foco por
  teclado dentro de um grupo que ainda não assentou faz o grupo aparecer na
  hora.
