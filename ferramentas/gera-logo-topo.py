#!/usr/bin/env python3
"""Gera assets/logo-topo.png a partir de assets/logo-oficial.jpg.

Recorte justo do desenho (com o ponto rosa inteiro) e fundo transparente,
para a logo poder ficar sobre o topo de vidro. Cada pixel vira uma das duas
tintas da propria logo, com alfa pela cobertura:

- as tintas saem do miolo solido de cada forma (pixels cercados pela mesma
  tinta num raio de 3px), nunca das bordas suavizadas;
- o alfa e a fracao do caminho do branco ate a tinta, estimada nos tres
  canais (minimos quadrados); acima de 0,92 vira 1, abaixo de 0,06 vira 0;
- o PNG sai em paleta montada a mao (transparente + 2 tintas x 16 niveis de
  alfa): as tintas ficam exatas, sem a quantizacao mexer na cor.

Requer Pillow. Uso: python3 ferramentas/gera-logo-topo.py [raiz-do-site]
Confere: python3 ferramentas/gera-logo-topo.py --confere [raiz-do-site]
"""
import os
import statistics
import sys

from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith('--')]
raiz = args[0] if args else '.'
so_confere = '--confere' in sys.argv

ORIGEM = os.path.join(raiz, 'assets/logo-oficial.jpg')
DESTINO = os.path.join(raiz, 'assets/logo-topo.png')
X0, X1, Y0, Y1 = 99, 400, 158, 323   # desenho em 103..395 x 162..318, folga de 4px
NIVEIS = 16

im = Image.open(ORIGEM).convert('RGB')
px = im.load()
W, H = im.size


def classe(c):
    """Tinta grosseira de um pixel: 'r' rosa, 'c' cacau, None fundo/borda."""
    r, g, b = c
    if 255 - max(r, g, b) < 60 and 255 - min(r, g, b) < 120:
        return None
    return 'r' if r - g > 110 else 'c'


cls = {}
for y in range(H):
    for x in range(W):
        cls[x, y] = classe(px[x, y])


def miolo(x, y, k, raio=3):
    for dy in range(-raio, raio + 1):
        for dx in range(-raio, raio + 1):
            if cls.get((x + dx, y + dy)) != k:
                return False
    return True


amostras = {'r': [], 'c': []}
for y in range(Y0, Y1):
    for x in range(X0, X1):
        k = cls[x, y]
        if k and miolo(x, y, k):
            amostras[k].append(px[x, y])
mediana = lambda l: tuple(int(round(statistics.median(c[i] for c in l))) for i in range(3))
TINTA = {k: mediana(v) for k, v in amostras.items()}


def alfa_e_tinta(c):
    """Melhor tinta e alfa: c = branco + a * (tinta - branco)."""
    melhor = None
    for k, t in TINTA.items():
        d = [255 - t[i] for i in range(3)]
        e = [255 - c[i] for i in range(3)]
        a = sum(d[i] * e[i] for i in range(3)) / sum(d[i] * d[i] for i in range(3))
        a = min(1.0, max(0.0, a))
        resto = sum((e[i] - a * d[i]) ** 2 for i in range(3))
        if melhor is None or resto < melhor[2]:
            melhor = (k, a, resto)
    k, a, _ = melhor
    if a >= 0.92:
        a = 1.0
    elif a < 0.06:
        a = 0.0
    return k, a


def gera():
    # paleta: 0 transparente; 1..16 cacau; 17..32 rosa (alfa crescente)
    ordem = ['c', 'r']
    paleta = [0, 0, 0]
    alfas = [0]
    for k in ordem:
        for n in range(1, NIVEIS + 1):
            paleta += list(TINTA[k])
            alfas.append(round(n / NIVEIS * 255))
    out = Image.new('P', (X1 - X0, Y1 - Y0), 0)
    out.putpalette(paleta + [0, 0, 0] * (256 - len(paleta) // 3))
    op = out.load()
    for y in range(Y0, Y1):
        for x in range(X0, X1):
            k, a = alfa_e_tinta(px[x, y])
            n = round(a * NIVEIS)
            if n:
                op[x - X0, y - Y0] = 1 + ordem.index(k) * NIVEIS + (n - 1)
    out.save(DESTINO, optimize=True, transparency=bytes(alfas))
    print('tintas: cacau #%02x%02x%02x, rosa #%02x%02x%02x' % (TINTA['c'] + TINTA['r']),
          '| amostras', len(amostras['c']), len(amostras['r']), '| PNG', os.path.getsize(DESTINO), 'bytes')


# ---------- conferencia: miolo solido sobre papel = pixel do JPG (Delta E 1976) ----------
def lab(c):
    def lin(v):
        v /= 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(v) for v in c)
    X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    Y = (0.2126 * r + 0.7152 * g + 0.0722 * b)
    Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return (116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z)))


def delta_e(a, b):
    return sum((x - y) ** 2 for x, y in zip(lab(a), lab(b))) ** 0.5


def confere(destino=DESTINO):
    """Miolo solido (raio 4) sobre papel contra o JPG suavizado 5x5 no mesmo
    ponto (tira o ruido do JPEG): Delta E 1976 medio e p95 abaixo de 2, e alfa
    cheio em todo o miolo."""
    papel = (0xff, 0xfa, 0xf6)
    png = Image.open(destino).convert('RGBA')
    pp = png.load()
    ok = True
    for k, nome in (('c', 'cacau'), ('r', 'rosa')):
        ds, alfa_cheio = [], True
        for y in range(Y0, Y1):
            for x in range(X0, X1):
                if not (cls[x, y] == k and miolo(x, y, k, raio=4)):
                    continue
                r, g, b, a = pp[x - X0, y - Y0]
                alfa_cheio = alfa_cheio and a == 255
                al = a / 255
                sobre = tuple(al * v + (1 - al) * p for v, p in zip((r, g, b), papel))
                viz = [px[x + i, y + j] for i in range(-2, 3) for j in range(-2, 3)]
                jpg = tuple(sum(c[i] for c in viz) / len(viz) for i in range(3))
                ds.append(delta_e(sobre, jpg))
        ds.sort()
        media, p95 = sum(ds) / len(ds), ds[int(len(ds) * 0.95)]
        print(f'{nome}: {len(ds)} px de miolo | alfa cheio {alfa_cheio} | Delta E medio {media:.2f} | p95 {p95:.2f} | pior {ds[-1]:.2f}')
        ok = ok and alfa_cheio and media < 2 and p95 < 2
    print('RESULTADO:', 'OK' if ok else 'FALHOU')
    return ok


if so_confere:
    sys.exit(0 if confere() else 1)
gera()
confere()
