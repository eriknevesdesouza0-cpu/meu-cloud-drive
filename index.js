const express = require('express');
const Jimp = require('jimp');
const app = express();
const PORT = process.env.PORT || 3000;

// Chave secreta configurada para segurança da API
const API_SECRET = "jax_secreto_2026";

app.get('/api/gerar-ping', async (req, res) => {
    try {
        const { ping, uptime, apikey } = req.query;

        // Validação da chave secreta
        if (apikey !== API_SECRET) {
            return res.status(403).json({ error: "Acesso negado: API Key inválida!" });
        }

        const pingTexto = ping || "0ms";
        const uptimeTexto = uptime || "0s";
        const ramTexto = "57MB/1TB"; 
        const nodeVersao = process.version;

        const largura = 800;
        const altura = 450;
        const urlAvatar = "https://api.zorobot.shop/drive/f/24e8ff385450a47cc9f2e17053e8030d/IMG-20261025-WA0087.jpg";

        // 1. Carregar a imagem para usar como fundo e como avatar central
        let fundoImg;
        try {
            fundoImg = await Jimp.read(urlAvatar);
            fundoImg.resize(largura, altura);
            fundoImg.blur(15); // Desfoca o fundo para dar destaque aos blocos de texto
            // Escurece um pouco o fundo para o texto ficar bem legível
            fundoImg.color([{ apply: 'shade', params: [70] }]);
        } catch (e) {
            // Fallback caso falhe o download da imagem de fundo
            fundoImg = new Jimp(largura, altura, 0x111622FF);
        }

        const imagem = fundoImg;

        // Carregar fontes padrão do Jimp
        const fonteTitulo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        const fonteTexto = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

        // Função auxiliar para desenhar caixas/blocos com bordas arredondadas e brilho roxo
        function desenharBlocoArredondado(img, x, y, w, h, raio) {
            // Fundo semi-transparente escuro do bloco
            img.scan(x + raio, y, w - (raio * 2), h, function(px, py, idx) {
                this.setPixelColor(0x0B0E14CC, px, py);
            });
            img.scan(x, y + raio, w, h - (raio * 2), function(px, py, idx) {
                this.setPixelColor(0x0B0E14CC, px, py);
            });

            // Cantos arredondados e borda com brilho roxo neon (#9b59b6 / #8e44ad)
            const corBorda = 0x9b59b6FF;
            const corBrilhoRoxo = 0x8e44ad88;

            // Desenhar bordas principais e efeito glow simples nas extremidades
            for (let i = 0; i < w; i++) {
                img.setPixelColor(corBorda, x + i, y); // Topo
                img.setPixelColor(corBorda, x + i, y + h - 1); // Fundo
                // Glow externo leve
                img.setPixelColor(corBrilhoRoxo, x + i, y - 1);
                img.setPixelColor(corBrilhoRoxo, x + i, y + h);
            }
            for (let j = 0; j < h; j++) {
                img.setPixelColor(corBorda, x, y + j); // Esquerda
                img.setPixelColor(corBorda, x + w - 1, y + j); // Direita
                // Glow externo leve
                img.setPixelColor(corBrilhoRoxo, x - 1, y + j);
                img.setPixelColor(corBrilhoRoxo, x + w, y + j);
            }
        }

        // 2. Desenhar os 4 blocos de status com o novo design roxo brilhante
        desenharBlocoArredondado(imagem, 50, 150, 330, 80, 15); // Bloco 1 (Ping)
        desenharBlocoArredondado(imagem, 420, 150, 330, 80, 15); // Bloco 2 (Uptime)
        desenharBlocoArredondado(imagem, 50, 260, 330, 80, 15); // Bloco 3 (RAM)
        desenharBlocoArredondado(imagem, 420, 260, 330, 80, 15); // Bloco 4 (Node.js)

        // 3. Adicionar os textos sem as interrogações e devidamente alinhados
        // Bloco 1: Ping
        imagem.print(fonteTexto, 70, 168, `PING:`);
        imagem.print(fonteTitulo, 70, 188, `${pingTexto}`);

        // Bloco 2: Uptime
        imagem.print(fonteTexto, 440, 168, `UPTIME:`);
        imagem.print(fonteTitulo, 440, 188, `${uptimeTexto}`);

        // Bloco 3: RAM
        imagem.print(fonteTexto, 70, 278, `RAM:`);
        imagem.print(fonteTitulo, 70, 298, `${ramTexto}`);

        // Bloco 4: Node.js
        imagem.print(fonteTexto, 440, 278, `NODE.JS:`);
        imagem.print(fonteTitulo, 440, 298, `${nodeVersao}`);

        // 4. Adicionar o Avatar Circular no Topo Central com borda brilhante em roxo
        try {
            const avatar = await Jimp.read(urlAvatar);
            avatar.resize(90, 90);
            avatar.circle(); // Recorte circular perfeito

            // Compor o avatar no topo central
            const avatarX = (largura / 2) - 45;
            const avatarY = 30;
            
            // Desenhar um anel brilhante em volta do avatar
            imagem.scan(avatarX - 3, avatarY - 3, 96, 96, function(x, y, idx) {
                // Cria um círculo em volta do avatar para fazer o glow roxo
                const distX = Math.pow(x - (avatarX + 42), 2);
                const distY = Math.pow(y - (avatarY + 42), 2);
                if (Math.sqrt(distX + distY) >= 42 && Math.sqrt(distX + distY) <= 47) {
                    this.setPixelColor(0x9b59b6FF, x, y);
                }
            });

            imagem.composite(avatar, avatarX, avatarY);
        } catch (e) {
            console.error("Erro ao carregar o avatar central:", e.message);
        }

        // 5. Enviar a imagem final em buffer
        const buffer = await imagem.getBufferAsync(Jimp.MIME_PNG);
        
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (erro) {
        console.error("Erro ao gerar imagem na API:", erro);
        res.status(500).json({ error: "Erro interno ao processar a imagem." });
    }
});

app.get('/', (req, res) => {
    res.send('API de Renderização Canvas do Bot JAX está Online! 🚀');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
    
