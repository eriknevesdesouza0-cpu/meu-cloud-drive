const express = require('express');
const { Jimp, JimpMime } = require('jimp'); // Importação atualizada para evitar incompatibilidades
const app = express();
const PORT = process.env.PORT || 3000;

// Chave secreta configurada para segurança da API
const API_SECRET = "Jaxdev123"; // Atualizado com a chave correta que estavas a usar

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
            fundoImg.resize({ w: largura, h: altura });
            fundoImg.blur(15); // Desfoca o fundo para dar destaque aos blocos de texto
            fundoImg.color([{ apply: 'shade', params: [70] }]);
        } catch (e) {
            fundoImg = new Jimp({ width: largura, height: altura, color: 0x111622FF });
        }

        const imagem = fundoImg;

        // Carregar fontes compatíveis com a versão moderna do Jimp
        const fonteTitulo = await Jimp.loadFont("fonts/open-sans/open-sans-32-white/font.fnt");
        const fonteTexto = await Jimp.loadFont("fonts/open-sans/open-sans-16-white/font.fnt");

        // Função auxiliar para desenhar caixas/blocos com bordas arredondadas e brilho roxo
        function desenharBlocoArredondado(img, x, y, w, h, raio) {
            img.scan({ x: x + raio, y: y, w: w - (raio * 2), h: h }, function(px, py, idx) {
                this.setPixelColor(0x0B0E14CC, px, py);
            });
            img.scan({ x: x, y: y + raio, w: w, h: h - (raio * 2) }, function(px, py, idx) {
                this.setPixelColor(0x0B0E14CC, px, py);
            });

            const corBorda = 0x9b59b6FF;
            const corBrilhoRoxo = 0x8e44ad88;

            for (let i = 0; i < w; i++) {
                img.setPixelColor(corBorda, x + i, y);
                img.setPixelColor(corBorda, x + i, y + h - 1);
                img.setPixelColor(corBrilhoRoxo, x + i, y - 1);
                img.setPixelColor(corBrilhoRoxo, x + i, y + h);
            }
            for (let j = 0; j < h; j++) {
                img.setPixelColor(corBorda, x, y + j);
                img.setPixelColor(corBorda, x + w - 1, y + j);
                img.setPixelColor(corBrilhoRoxo, x - 1, y + j);
                img.setPixelColor(corBrilhoRoxo, x + w, y + j);
            }
        }

        // 2. Desenhar os 4 blocos de status
        desenharBlocoArredondado(imagem, 50, 150, 330, 80, 15);
        desenharBlocoArredondado(imagem, 420, 150, 330, 80, 15);
        desenharBlocoArredondado(imagem, 50, 260, 330, 80, 15);
        desenharBlocoArredondado(imagem, 420, 260, 330, 80, 15);

        // 3. Adicionar os textos
        imagem.print({ font: fonteTexto, x: 70, y: 168, text: "PING:" });
        imagem.print({ font: fonteTitulo, x: 70, y: 188, text: `${pingTexto}` });
        imagem.print({ font: fonteTexto, x: 440, y: 168, text: "UPTIME:" });
        imagem.print({ font: fonteTitulo, x: 440, y: 188, text: `${uptimeTexto}` });
        imagem.print({ font: fonteTexto, x: 70, y: 278, text: "RAM:" });
        imagem.print({ font: fonteTitulo, x: 70, y: 298, text: `${ramTexto}` });
        imagem.print({ font: fonteTexto, x: 440, y: 278, text: "NODE.JS:" });
        imagem.print({ font: fonteTitulo, x: 440, y: 298, text: `${nodeVersao}` });

        // 4. Adicionar o Avatar Circular no Topo Central
        try {
            const avatar = await Jimp.read(urlAvatar);
            avatar.resize({ w: 90, h: 90 });
            avatar.circle();

            const avatarX = (largura / 2) - 45;
            const avatarY = 30;
            
            imagem.scan({ x: avatarX - 3, y: avatarY - 3, w: 96, h: 96 }, function(x, y, idx) {
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
        const buffer = await imagem.getBuffer(JimpMime.png);
        
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
