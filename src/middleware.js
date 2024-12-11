const express = require('express');
const path = require('path');

const configureMiddleware = (app) => {
    app.use(express.json());

    app.use(express.static(path.join(__dirname, '../public')));

  app.use(express.urlencoded({ extended: true })); 
};

module.exports = { configureMiddleware };