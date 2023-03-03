const basicAuth = require('express-basic-auth');

module.exports = () => {
    return basicAuth({
        users: { admin: process.env.ADMIN || 'hehehe' },
        challenge: true,
    });
};
