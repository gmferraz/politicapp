"""Gera os ícones do Politicapp: recorte da bandeira (verde, cunha amarela, círculo azul).

Sem dependências — escreve PNG na mão (zlib + struct).
Geometria definida num canvas de referência 1024x1024:
  - fundo verde
  - cunha amarela com vértice em (117, 512), abrindo até cruzar o topo em x=563
  - círculo azul com centro (1592, 512) e raio 856 (parcialmente visível à direita)
"""

import math
import struct
import sys
import zlib

GREEN = (20, 146, 70)
YELLOW = (255, 200, 10)
BLUE = (26, 50, 158)

APEX_X, APEX_Y = 117.0, 512.0
SLOPE = 512.0 / 446.0  # meia-abertura da cunha por unidade de x
CX, CY, R = 1592.0, 512.0, 856.0
R2 = R * R


def cor(x: float, y: float) -> tuple:
    """Cor no ponto (x, y) do canvas de referência 1024."""
    dx, dy = x - CX, y - CY
    if dx * dx + dy * dy <= R2:
        return BLUE
    if x >= APEX_X and abs(y - APEX_Y) <= (x - APEX_X) * SLOPE:
        return YELLOW
    return GREEN


def render(size: int, zoom: float = 1.0) -> bytes:
    """RGB raster. zoom < 1 encolhe a composição em direção ao centro
    (para o safe zone do ícone adaptativo do Android)."""
    escala = 1024.0 / size

    def ref(u: float) -> float:
        return (u * escala - 512.0) / zoom + 512.0

    SS = 4  # subamostras por eixo nos pixels de borda
    linhas = []
    for py in range(size):
        yc = ref(py + 0.5)
        # limites aproximados das bordas nesta linha (em px de saída)
        xs_ref = APEX_X + abs(yc - APEX_Y) / SLOPE
        meio_corda = math.sqrt(max(R2 - (yc - CY) ** 2, 0.0))
        xb_ref = CX - meio_corda
        margem = 3
        xs_px = (xs_ref - 512.0) * zoom + 512.0
        xb_px = (xb_ref - 512.0) * zoom + 512.0
        xs_lo = max(int(xs_px / escala) - margem, 0)
        xs_hi = min(int(xs_px / escala) + margem, size)
        xb_lo = max(int(xb_px / escala) - margem, 0)
        xb_hi = min(int(xb_px / escala) + margem, size)

        linha = bytearray()
        px = 0
        while px < size:
            if (xs_lo <= px < xs_hi) or (xb_lo <= px < xb_hi):
                r = g = b = 0
                for sy in range(SS):
                    yy = ref(py + (sy + 0.5) / SS)
                    for sx in range(SS):
                        xx = ref(px + (sx + 0.5) / SS)
                        c = cor(xx, yy)
                        r += c[0]
                        g += c[1]
                        b += c[2]
                n = SS * SS
                linha += bytes((r // n, g // n, b // n))
                px += 1
            else:
                # trecho plano: avança até a próxima zona de borda
                fim = size
                for limite in (xs_lo, xs_hi, xb_lo, xb_hi):
                    if px < limite < fim:
                        fim = limite
                c = cor(ref(px + 0.5), yc)
                linha += bytes(c) * (fim - px)
                px = fim
        linhas.append(bytes(linha))
    return b"".join(b"\x00" + l for l in linhas)


def escrever_png(caminho: str, size: int, zoom: float = 1.0) -> None:
    raw = render(size, zoom)

    def chunk(tipo: bytes, dados: bytes) -> bytes:
        return (
            struct.pack(">I", len(dados))
            + tipo
            + dados
            + struct.pack(">I", zlib.crc32(tipo + dados))
        )

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    with open(caminho, "wb") as f:
        f.write(png)
    print(f"ok {caminho} ({size}x{size}, zoom={zoom})")


if __name__ == "__main__":
    destino = sys.argv[1]
    escrever_png(f"{destino}/icon.png", 1024)
    escrever_png(f"{destino}/adaptive-icon.png", 1024, zoom=0.66)
    escrever_png(f"{destino}/favicon.png", 64)
    escrever_png(f"{destino}/splash-icon.png", 512)
