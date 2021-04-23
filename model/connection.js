const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const config = require('../config');

const connection = new Connection(config);

connection.on('connect', (err) => {
  if (err) {
    return console.log("Couldn't connect to SQL Server", err);
  }
  console.log('Connected to SQL Server');
});
  
connection.connect();

const dbInsert = ({ nome, sobrenome, email }) => {
  request = new Request(
    `INSERT tbs_nome (nome, cod) values('${nome.nome}', '${nome.cod}');
    INSERT tbs_sobrenome (sobrenome, cod) values('${sobrenome.sobrenome}', '${sobrenome.cod}');
    INSERT tbs_email (email, cod) values('${email.email}', '${email.cod}');`,
    (err, _rowCount, _row) => {
      if (err) {
        console.log('nope', err);
        return false;
      }
    },
  );

  request.addParameter('nome', TYPES.VarChar, 100);
  request.addParameter('sobrenome', TYPES.VarChar, 100);
  request.addParameter('email', TYPES.VarChar, 100);
  request.addParameter('cod', TYPES.BigInt);

  request.on('requestCompleted', () => {
    getSoma(nome, sobrenome, email);
  });

  connection.execSql(request);
}

const getSoma = (nome, sobrenome, email) => {
  const somas = [];
  request = new Request(
    `SELECT soma FROM tbs_cod_nome WHERE tbs_cod_nome.cod = '${nome.cod}'
    UNION
    SELECT soma FROM tbs_cod_sobrenome WHERE tbs_cod_sobrenome.cod = '${sobrenome.cod}'
    UNION
    SELECT soma FROM tbs_cod_email WHERE tbs_cod_email.cod = '${email.cod}';`,
    (err, _rowCount, row) => {
      if (err) {
        console.log(err);
        return false;
      }
      row.forEach((columns) => {
        columns.forEach((column) => {
          if (column.value !== null) {
            somas.push(column.value);
          }
        });
      });
    },
  );

  request.on('requestCompleted', () => {
    const cods = [nome.cod, sobrenome.cod, email.cod];
    const total =
      somas.reduce((a, b) => parseInt(a) + parseInt(b), 0) +
      cods.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    getThings(total);
  });

  connection.execSql(request);
};

const getThings = (total) => {
  const things = [];
  request = new Request(
    `SELECT a.animal AS animal, p.pais AS pais, c.cor
    FROM tbs_animais AS a
      JOIN
    tbs_paises AS p ON p.total = a.total
      JOIN
    tbs_cores AS c ON c.total = p.total
      LEFT JOIN
    tbs_cores_excluidas AS ec ON c.cor <> ec.cor
    WHERE a.total = ${total};`,
    (err, _rowCount, row) => {
      if (err) {
        console.log(err);
        return false;
      }
      row.forEach((columns) => {
        columns.forEach((column) => {
          if (column.value !== null && things.length < 3) {
            things.push(column.value);
          }
        });
      });
    },
    );
    request.on('requestCompleted', () => {
      connection.emit('result', things);
  });

  connection.execSql(request);
};

module.exports = { connection, dbInsert };
