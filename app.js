const express = require('express');
const morgan = require('morgan');
const redis = require('redis');
const crypto = require('crypto');

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

    res.json({ enable });
});
app.post('/status', auth(), async (req, res) => {
    if (req.body?.enable == undefined) return res.status(418).send();

    if (!req.body.enable) {
        await db.del('passwd');
    }

    const message = await db.set('enable', req.body.enable.toString());
    res.json({ message });
});
app.post('/renew', auth(), async (req, res) => {
    const passwd = crypto.randomBytes(4).toString('hex');
    const message = await db.set('passwd', passwd);

    res.json({ passwd, message });
});
app.post('/verify', async (req, res) => {
    const passwd = await db.get('passwd');
    if (!passwd) {
        return res.status(425).send();
    }

    if (req.body.passwd != passwd) {
        return res.status(423).send();
    }

    res.status(204).send();
});

app.get('/', auth(), async (req, res) => {
    const enable = (await db.get('enable')) == 'true';
    const passwd = await db.get('passwd');

    res.render('index', {
        passwd,
        enable,
    });
});

app.listen(port, () => {
    console.log('App running at port', port);
});
db.connect().then(() => {
    console.log('Connected to database');
});
