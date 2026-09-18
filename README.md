# Doce Sabor Ivoti

Site da **Padaria e Confeitaria Doce Sabor** — Av. Presidente Lucena, 1983,
bairro Harmonia, Ivoti/RS.

HTML, CSS e JavaScript puros, sem build e sem dependência externa. O
`index.html` fica na raiz: abre com dois cliques e funciona em qualquer
hospedagem estática.

```
index.html        página única
style.css         estilos
fonts.css         Playfair Display e DM Sans, servidas localmente
script.js         menu, lightbox, selo de horário
favicon.jpg
site.webmanifest  instalação como app no celular
robots.txt
sitemap.xml
assets/           fotos reais, logo oficial, ícones e imagem de compartilhamento
PRODUCT.md        briefing do produto
```

## O que está ligado

| Recurso | Onde |
|---|---|
| Mapa do Google embutido | seção final, acima dos horários |
| Ficha do Google (avaliações) | cartão "Google" e link "Ver ficha no Google" |
| Avaliar no Google | botão no cartão amarelo "Sua vez" |
| Tripadvisor | cartão ao lado do Google |
| Traçar rota | topo, seção Visite, barra fixa do celular |
| Waze | seção de horários |
| WhatsApp | topo, café colonial, Visite e barra fixa do celular |
| Telefone | menu do celular e seção Visite |
| Instagram e Facebook | seção Nossa casa e rodapé |
| Aberto agora / fechado | selo calculado da tabela de horários |

Também configurados: dados estruturados `schema.org/Bakery` (endereço,
telefone, horários, nota, prêmios), Open Graph com imagem própria para a
prévia do link no WhatsApp, manifest, robots e sitemap.

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
2. **Horários** (7h30–21h30 de segunda a sábado, 15h–21h no domingo). As
   fontes públicas divergem. Corrija a tabela `.hours-table` no `index.html`:
   o selo "aberto agora" e o JSON-LD acompanham sozinhos.
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
