const express = require('express');
const Jimp = require('jimp');
const app = express();
const PORT = process.env.PORT || 3000;

// Chave secreta atualizada para a API Key solicitada
const API_SECRET = "Jaxdev123";

// --- ROTA DE PING ---
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

        let fundoImg;
        try {
            fundoImg = await Jimp.read(urlAvatar);
            fundoImg.resize(largura, altura);
            fundoImg.blur(15);
            fundoImg.color([{ apply: 'shade', params: [70] }]);
        } catch (e) {
            fundoImg = new Jimp(largura, altura, 0x111622FF);
        }

        const imagem = fundoImg;
        const fonteTitulo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        const fonteTexto = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

        function desenharBlocoArredondado(img, x, y, w, h, raio) {
            img.scan(x + raio, y, w - (raio * 2), h, function(px, py, idx) {
                this.setPixelColor(0x0B0E14CC, px, py);
            });
            img.scan(x, y + raio, w, h - (raio * 2), function(px, py, idx) {
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

        desenharBlocoArredondado(imagem, 50, 150, 330, 80, 15);
        desenharBlocoArredondado(imagem, 420, 150, 330, 80, 15);
        desenharBlocoArredondado(imagem, 50, 260, 330, 80, 15);
        desenharBlocoArredondado(imagem, 420, 260, 330, 80, 15);

        imagem.print(fonteTexto, 70, 168, `PING:`);
        imagem.print(fonteTitulo, 70, 188, `${pingTexto}`);
        imagem.print(fonteTexto, 440, 168, `UPTIME:`);
        imagem.print(fonteTitulo, 440, 188, `${uptimeTexto}`);
        imagem.print(fonteTexto, 70, 278, `RAM:`);
        imagem.print(fonteTitulo, 70, 298, `${ramTexto}`);
        imagem.print(fonteTexto, 440, 278, `NODE.JS:`);
        imagem.print(fonteTitulo, 440, 298, `${nodeVersao}`);

        try {
            const avatar = await Jimp.read(urlAvatar);
            avatar.resize(90, 90);
            avatar.circle();
            const avatarX = (largura / 2) - 45;
            const avatarY = 30;
            
            imagem.scan(avatarX - 3, avatarY - 3, 96, 96, function(x, y, idx) {
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

        const buffer = await imagem.getBufferAsync(Jimp.MIME_PNG);
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (erro) {
        console.error("Erro ao gerar imagem na API:", erro);
        res.status(500).json({ error: "Erro interno ao processar a imagem." });
    }
});

// --- ROTA DE FAKE WHATSAPP ---
app.get('/api/gerar-fakewhats', async (req, res) => {
    try {
        const { nome, tag, mensagem, avatar, apikey } = req.query;

        if (apikey !== API_SECRET) {
            return res.status(403).json({ error: "Acesso negado: API Key inválida!" });
        }

        const nomeTexto = nome || "Erik neves";
        const tagTexto = tag || "Tag cinza";
        const mensagemTexto = mensagem || "Erik neves";
        const urlAvatar = avatar || "https://i.imgur.com/2Y0qQXB.png";
        const horaTexto = "13:01 da tarde";

        const largura = 800;
        const altura = 350;

        let fundoImg;
        try {
            fundoImg = await Jimp.read(urlAvatar);
            fundoImg.resize(largura, altura);
            fundoImg.blur(20);
            fundoImg.color([{ apply: 'shade', params: [80] }]);
        } catch (e) {
            fundoImg = new Jimp(largura, altura, 0x0b141aff);
        }

        const imagem = fundoImg;
        const fonteNome = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        const fonteTexto = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        const fonteMensagem = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

        const corBalao = 0x1f2c34ff;
        imagem.scan(160, 40, 580, 260, function(x, y, idx) {
            this.setPixelColor(corBalao, x, y);
        });

        imagem.print(fonteNome, 200, 75, nomeTexto);
        imagem.print(fonteTexto, 200, 120, tagTexto);
        imagem.print(fonteMensagem, 200, 175, mensagemTexto);
        
        const fonteHora = await Jimp.loadFont(Jimp.FONT_SANS_14_WHITE);
        imagem.print(fonteHora, 670, 265, horaTexto);

        try {
            const avatarImg = await Jimp.read(urlAvatar);
            avatarImg.resize(96, 96);
            avatarImg.circle();
            imagem.composite(avatarImg, 47, 47);
        } catch (e) {
            console.error("Erro ao carregar o avatar:", e.message);
        }

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
                                 
