const express = require('express');
const Jimp = require('jimp');
const app = express();
const PORT = process.env.PORT || 3000;

// Chave secreta original
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
        const ramTexto = "120MB/1TB"; 
        const nodeVersao = process.version;

        const largura = 800;
        const altura = 450;
        const urlAvatar = "https://api.zorobot.shop/drive/f/24e8ff385450a47cc9f2e17053e8030d/IMG-20261025-WA0087.jpg";
        const urlTouca = "https://api.zorobot.shop/drive/f/a821f0b3b1a26747ee7014b3967feb26/10415716.jpg";

        // 1. Carregar a imagem para usar como fundo
        let fundoImg;
        try {
            fundoImg = await Jimp.read(urlAvatar);
            fundoImg.resize(largura, altura);
            fundoImg.blur(15); // Desfoca o fundo para dar destaque aos blocos de texto
            fundoImg.color([{ apply: 'shade', params: [70] }]);
        } catch (e) {
            fundoImg = new Jimp(largura, altura, 0x111622FF);
        }

        const imagem = fundoImg;

        // Carregar fontes padrão do Jimp
        const fonteTitulo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        const fonteTexto = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

        // Função auxiliar para desenhar blocos com bordas arredondadas e brilho natalino
        function desenharBlocoArredondado(img, x, y, w, h, raio) {
            img.scan(x + raio, y, w - (raio * 2), h, function(px, py, idx) {
                this.setPixelColor(0x0B0E14CC, px, py);
            });
            img.scan(x, y + raio, w, h - (raio * 2), function(px, py, idx) {
                this.setPixelColor(0x0B0E14CC, px, py);
            });

            const corBorda = 0xf1c40fff;
            const corBrilhoNatalino = 0xe67e2288;

            for (let i = 0; i < w; i++) {
                img.setPixelColor(corBorda, x + i, y);
                img.setPixelColor(corBorda, x + i, y + h - 1);
                img.setPixelColor(corBrilhoNatalino, x + i, y - 1);
                img.setPixelColor(corBrilhoNatalino, x + i, y + h);
            }
            for (let j = 0; j < h; j++) {
                img.setPixelColor(corBorda, x, y + j);
                img.setPixelColor(corBorda, x + w - 1, y + j);
                img.setPixelColor(corBrilhoNatalino, x - 1, y + j);
                img.setPixelColor(corBrilhoNatalino, x + w, y + j);
            }
        }

        // 2. Desenhar os 4 blocos de status
        desenharBlocoArredondado(imagem, 50, 150, 330, 80, 15);
        desenharBlocoArredondado(imagem, 420, 150, 330, 80, 15);
        desenharBlocoArredondado(imagem, 50, 260, 330, 80, 15);
        desenharBlocoArredondado(imagem, 420, 260, 330, 80, 15);

        // 3. Adicionar os textos nos blocos
        imagem.print(fonteTexto, 70, 168, `PING:`);
        imagem.print(fonteTitulo, 70, 188, `${pingTexto}`);

        imagem.print(fonteTexto, 440, 168, `UPTIME:`);
        imagem.print(fonteTitulo, 440, 188, `${uptimeTexto}`);

        imagem.print(fonteTexto, 70, 278, `RAM:`);
        imagem.print(fonteTitulo, 70, 298, `${ramTexto}`);

        imagem.print(fonteTexto, 440, 278, `NODE.JS:`);
        imagem.print(fonteTitulo, 440, 298, `${nodeVersao}`);

        // Função para desenhar Estrela de Natal Brilhante
        function desenharEstrelaNatal(img, cx, cy) {
            const corEstrela = 0xfff200FF;
            const corGlow = 0xffffffaa;
            const raioCruz = 12;
            const raioDiag = 6;

            for (let d = -raioCruz; d <= raioCruz; d++) {
                img.setPixelColor(corEstrela, cx + d, cy);
                img.setPixelColor(corEstrela, cx, cy + d);
            }
            for (let d = -raioDiag; d <= raioDiag; d++) {
                img.setPixelColor(corGlow, cx + d, cy + d);
                img.setPixelColor(corGlow, cx + d, cy - d);
            }
            img.setPixelColor(0xFFFFFFFF, cx, cy);
        }

        // Brilhos no fundo
        const posricoesBrilho = [
            {x: 100, y: 80}, {x: 250, y: 50}, {x: 650, y: 70}, {x: 720, y: 110},
            {x: 80, y: 380}, {x: 350, y: 400}, {x: 550, y: 390}, {x: 730, y: 360},
            {x: 30, y: 220}, {x: 770, y: 230}
        ];
        posricoesBrilho.forEach(p => {
            imagem.setPixelColor(0xffffffcc, p.x, p.y);
            imagem.setPixelColor(0xf1c40fff, p.x + 1, p.y);
            imagem.setPixelColor(0xf1c40fff, p.x - 1, p.y);
            imagem.setPixelColor(0xf1c40fff, p.x, p.y + 1);
            imagem.setPixelColor(0xf1c40fff, p.x, p.y - 1);
        });

        // 4. Adicionar o Avatar Circular no Topo Central com Borda Dourada e a Touca
        try {
            const avatar = await Jimp.read(urlAvatar);
            avatar.resize(90, 90);
            avatar.circle(); // Recorte circular perfeito

            const avatarX = (largura / 2) - 45;
            const avatarY = 30;
            
            // Desenhar a borda dourada em volta do avatar
            imagem.scan(avatarX - 4, avatarY - 4, 98, 98, function(x, y, idx) {
                const distX = Math.pow(x - (avatarX + 45), 2);
                const distY = Math.pow(y - (avatarY + 45), 2);
                const dist = Math.sqrt(distX + distY);
                if (dist >= 44 && dist <= 49) {
                    this.setPixelColor(0xf1c40fff, x, y);
                }
            });

            // Cola o avatar na imagem principal
            imagem.composite(avatar, avatarX, avatarY);

            // Carregar e colar a touca natalina por cima do avatar
            try {
                const touca = await Jimp.read(urlTouca);
                touca.resize(60, 60); // Tamanho proporcional para encaixar na cabeça
                // Posiciona a touca perfeitamente no topo do avatar central
                imagem.composite(touca, avatarX + 16, avatarY - 15);
            } catch (errTouca) {
                console.log("Aviso: Não foi possível carregar a touca:", errTouca.message);
            }

            // 5. Estrelas de natal nas laterais do avatar
            const centroY = avatarY + 45;
            desenharEstrelaNatal(imagem, avatarX - 35, centroY);
            desenharEstrelaNatal(imagem, avatarX + 90 + 35, centroY);

        } catch (e) {
            console.error("Erro ao carregar o avatar central ou elementos:", e.message);
        }

        // 6. Enviar a imagem final em buffer
        const buffer = await imagem.getBufferAsync(Jimp.MIME_PNG);
        
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (erro) {
        console.error("Erro ao gerar imagem na API:", erro);
        res.status(500).json({ error: "Erro interno ao processar a imagem." });
    }
});

app.get('/', (req, res) => {
    res.send('API de Renderização Canvas Natalina do Bot JAX está Online! 🎄🚀');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
