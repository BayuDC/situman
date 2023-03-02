const express = require('express');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log('App running at port', port);
});
