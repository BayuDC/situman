const express = require('express');
const morgan = require('morgan');
const redis = require('redis');

const auth = require('./handlers/auth');

const app = express();
const port = process.env.PORT || 3000;
const db = redis.createClient({
    url: process.env.REDIS || 'redis://192.168.10.1:6379',
});

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());

app.get('/status', async (req, res) => {
    const enable = (await db.get('enable')) == 'true';
    const ip = await db.get('ip');

    res.json({ enable, ip });
});
app.post('/enable', auth(), async (req, res) => {
    if (req.body?.enable == undefined) return res.status(418).send();

    if (!req.body.enable) {
        await db.del('passwd');
    }

    const message = await db.set('enable', req.body.enable.toString());
    res.json({ message });
});
app.post('/ip', auth(), async (req, res) => {
    if (req.body?.ip == undefined) return res.status(418).send();

    const message = await db.set('ip', req.body.ip.toString());
    res.json({ message });
});
app.post('/renew', auth(), async (req, res) => {
    const passwd = [0, 0, 0, 0].reduce(acc => acc + Math.floor(Math.random() * 10), '');
    const message = await db.set('passwd', passwd);

    res.json({ passwd, message });
});
app.post('/verify', async (req, res) => {
    const passwd = await db.get('passwd');
    if (!passwd) {
        return res.status(204).send();
    }

    if (req.body.passwd != passwd) {
        return res.status(423).send();
    }

    res.status(204).send();
});

app.get('/', auth(), async (req, res) => {
    const enable = (await db.get('enable')) == 'true';
    const passwd = await db.get('passwd');
    const ip = await db.get('ip');

    res.render('index', {
        passwd,
        enable,
        ip,
    });
});

app.listen(port, () => {
    console.log('App running at port', port);
});
db.connect().then(() => {
    console.log('Connected to database');
});
