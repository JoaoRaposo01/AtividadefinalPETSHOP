const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(cookieParser());

app.use(session({
  secret: 'petshop',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 }
}));

let interessados = [];
let pets = [];
let adocoes = [];

function auth(req, res, next) {
  if (req.session.logado) next();
  else res.redirect('/');
}

function layout(titulo, conteudo) {
  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container mt-5">
    ${conteudo}
  </div>
</body>
</html>`;
}


app.get('/', (req, res) => {
  res.send(layout('Login', `
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input class="form-control mb-2" name="usuario" placeholder="Usuário" required>
      <input class="form-control mb-2" name="senha" type="password" placeholder="Senha" required>
      <button class="btn btn-primary">Entrar</button>
    </form>
  `));
});

app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === 'admin' && senha === '123') {
    req.session.logado = true;
    if (req.cookies.ultimoAcesso) req.session.ultimoAcesso = req.cookies.ultimoAcesso;
    res.cookie('ultimoAcesso', new Date().toLocaleString());
    res.redirect('/menu');
  } else {
    res.send('Login inválido');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/menu', auth, (req, res) => {
  res.send(layout('Menu', `
    <h2>Menu</h2>
    <p><strong>Último acesso:</strong> ${req.session.ultimoAcesso || 'Primeiro acesso'}</p>
    <a class="btn btn-secondary m-1" href="/interessados">Cadastro de Interessados</a>
    <a class="btn btn-secondary m-1" href="/pets">Cadastro de Pets</a>
    <a class="btn btn-secondary m-1" href="/adotar">Adotar um Pet</a>
    <br><br>
    <a href="/logout">Logout</a>
  `));
});

app.get('/interessados', auth, (req, res) => {
  res.send(layout('Interessados', `
    <h2>Cadastrar Interessado</h2>
    <form method="POST">
      <input class="form-control mb-2" name="nome" placeholder="Nome" required>
      <input class="form-control mb-2" name="email" placeholder="Email" required>
      <input class="form-control mb-2" name="telefone" placeholder="Telefone" required>
      <button class="btn btn-success">Cadastrar</button>
    </form>
    <hr>
    <ul>
      ${interessados.map(i => `<li>${i.nome} - ${i.email}</li>`).join('')}
    </ul>
    <a href="/menu">Voltar</a>
  `));
});

app.post('/interessados', auth, (req, res) => {
  const { nome, email, telefone } = req.body;
  if (!nome || !email || !telefone) return res.send('Dados inválidos');
  interessados.push({ nome, email, telefone });
  res.redirect('/interessados');
});

app.get('/pets', auth, (req, res) => {
  res.send(layout('Pets', `
    <h2>Cadastrar Pet</h2>
    <form method="POST">
      <input class="form-control mb-2" name="nome" placeholder="Nome" required>
      <input class="form-control mb-2" name="raca" placeholder="Raça" required>
      <input class="form-control mb-2" name="idade" placeholder="Idade" required>
      <button class="btn btn-success">Cadastrar</button>
    </form>
    <hr>
    <ul>
      ${pets.map(p => `<li>${p.nome} - ${p.raca}</li>`).join('')}
    </ul>
    <a href="/menu">Voltar</a>
  `));
});

app.post('/pets', auth, (req, res) => {
  const { nome, raca, idade } = req.body;
  if (!nome || !raca || !idade) return res.send('Dados inválidos');
  pets.push({ nome, raca, idade });
  res.redirect('/pets');
});

app.get('/adotar', auth, (req, res) => {
  res.send(layout('Adoção', `
    <h2>Adotar Pet</h2>
    <form method="POST">
      <select class="form-control mb-2" name="interessado" required>
        <option value="">Selecione interessado</option>
        ${interessados.map(i => `<option>${i.nome}</option>`).join('')}
      </select>
      <select class="form-control mb-2" name="pet" required>
        <option value="">Selecione pet</option>
        ${pets.map(p => `<option>${p.nome}</option>`).join('')}
      </select>
      <button class="btn btn-success">Registrar</button>
    </form>
    <hr>
    <ul>
      ${adocoes.map(a => `<li>${a.interessado} → ${a.pet} (${a.data})</li>`).join('')}
    </ul>
    <a href="/menu">Voltar</a>
  `));
});

app.post('/adotar', auth, (req, res) => {
  const { interessado, pet } = req.body;
  if (!interessado || !pet) return res.send('Seleção inválida');
  adocoes.push({ interessado, pet, data: new Date().toLocaleDateString() });
  res.redirect('/adotar');
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
