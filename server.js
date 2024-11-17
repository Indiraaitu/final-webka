require('dotenv').config(); // Для работы с переменными окружения
const express = require('express'); // Основной фреймворк
const mongoose = require('mongoose'); // Для работы с MongoDB
const session = require('express-session'); // Для сессий
const bcrypt = require('bcrypt'); // Для хэширования паролей
const nodemailer = require('nodemailer'); // Для отправки email
const bodyParser = require('body-parser'); // Для обработки тела запроса
const path = require('path'); // Для работы с путями файлов
const axios = require('axios');
const User = require('./models/User'); // Модель пользователя (предположим, что она будет храниться в models/User.js)

const app = express();

// Подключаем MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Настройки middleware
app.use(bodyParser.urlencoded({ extended: true })); // Для обработки данных формы
app.use(bodyParser.json()); // Для обработки JSON данных
app.use(express.static(path.join(__dirname, 'public'))); // Статичные файлы (например, CSS, картинки)

// Настройки сессий
app.use(session({
  secret: 'mqtZ4Jm2CIH6cuO3Ly12pQh3pnPaumBv', // Секрет для подписания сессионных cookies
  resave: false,
  saveUninitialized: true,
}));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Отдаем index.html
});

async function getCurrencyRates() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const baseURL = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

  try {
    const response = await axios.get(baseURL);
    console.log('Exchange Rates:', response.data.conversion_rates);
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
  }
}

async function fetchEsportsNews() {
  const response = await axios.get('https://api.pandascore.co/matches', {
    headers: { Authorization: `Bearer l00Ph1CkzAvrr02ftC5ypzw7KjkWaIpn5WodKrf1Xofhk7GblLM` }
  });
  console.log(response.data);
}

// Страница регистрации
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html')); // Отдаем register.html
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, age, gender } = req.body;

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём нового пользователя
    const user = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      gender,
    });
    await user.save(); // Сохраняем в базе данных

    // Настройка и отправка приветственного письма с использованием Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASSWORD, 
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.username,
      subject: 'Welcome to Portfolio Platform',
      text: `Hello ${user.firstName}, welcome to our platform!`,
    });

    res.redirect('/login'); // Перенаправление на страницу логина после успешной регистрации
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Страница входа
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html')); // Отдаем login.html
});

// Логика входа
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Ищем пользователя по имени
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    // Сравниваем введенный пароль с хэшированным паролем
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    // Сохраняем пользователя в сессии
    req.session.user = user;

    res.status(200).send('Logged in successfully');
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
