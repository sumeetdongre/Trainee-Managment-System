const express = require('express');
const router = express.Router();
const { forwardNotAuthenticated } = require('../config/authfuncs.js');

// Welcome Page only for not authenticated people, if he is authenticated(logged in) sends him directly to his home page.
router.get('/login',forwardNotAuthenticated, (req, res) => res.render('signin'));

router.get('/',forwardNotAuthenticated,(req,res)=>{
    res.redirect('/login');
})
router.get('/AdminLogin',forwardNotAuthenticated, (req, res) => res.render('AdminLogin'));

module.exports = router;
