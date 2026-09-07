# Duas vozes, os mesmos valores — hotpage (Agência Quebra)

Página estática (HTML + CSS + JS), pronta para GitHub Pages. Sem build.

## Estrutura
```
index.html            página completa
css/styles.css        tokens de design + componentes
js/main.js            GSAP/ScrollTrigger: hero (frames), timeline horizontal, accordion, áudio, reveals
assets/hero/          99 frames WebP (1280px) do vídeo + poster.jpg   ← já inseridos
assets/logos/         Quebra (branco s/ tagline, verde c/ tagline), Odebrecht, Mota-Engil
assets/audio/         trilha-milton.mp3
assets/timeline/      IM01…IM10 (1600px WebP)
assets/mosaico/       m01…m21 (640px WebP)
assets/ativacao/      01, 03, 04, 05 (WebP)
assets/livro/         (vazio — receber capa real)
assets/img/           respiro-rodovia.webp (provisório)
```

## Estado (fase 2 — completa para publicação)
Todas as imagens inseridas e otimizadas em WebP. Dois itens provisórios, marcados no HTML:
- `PENDENTE`: capa do livro (Instituto Ayrton Senna) — hoje é uma capa tipográfica mock (`.capa-mock`), em `#livro`.
- `PROVISÓRIO`: foto do respiro full-bleed — hoje usa IM10 (Beiras Litoral). Substituir `assets/img/respiro-rodovia.webp`.

## Publicar
Repositório → Settings → Pages → Branch `main` / root. O arquivo `.nojekyll` evita processamento Jekyll.
