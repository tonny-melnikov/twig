let config;

const env = process.env.NODE_ENV;

const configDev = {
  login: {
    maxAttempts: 10,
    lockoutHours: 1,
    minimumPasswordLength: 6,
    passwordResetTimeLimitInHours: 1,
    passwordHashRounds: parseInt(process.env.PASSWORD_HASH_ROUNDS, 10),
  },
  email: {
    login: 'sofiakulakova73@gmail.com',
    password: 'O2Es2vVw9kw',
  },
  server: {
    timezone: null
  },
  session: {
    name: 'scrump',
    secret: 'session782Secret'
  },
  db: {
    uri: 'mongodb://localhost/auth2',
    aclCollectionPrefix: 'acl_',
  },
  messages: {
    retry: 'Технический сбой. Попробуйте зарегистрироваться снова',
    crit: 'Серьёзная техническая ошибка. Обратитесь к администратору.',
    signNameBisy: 'Этот имя пользователя уже занято',
    signAlreadyDone: 'Вы уже регистрировались и можете войти',
    signSuccess: 'Ваш аккаунт успешно создан. Теперь вы можете войти на сайт.',
    signFailed: 'Не верно указан email или пароль',
    noSession: 'Для просмотра страницы вам необходимо войти на сайт',
    loginWaste: 'Вы уже вошли на сайт',
    logout: 'Вы вышли.',
    passwordChange: 'Пароль был успешно изменён',
  },
  env,
};

const configProd = Object.assign({}, configDev);

if (env === 'production') config = configProd;
else config = configDev;

module.exports = config;
