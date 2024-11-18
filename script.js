// Валидация данных формы на странице регистрации
document.getElementById('registerForm')?.addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const role = document.getElementById('age').value;

    // Проверка обязательных полей
    if (!username || !password || !firstName || !lastName || !age || !gender || !role ) {
        alert('Please fill everything.');
        return;
    }

    // Создаем объект данных для отправки
    const userData = {
        username,
        password,
        firstName,
        lastName,
        age,
        gender,
        role,
    };

    // Отправляем данные на сервер с помощью fetch
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message) });
        }
        window.location.href = '/login'; // Перенаправляем на страницу входа
    })
    .catch(error => {
        console.error('Ошибка регистрации:', error);
        alert('Произошла ошибка при регистрации. Попробуйте снова.');
    });
});

// Валидация данных формы на странице входа
document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Проверка обязательных полей
    if (!username || !password) {
        alert('Please input username and password.');
        return;
    }

    // Создаем объект данных для отправки
    const loginData = {
        username,
        password,
    };

    // Отправляем данные на сервер с помощью fetch
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message) });
        }
        window.location.href = '/'; // Перенаправляем на главную страницу после успешного входа
    })
    .catch(error => {
        console.error('Ошибка входа:', error);
        alert('Incorrect username or password, please input them again.');
    });
});
