const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

app.post("/frete", async (req, res) => {
  const { cep_origem, cep_destino, peso, altura, largura, comprimento, valor_declarado } = req.body;

  try {
    const response = await fetch("https://api.centraldofrete.com/v1/quotation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer SEU_TOKEN_AQUI"
      },
      body: JSON.stringify({
        from: cep_origem,
        to: cep_destino,
        invoice_amount: valor_declarado,
        volumes: [
          {
            quantity: 1,
            width: largura,
            height: altura,
            length: comprimento,
            weight: peso
          }
        ]
      })
    });

    const resultado = await response.json();

    if (resultado.error) {
      return res.status(400).json({ erro: resultado.error });
    }

    const frete = {
      valor: resultado.total_price || 20.00, // fallback se nada vier
      prazo: resultado.delivery_time || 5,
      transportadora: resultado.carrier_name || "Central do Frete"
    };

    return res.json(frete);
  } catch (err) {
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});