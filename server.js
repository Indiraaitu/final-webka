require('dotenv').config(); // Для работы с переменными окружения
const express = require('express'); // Основной фреймворк
const mongoose = require('mongoose'); // Для работы с MongoDB
const session = require('express-session'); // Для сессий
const bcrypt = require('bcryptjs'); // Для хэширования паролей
const path = require('path'); // Для работы с путями файлов
const axios = require('axios');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const multer = require('multer');
const apiRoutes = require('./routes/api');

const User = require('./models/User'); 
const Portfolio = require('./models/Portfolio');

const app = express();

// Подключаем MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Настройки middleware

app.use(express.urlencoded({ extended: true })); // Для обработки данных формы
app.use(express.json()); // Для обработки JSON данных
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

// Страница регистрации
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html')); // Отдаем register.html
});


// Страница входа
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html')); // Отдаем login.html
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'images')); // Папка для загрузки изображений
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Название файла с уникальным идентификатором
  },
});

app.get('/', async (req, res) => {
  try {
    // Запрос к API новостей
    const newsResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us', // страна для новостей, например, США
        apiKey: process.env.NEWS_API_KEY, // ваш API-ключ для NewsAPI
      },
    });
    const newsData = newsResponse.data.articles;

    // Запрос к API обменных курсов
    const exchangeRatesResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const exchangeRatesData = exchangeRatesResponse.data.rates;

    // Рендерим главную страницу, передавая данные о новостях и курсах валют
    res.render('index', { newsData: newsData, exchangeRatesData: exchangeRatesData });
  } catch (error) {
    console.error('Error fetching API data:', error);
    res.status(500).send('Error fetching API data');
  }
});


// Инициализация multer (загрузчик файлов)
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.EMAIL_PASSWORD, 
  },
});

// Функция для отправки приветственного письма
async function sendWelcomeEmail(userEmail) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Welcome to our website!',
    text: 'Thank you for registration!',
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent');
  } catch (error) {
    console.error('Error sending welcome email', error);
  }
}

// Функция для проверки авторизации
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  return res.redirect('/login');
}

// Функция для проверки роли администратора
function isAdmin(req, res, next) {
  if (req.session.role === 'admin') {
    return next();
  }
  return res.status(403).send('Access denied');
}

// Регистрация пользователя
app.post('/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, age, gender } = req.body;

    const existingUser = await User.findOne({ email }); // Проверка на существующий email
    if (existingUser) {
      return res.status(400).send('Email already taken');
    }

    const existingUsername = await User.findOne({ username }); // Проверка на существующий username
    if (existingUsername) {
      return res.status(400).send('Username already taken');
    }

    const role = (await User.countDocuments()) === 0 ? 'admin' : 'user';

        // Создаём нового пользователя
    const newuser = new User({
      email,
      username,
      password,
      firstName,
      lastName,
      age,
      gender,
      role,
    });
    await newuser.save(); // Сохраняем в базе данных
    sendWelcomeEmail(newuser.email);
    res.redirect('/login'); // Перенаправление на страницу логина после успешной регистрации
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Логика входа
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Ищем пользователя по имени
    const userRecord = await User.findOne({ username });
    console.log('Username:', username); // Выведи перед запросом

    if (!userRecord) {
      return res.status(400).send('Invalid credentials');
    }

    // Сравниваем введенный пароль с хэшированным паролем
    const isMatch = await userRecord.comparePassword(password);
    console.log('Entered password:', password); // Выведи перед запросом

    if (!isMatch) {
      return res.status(400).send('Invalid password');
    }

    // Сохраняем пользователя в сессии
    req.session.userId = userRecord._id;
    req.session.role = userRecord.role;
    if (userRecord.role === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.redirect('/portfolio');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Страница для просмотра портфолио (требуется авторизация)
app.get('/portfolio', isAuthenticated, async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portfolio.html'));
});

// Получение портфолио пользователя
app.get('/portfolio', isAuthenticated, async (req, res) => {
  try {
    const userPortfolio = await Portfolio.find({ user: req.session.userId }).exec();
    console.log('User Portfolio:', userPortfolio); // Логируем портфолио для диагностики
    res.json(userPortfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Error fetching portfolio', error });
  }
});

// Создание нового проекта в портфолио
app.post('/portfolio', isAuthenticated, upload.array('images', 3), async (req, res) => {
  const { title, description } = req.body;

  try {
    const userRecord = await User.findById(req.session.userId);
    if (!userRecord) {
      return res.status(404).send('User not found');
    }

    const newPortfolioItem = new Portfolio({
      title,
      description,
      images: req.files.map(file => file.filename),
      user: userRecord._id,
    });

    await newPortfolioItem.save();
    res.redirect('/portfolio.html');
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(500).send('Error creating portfolio item');
  }
});

// Обновление проекта с новыми изображениями
app.put('/portfolio/:postId', isAuthenticated, upload.array('images', 3), async (req, res) => {
  const { postId } = req.params;
  const { title, description } = req.body;

  try {
    const post = await portfolio.findOne({ _id: postId, user: req.session.userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    const imagePaths = req.files.map(file => '/images/' + file.filename);

    post.title = title || post.title;
    post.description = description || post.description;
    post.images = imagePaths.length ? imagePaths : post.images;

    await post.save();
    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post', error });
  }
});

// Удаление проекта из портфолио
app.delete('/portfolio/:postId', isAuthenticated, async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await portfolio.findOneAndDelete({ _id: postId, user: req.session.userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error });
  }
});

// Административная панель (доступ только для администраторов)
app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});


// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
