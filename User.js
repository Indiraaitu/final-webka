const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Для хэширования пароля

// Схема пользователя
const userSchema = new mongoose.Schema({
  email:{
    type: String,
    required: true,
    unique: true, // Уникальное имя пользователя
  },
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
    required: true,
  }
}, {
  timestamps: true, // Поля для отслеживания времени создания и обновления
});

// Хэширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  // Если пароль не был изменен, не хэшируем
  const salt = await bcrypt.genSalt(10);  // Генерация соли
  this.password = await bcrypt.hash(this.password, salt);  // Хэширование пароля
  next();
});

// Метод для проверки пароля
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Создание модели пользователя
const User = mongoose.model('User', userSchema);

module.exports = User;
