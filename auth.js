const express = require('express');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// Регистрация пользователя
router.post('/register', async (req, res) => {
  const { username, password, firstName, lastName, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is taken' });
    }

    const newUser = new User({ username, password, firstName, lastName, role });
    await newUser.save();
    res.status(201).json({ message: 'Registration is complete' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error' });
  }
});

// Вход
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.status(200).json({ message: 'Success', user });
    });
  })(req, res, next);
});

module.exports = router;