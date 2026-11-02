const express = require('express');
const Jimp = require('jimp');
const app = express();
const PORT = process.env.PORT || 3000;

// Chave secreta de segurança para proteger a tua API
const API_KEY = "jax_secreto_2026";

app.get('/api/gerar-ping', async (req, res) => {
    try {
        const { ping, uptime, apikey } = req.query;

        if (apikey !== API_KEY) {
            return res.status(403).json({ erro: "ApiKey inválida ou não autorizada!" });
        }

        const latencia = ping || "0";
        const tempoAtivo = uptime || "0s";

        const largura = 1000;
        const altura = 563;
        const imagem = new Jimp(largura, altura, '#0b0f19');

        imagem.scan(50, 250, 435, 85, function (x, y, idx) {
            this.bitmap.data[idx]     = 15;  
            this.bitmap.data[idx + 1] = 23;  
            this.bitmap.data[idx + 2] = 42;  
            this.bitmap.data[idx + 3] = 230; 
        });

        const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).catch(() => null);
        if (font) {
            imagem.print(font, 70, 265, 'JAX SYSTEM - STATUS');
            imagem.print(font, 70, 295, `Ping: ${latencia}ms | Uptime: ${tempoAtivo}`);
        }

        const buffer = await imagem.getBufferAsync(Jimp.MIME_PNG);

        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro interno ao gerar o gráfico." });
    }
});

app.listen(PORT, () => {
    console.log(`🎨 API a correr na porta ${PORT}`);
});
