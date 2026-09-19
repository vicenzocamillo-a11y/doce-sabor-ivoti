# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Escreva código, comentários e mensagens de commit em português do Brasil, como o
resto do repositório.

## O que é

Site de uma página da Padaria e Confeitaria Doce Sabor, em Ivoti/RS. HTML, CSS e
JavaScript puros. Sem build, sem framework, sem dependência externa: o que está
no repositório é exatamente o que vai para o ar.

## Rodar e testar

Não há build nem suíte de testes. Para ver o site, sirva a raiz por HTTP — abrir
o arquivo direto (`file://`) quebra os ícones SVG, porque `<use href>` trata
cada arquivo local como origem distinta:

```
python3 -m http.server 8765     # depois abra http://127.0.0.1:8765/
```

A verificação é feita com Playwright, já instalado em
`/opt/node22/lib/node_modules/playwright` (navegadores em `/opt/pw-browsers`).
Não rode `playwright install`. O padrão usado até aqui é um script `.mjs` que
abre a página em 1440, 900 e 390 px e reporta numa linha: erros de JavaScript,
recursos faltando, texto dos selos de horário, contagem de seções e se há
rolagem lateral. Ao mexer no layout, vale repetir essa checagem nos três
tamanhos.

Ao tirar captura de página inteira (`fullPage: true`), imagens com
`loading="lazy"` às vezes saem como bloco vazio mesmo tendo carregado. Antes de
tratar isso como defeito, confirme com uma captura do elemento
(`locator.screenshot`) ou lendo os pixels da imagem por canvas.

## Publicação

Push em `main` dispara `.github/workflows/deploy-pages.yml`, que publica a raiz
do repositório no GitHub Pages. O site fica em
`https://vicenzocamillo-a11y.github.io/doce-sabor-ivoti/`.

O endereço aparece em vários lugares e precisa mudar junto se o domínio mudar:
`canonical` e `og:url` no `index.html`, `sitemap.xml`, `robots.txt` e o
`<base href>` do `404.html`. Os comentários `CONFIGURAR:` marcam cada um.

## Regras da folha de estilo

O `style.css` traz as regras de manutenção no topo. As três que mais importam:
um bloco `@media` por ponto de quebra e nunca dois; seção nova não declara
padding nem largura, porque `main>section` e a lista de contêineres `.wrap`
cuidam disso; e no celular muda a variável `--gutter`, não o padding de cada
seção.

## Como a página se sustenta

**A tabela de horários é a única fonte da verdade sobre horário.** O
`.hours-table` no `index.html` carrega `data-days` (0 = domingo). O `script.js`
lê essa tabela e escreve os três selos "aberto agora" — barra de utilidade,
menu do celular e seção Visite. Mudou o horário, mexa só na tabela; os selos
acompanham. O bloco `openingHoursSpecification` do JSON-LD precisa ser ajustado
à mão para bater.

O selo calcula no fuso de Ivoti (`America/Sao_Paulo`) via `Intl`, não no relógio
do visitante. Quem abre o site de outro fuso vê o estado real da casa.

**O ponto de quebra entre menu completo e menu recolhido é 900px**, e essa
verdade está escrita em três lugares que precisam concordar: os `@media` do
`style.css`, o `matchMedia` do `script.js` e o atributo `sizes` das imagens no
`index.html`.

**Fotos não se repetem.** São quatro imagens reais em `assets/`, cada uma com um
único lugar na página: `cucas` no hero, `buffet`, `casa-real` e `confeitaria`
nos três cartões do menu. Repetir foto foi um problema real já corrigido; se
acrescentar seção com imagem, use arquivo novo.

**Os embeds carregam no navegador de quem visita**, não neste ambiente. Seis
publicações do Instagram (`/p/CODIGO/embed` e `/reel/CODIGO/embed`), a linha do
tempo do Facebook e o mapa do Google. Em captura local eles aparecem vazios
porque a rede desta sessão bloqueia esses domínios — isso não é defeito.

## Regra de conteúdo

Não invente produto, preço, horário ou avaliação. Cada número visível ou foi
conferido em fonte pública ou está listado como não verificado na seção
"Dados: o que é verificado e o que não é" do `README.md`. `PRODUCT.md` traz o
briefing e os compromissos de marca (preservar marrom e rosa da logo, usar
fotografia real e identificar tratamento de imagem).

Ao acrescentar resposta nas perguntas frequentes, acrescente também ao bloco
`schema.org/FAQPage` no `<head>`, senão os dois divergem.

## Ambiente

A rede desta sessão bloqueia quase todo domínio externo, inclusive Google
Fonts, Instagram, Facebook e bancos de imagem. Não dá para baixar fonte nem
foto nova daqui. As fontes já estão locais, em WOFF2 com subconjunto
latino, declaradas no topo do `style.css`: DM Sans 400/600/700 e Playfair
Display 500 normal e itálico. Não há outra face — pedir um peso que não está
nessa lista faz o navegador sintetizar, e fica feio.
