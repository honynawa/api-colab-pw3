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
        JSON.stringify(dados, null, 2)
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

router.get("/:id", (req, res) =>{
    const colaboradores = lerDados();
    const pessoa = colaboradores.find(
        c => c.id == req.params.id
    );

    if (!pessoa) {
        return res.status(404).json({
            mensagem: "ID não encontrados"
        });
    }
    res.json(pessoa);
});

router.post("/", async (req, res) => {
    const {
        nome,
        cargo,
        cpf,
        email,
        cep,
        numero
    } = req.body;


    if ( !nome || !cargo || !cpf || !email || !cep || !numero) {
        return res.status(400).json({
            mensagem: "Preencha todos os campos"
        });
    }

    if (!email.includes("@")) {
        return res.status(400).json({
            mensagem: "Email inválido"
        });
    }

    const colaboradores = lerDados();
    const cpfExiste = colaboradores.find(
        c => c.cpf === cpf
    );

    if (cpfExiste) {
        return res.status(400).json({
            mensagem: "CPF já cadastrado"
        });
    }

    const resposta = await axios.get(
        `https://viacep.com.br/ws/${cep}/json/`
    );

    const endereco = resposta.data;

    const novoId = colaboradores.length > 0 ? colaboradores[colaboradores.length - 1].id + 1 : 1;

    const novoColaborador = {
        id: novoId,
        nome,
        cargo,
        cpf,
        email,
        endereco: {
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            estado: endereco.uf,
            numero
        },
        status: "Ativo"
    };

     colaboradores.push(novoColaborador);

    salvarDados(colaboradores);

    return res.status(201).json(novoColaborador);

});

router.put("/:id", async (req, res) => {
    const colaboradores = lerDados();

    const index = colaboradores.findIndex(
        c => c.id == req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            mensagem: "Colaborador nao encontrado"
        });
    }

    const {
        cargo,
        email,
        cep,
        numero
    } = req.body;

    colaboradores[index].cargo = cargo || colaboradores[index].cargo;
    colaboradores[index].email = email || colaboradores[index].email;

    if (cep) {
        const resposta = await axios.get(
             `https://viacep.com.br/ws/${cep}/json/`
        );

        const endereco = resposta.data;

        colaboradores[index].endereco = {
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            estado: endereco.uf,
            numero:
                numero || colaboradores[index].endereco.numero
        };

    }

    if (numero) {
        colaboradores[index].endereco.numero = numero;
    }

    salvarDados(colaboradores);
    res.json(colaboradores[index]);

});

router.delete("/:id", (req, res) => {
    const colaboradores = lerDados();

    const index = colaboradores.findIndex(
        c => c.id == req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            mensagem: "Colaborador não encontrado"
        });
    }

    colaboradores[index].status = "Inativo";
    salvarDados(colaboradores);

    return res.json({
        mensagem: "Colaborador desativado com sucesso",
        colaborador: colaboradores[index]
    });
});

module.exports = router;