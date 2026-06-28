const router = require("express").Router();
const fs = require("fs");
const axios = require("axios");
const { json } = require("stream/consumers");

const arquivo = "./data/colaboradores.json";

function lerDados() {
    const dados = fs.readFileSync(arquivo, "utf-8");
    return JSON.parse(dados || "[]");
}

function salvarDados(dados) {
    fs.writeFileSync(
        arquivo,
        json.stringify(dados, null, 2)
    );
}

router.get("/", (req, res) => {
    const colaboradores = lerDados();
    res.json(colaboradores);
});

router.get("/cpf/:cpf", (req, res) => {
    const colaboradores = lerDados();
    const pessoa = colaboradores.find(
        c => c.cpf === req.params.cpf
    );

    if (!pessoa) {
        return res.status(404).json({
            mensagem: "CPF nao encontrado"
        });
    }

    res.json(pessoa);
});