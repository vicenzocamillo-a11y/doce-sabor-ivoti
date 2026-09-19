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
PRODUCT.md        briefing do produto
```

## Estrutura

A página segue o padrão das redes grandes de cafeteria e padaria:

1. **Barra de utilidade** — "aberto agora", endereço e telefone, sempre no topo.
2. **Topo fixo** enxuto: logo, navegação e o botão de WhatsApp.
3. **Hero de largura total** com a foto das cucas, chamada e duas ações.
4. **A casa em números**: notas, posição no Tripadvisor, prêmios e horário.
   Só dados conferidos em fonte pública.
5. **Menu** — três cartões com foto, categoria, nome e o que tem em cada um.
6. **Encomendas** — os três passos e os dois canais, com o que informar.
7. **Prêmios** numa faixa escura, com os três títulos de 2024.
8. **Nossa casa** — a história, desde 1999.
9. **Rota Romântica** — por que a casa está no caminho de quem viaja.
10. **Avaliações** — Google, Tripadvisor e o convite para avaliar.
11. **Fotos e novidades** — publicações reais do Instagram e do Facebook.
12. **Perguntas frequentes** — cinco respostas, em `<details>` nativo.
13. **Visite** — mapa, endereço, horário e as ações de contato num bloco só.
14. **Rodapé largo** em quatro colunas.

## O que está ligado

| Recurso | Onde |
|---|---|
| Mapa do Google embutido | seção Visite |
| Ficha do Google (avaliações) | cartão "Google" e link "Ver ficha no Google" |
| Avaliar no Google | botão no cartão amarelo "Sua vez" |
| Tripadvisor | cartão ao lado do Google |
| Instagram | três publicações embutidas, cabeçalho e rodapé |
| Facebook | linha do tempo ao vivo, cabeçalho e rodapé |
| Traçar rota | hero, seção Visite e barra fixa do celular |
| Waze | seção Visite |
| WhatsApp | topo, menu, Facebook, Visite e barra fixa do celular |
| Telefone | barra de utilidade, menu do celular, Visite e rodapé |
| Aberto agora / fechado | três selos calculados da tabela de horários, no fuso de Ivoti |

As perguntas frequentes também saem como `schema.org/FAQPage`, que é o que
faz o Google mostrar as perguntas direto na busca.

Sobre as respostas: só entrou o que dá para sustentar. Horário, endereço,
canais de encomenda e o que é café colonial são verificáveis. Pergunta que
eu não sabia responder de verdade ficou de fora.

Também configurados: dados estruturados `schema.org/Bakery` (endereço,
telefone, horários, nota, prêmios, mapa e perfis), Open Graph com imagem
própria, manifest, robots, sitemap com data, página 404, pré-carregamento da
foto de abertura e pré-conexão com Instagram e Facebook.

O selo "aberto agora" calcula no **horário de Ivoti** (America/Sao_Paulo),
não no do visitante — quem olha de outro fuso vê o estado real da casa.

## Fotos e redes sociais

Cada fotografia aparece **uma única vez**. São quatro imagens reais:
`cucas` é o fundo do hero, e `buffet`, `casa-real` e `confeitaria` são as
fotos dos três cartões do menu. Repetir uma foto em duas seções faz o site
parecer montado por robô.

Para acrescentar um item ao menu: coloque a foto em `assets/` (de preferência
`.webp`) e copie um bloco `<article class="dish">` no `index.html`, trocando
`src`, `alt`, `data-photo`, `data-caption`, a categoria, o nome e a lista. A
ampliação ao clique já funciona sozinha.

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

Primeira visita em desktop: **703 KB**, contra 1.502 KB antes da limpeza.

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
- **Prêmios 2024** — Os Melhores da Gastronomia, VIPS DO SUL, Ivoti.

**Não verificado — confirme antes de divulgar:**

1. **"2.343 avaliações"** (primeira dobra e cartão do Google). Esse número
   veio da ficha que foi passada para quem montou o site, não de uma fonte
   que eu pudesse conferir. Confira no perfil e ajuste em dois lugares:
   `index.html` (texto) e o `reviewCount` no bloco `application/ld+json`.
2. **Horários** — agora **7h às 20h, todos os dias**, conforme a bio do
   próprio Instagram da casa. Antes o site dizia 7h30–21h30, que veio de
   agregador. Para corrigir, mexa só na tabela `.hours-table` do
   `index.html`: o selo "aberto agora" (topo, menu do celular e seção de
   horários) e o JSON-LD acompanham sozinhos.
3. **"desde 1999"**, no hero e na seção Nossa casa.
4. **Telefone** (51) 98037-5842, usado em `wa.me/5551980375842` e `tel:`.

## Antes de publicar

**Endereço do site.** Está apontando para o GitHub Pages
(`https://vicenzocamillo-a11y.github.io/doce-sabor-ivoti/`). Quando tiver
domínio próprio, troque em `index.html` (canonical, `og:url`, `og:image` e os
três campos do JSON-LD), `robots.txt` e `sitemap.xml`.

**Link direto de avaliação.** O botão "Avaliar no Google" leva à ficha, onde a
pessoa clica em "Escrever avaliação". Para levar direto ao formulário, pegue o
Place ID em
<https://developers.google.com/maps/documentation/places/web-service/place-id>
e troque o link por
`https://search.google.com/local/writereview?placeid=SEU_PLACE_ID`.

## Publicar

Workflow de GitHub Pages em `.github/workflows/deploy-pages.yml`. Em
**Settings › Pages**, escolha **Source: GitHub Actions**. Cada push publica.

No plano gratuito do GitHub, o Pages exige repositório público. Para manter o
código fechado, **Cloudflare Pages** ou **Netlify** publicam repositório
privado de graça: conecte o repo, deixe o comando de build vazio e a pasta de
publicação como `/`.

## Rodar na sua máquina

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```
