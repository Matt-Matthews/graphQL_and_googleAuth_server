const express = require('express');
const helmet = require('helmet');
const https = require('https');
const path = require('path');
require('dotenv').config();
const fs = require('fs')
const passport = require('passport');
const {Strategy} = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const {verify} = require('crypto');

const app = express();
const PORT = 3000;
const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2
};
const authOptions = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
};

function verifyCallback(accessToken,refreshToken, profile, done) {
    console.log('Google profile',profile);
    done(null, profile);
}

passport.use(new Strategy(authOptions, verifyCallback))
passport.serializeUser((user, done)=>{ //save the session to the cookie

    done(null,user);
});
passport.deserializeUser((obj, done)=>{ //read the session from the cookie
    done(null,obj);
})

app.use(helmet());
app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000, //24 hours
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
}))
app.use(passport.initialize());
app.use(passport.session());

function checkLogin(req, res, next){
    const isLoggedIn = true;

    if(!isLoggedIn) {
        return res.status(401).json({
            error: 'You must login!'
        });
    }
    next();
}

app.get('/auth/google',passport.authenticate('google', {
        scope: ['email'],
    }));

app.get('/auth/google/callback',passport.authenticate('google',{
        failureRedirect: '/failure',
        successRedirect: '/',
    }), (req, res)=>{
        console.log('Google responded')
});

app.get('/failure', (req, res)=>{
    res.send('Failed to login');
});

app.get('/auth/logout',(req,res)=>{

});

app.get('/secret',checkLogin, (req, res) => {
    return res.send('Your personal secret value is 42!');
});

app.get('/',(req, res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'));
});
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(PORT,()=>{
    console.log('server started',PORT);
});