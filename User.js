const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Для хэширования пароля

// Схема пользователя
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Уникальное имя пользователя
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'editor'], // Роли: admin или editor
    default: 'editor', // Роль по умолчанию
  },
  twoFactorSecret: {
    type: String, // Для хранения секрета двухфакторной аутентификации
    default: null,
  }
}, {
  timestamps: true, // Поля для отслеживания времени создания и обновления
});

// Хэширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    // Хэшируем пароль перед сохранением в базе данных
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Метод для проверки пароля
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Создание модели пользователя
const User = mongoose.model('User', userSchema);

module.exports = User;
