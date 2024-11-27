module.exports = {
    development: {
      client: 'mysql2',
      connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'mexdy',
        charset: 'utf8mb4',
      },
      migrations: {
        directory: '../../migrations',
      },
    },
  };
  