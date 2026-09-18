# Doce Sabor Ivoti

Site da **Padaria e Confeitaria Doce Sabor** — Av. Presidente Lucena, 1983,
bairro Harmonia, Ivoti/RS.

Site estático em HTML, CSS e JavaScript, sem build. O `index.html` está na
raiz, então é só abrir no navegador ou apontar qualquer hospedagem para cá.

```
index.html      página única
style.css       estilos
fonts.css       fontes locais (assets/font-*.ttf)
script.js       menu, rolagem e interações
favicon.jpg
assets/         fotos, logo oficial e ícones
PRODUCT.md      briefing do produto (público, posicionamento, princípios)
```

## Pendências antes de divulgar

1. **Canonical aponta para outro domínio.** No `<head>` do `index.html`:

   ```html
   <link rel="canonical" href="https://doce-sabor-ivoti-cafe.marcelaaquinocorreaa.chatgpt.site/">
   ```

   Enquanto essa linha existir, o Google entende que o site oficial é aquele
   endereço, não este. Troque pelo domínio final ou apague a linha.

2. **Número de avaliações.** A primeira dobra mostra "2.343 avaliações no
   Google". Confira no perfil antes de divulgar — o número muda.

3. **Horários e valores** não estão no site de propósito. Se quiser publicar,
   confirme com a equipe primeiro.

## Publicar

O repositório traz um workflow de GitHub Pages em
`.github/workflows/deploy-pages.yml`. Em **Settings › Pages**, escolha
**Source: GitHub Actions**. Cada push publica o site.

No plano gratuito do GitHub, o Pages só funciona em repositório público. Para
manter o código fechado, **Cloudflare Pages** ou **Netlify** publicam
repositório privado de graça: conecte o repo, deixe o comando de build vazio e
a pasta de publicação como `/`.
