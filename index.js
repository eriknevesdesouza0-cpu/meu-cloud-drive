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
        const ramTexto = "512MB/1TB"; 
        const nodeVersao = process.version;

        // 1. Criar a imagem base (Tamanho padrão de cartão/banner: 800x450 com fundo escuro)
        const largura = 800;
        const altura = 450;
        const imagem = new Jimp(largura, altura, 0x111622FF); // Cor de fundo escura estilizada

        // Carregar fontes padrão do Jimp
        const fonteTitulo = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        const fonteTexto = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

        // 2. Desenhar os 4 blocos/caixas (retângulos arredondados ou caixas de status)
        const corBloco = 0x1F2430FF;
        
        // Bloco 1 (Superior Esquerdo)
        imagem.scan(50, 150, 330, 80, function (x, y, idx) {
            this.setPixelColor(corBloco, x, y);
        });
        // Bloco 2 (Superior Direito)
        imagem.scan(420, 150, 330, 80, function (x, y, idx) {
            this.setPixelColor(corBloco, x, y);
        });
        // Bloco 3 (Inferior Esquerdo)
        imagem.scan(50, 260, 330, 80, function (x, y, idx) {
            this.setPixelColor(corBloco, x, y);
        });
        // Bloco 4 (Inferior Direito)
        imagem.scan(420, 260, 330, 80, function (x, y, idx) {
            this.setPixelColor(corBloco, x, y);
        });

        // 3. Adicionar os textos dentro de cada bloco correspondente
        // Bloco 1: Ping
        imagem.print(fonteTexto, 70, 170, `⚡ PING:`);
        imagem.print(fonteTitulo, 70, 190, `${pingTexto}`);

        // Bloco 2: Uptime
        imagem.print(fonteTexto, 440, 170, `⏰ UPTIME:`);
        imagem.print(fonteTitulo, 440, 190, `${uptimeTexto}`);

        // Bloco 3: RAM
        imagem.print(fonteTexto, 70, 280, `💻 RAM:`);
        imagem.print(fonteTitulo, 70, 300, `${ramTexto}`);

        // Bloco 4: Node.js / Sistema
        imagem.print(fonteTexto, 440, 280, `⚙️ NODE.JS:`);
        imagem.print(fonteTitulo, 440, 300, `${nodeVersao}`);

        // 4. Adicionar o Avatar Circular no Topo Central com a tua imagem
        try {
            const urlAvatar = "https://api.zorobot.shop/drive/f/24e8ff385450a47cc9f2e17053e8030d/IMG-20261025-WA0087.jpg";
            const avatar = await Jimp.read(urlAvatar);
            avatar.resize(90, 90);
            avatar.circle(); // Transforma a imagem em círculo perfeito
            imagem.composite(avatar, (largura / 2) - 45, 30); // Posiciona no centro superior
        } catch (e) {
            console.error("Erro ao carregar o avatar:", e.message);
        }

        // 5. Converter e enviar a imagem final em formato buffer para o bot
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
  
