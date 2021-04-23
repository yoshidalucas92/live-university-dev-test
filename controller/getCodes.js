const axios = require('axios');

const instance = axios.create({
  baseURL: process.env.API_URL,
  timeout: 5000,
  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
});

module.exports = async (nome, sobrenome, email) => {
  const params = new URLSearchParams();
  params.append('nome', nome);
  params.append('sobrenome', sobrenome);
  params.append('email', email);

  const codes = await instance
    .post('/', params)
    .then((response) => response.data)
    .then((data) => data.split('#'))
    .catch((err) => err);

  const formatedCodes = codes.filter((el, index) => el && index % 2);

  return {
    nome: { nome: nome, cod: formatedCodes[0] },
    sobrenome: { sobrenome: sobrenome, cod: formatedCodes[1] },
    email: { email: email, cod: formatedCodes[2] },
  };
};
