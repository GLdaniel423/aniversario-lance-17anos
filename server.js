const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const USERS = {
      daniel: { name: 'Daniel', password: 'Lance2026!' },
      nalia: { name: 'Nália', password: 'Lance2026!' },
      paola: { name: 'Paola', password: 'Lance2026!' },
};

app.set('trust proxy', 1);
app.use(express.json());
app.use(session({
      secret: process.env.SESSION_SECRET || 'lance-17anos-aniversario-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 1000 * 60 * 60 * 24 * 30,
      },
}));

function requireAuthPage(req, res, next) {
      if (req.session && req.session.user) return next();
      return res.redirect('/login');
}

function requireAuthApi(req, res, next) {
      if (req.session && req.session.user) return next();
      return res.status(401).json({ error: 'not_authenticated' });
}

function readData() {
      try {
              return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      } catch (e) {
              return null;
      }
}

function writeData(data) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/login', (req, res) => {
      res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/api/login', (req, res) => {
      const { username, password } = req.body || {};
      const key = (username || '').toLowerCase().trim();
      const user = USERS[key];
      if (!user || user.password !== password) {
              return res.status(401).json({ error: 'invalid_credentials' });
      }
      req.session.user = { username: key, name: user.name };
      res.json({ ok: true, name: user.name });
});

app.post('/api/logout', (req, res) => {
      req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', requireAuthApi, (req, res) => {
      res.json({ user: req.session.user });
});

app.get('/api/lotes', requireAuthApi, (req, res) => {
      const data = readData();
      res.json({ lotes: data });
});

app.post('/api/lotes', requireAuthApi, (req, res) => {
      writeData(req.body.lotes);
      res.json({ ok: true });
});

app.get('*', requireAuthPage, (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Painel rodando na porta ' + PORT));
