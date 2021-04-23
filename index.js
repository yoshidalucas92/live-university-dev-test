require('dotenv').config();
const express = require('express');
const path = require('path');
const model = require('./model');
const controller = require('./controller');

const app = express();

// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'view')));

app.set('view engine', 'ejs');
app.set('views', './view');

app.get('/', async (_req, res) => {
  return res.render('index', { result: null });
});

app.post('/', async (req, res) => {
  const { body: { nome, sobrenome, email }} = req;
  const resp = await controller.getCodes(nome, sobrenome, email)
  (model.dbInsert(resp))
  model.connection.on('result', (arr) => {
    const things = {
      animal: arr[0],
      pais: arr[1],
      cor: arr[2],
    };
    return res.render('index', { result: things });
  })
});

const PORT = process.env.NODE_PORT || 3000
app.listen(PORT, console.log(`listening on port ${PORT}`));
