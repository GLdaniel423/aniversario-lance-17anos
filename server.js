const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(__dirname));

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

app.get('/api/lotes', (req, res) => {
    const data = readData();
    res.json({ lotes: data });
});

app.post('/api/lotes', (req, res) => {
    writeData(req.body.lotes);
    res.json({ ok: true });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Painel rodando na porta ' + PORT));
