require('dotenv').config();
const express = require('express');
const path = require('path');
const controller = require('./controller');
const model = require('./model');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'view')));

app.set('view engine', 'ejs');
app.set('views', './view');

app.get('/', async (_req, res) => {
  return res.render('index', { result: null });
});

app.post('/', async (req, res) => {
  const { body: { nome, sobrenome, email } } = req;
  const things = await controller
    .getCodes(nome, sobrenome, email)
    .then(async (resp) => {
      await model.insertData(resp);
      return await model.insertData(resp);
    })
    .then(async (resp) => await model.getTotal(resp))
    .then(async (total) => await model.getThings(total))
    .catch((err) => err);

  return res.render('index', { result: things });
});

const PORT = process.env.NODE_PORT || 3000;
app.listen(PORT, console.log(`listening on port ${PORT}`));
