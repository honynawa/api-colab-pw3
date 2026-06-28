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