let config;

const env = process.env.NODE_ENV;

const configDev = {
  sessionSecret: 'session782Secret',
  env,
};

const configProd = Object.assign({}, configDev);

if (env === 'production') config = configProd;
else config = configDev;

module.exports = config;