const express = require('express');
const morgan = require('morgan');
const redis = require('redis');

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
app.post('/status', async (req, res) => {
    if (req.body?.enable == undefined) return res.status(418).send();

    const message = await db.set('enable', req.body.enable.toString());
    res.json({ message });
});

app.get('/', async (req, res) => {
    const enable = (await db.get('enable')) == 'true';
    res.render('index', {
        enable,
    });
});

app.listen(port, () => {
    console.log('App running at port', port);
});
db.connect().then(() => {
    console.log('Connected to database');
});
