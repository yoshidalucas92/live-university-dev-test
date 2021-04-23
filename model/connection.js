const tp = require('tedious-promises');
const dbConfig = require('../config');
tp.setConnectionConfig(dbConfig);

const alreadyExists = async (email) => await tp
    .sql(
      `SELECT * FROM tbs_email WHERE tbs_email.email = '${email.email}' AND tbs_email.cod = '${email.cod}';`,
    )
    .returnRowCount()
    .execute()
    .then((data) => data)
    .fail((err) => {
      throw new Error(err);
    });

const insertData = async ({ nome, sobrenome, email }) => {
  const userData = await alreadyExists(email)
  if (userData) {
    return { nome, sobrenome, email };
  }

  const insertedData = await tp
    .sql(
      `INSERT tbs_nome (nome, cod) values('${nome.nome}', '${nome.cod}');
    INSERT tbs_sobrenome (sobrenome, cod) values('${sobrenome.sobrenome}', '${sobrenome.cod}');
    INSERT tbs_email (email, cod) values('${email.email}', '${email.cod}');`,
    )
    .returnRowCount()
    .execute()
    .then((data) => {
      if (data) {
        return data;
      }
    })
    .fail((err) => {
      throw new Error(err);
    });

  return insertedData;
};

const getTotal = async ({ nome, sobrenome, email }) => {
  const total = await tp
    .sql(
      `SELECT soma FROM tbs_cod_nome WHERE tbs_cod_nome.cod = ${nome.cod}
       UNION
       SELECT soma FROM tbs_cod_sobrenome WHERE tbs_cod_sobrenome.cod = ${sobrenome.cod}
       UNION
       SELECT soma FROM tbs_cod_email WHERE tbs_cod_email.cod = ${email.cod};`,
    )
    .execute()
    .then((somasArr) => somasArr.map((el) => Number(el.soma)).reduce((a, b) => a + b, 0))
    .then((somas) => somas + parseInt(nome.cod) + parseInt(sobrenome.cod) + parseInt(email.cod))
    .fail((err) => {
      throw new Error(err);
    });
  return total;
};

const getThings = async (total) => {
  const things = await tp
    .sql(
      `SELECT DISTINCT a.animal AS animal, p.pais AS pais, c.cor
        FROM tbs_animais AS a
          JOIN
        tbs_paises AS p ON p.total = a.total
          JOIN
        tbs_cores AS c ON c.total = p.total AND c.cor not in (select cor from tbs_cores_excluidas)
        WHERE a.total = ${total}`,
    )
    .execute()
    .then((result) => result[0])
    .fail((err) => {
      throw new Error(err);
    });
  return things;
};

module.exports = { insertData, getTotal, getThings };
