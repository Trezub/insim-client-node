/* eslint-disable prettier/prettier */
const { SnakeNamingStrategy } = require('typeorm-naming-strategies');

module.exports = process.env.NODE_ENV === 'production' ? {
    namingStrategy: new SnakeNamingStrategy(),
    type: process.env.DB_CONNECTION,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: false,
    synchronize: false,
    entities: [
        'dist/database/models/**/*.js',
    ],
    migrations: [
        'dist/database/migrations/**/*.js',
    ],
    cli: {
        entitiesDir: 'dist/database/models',
        migrationsDir: 'dist/database/migrations',
    },
} : {
    namingStrategy: new SnakeNamingStrategy(),
    type: process.env.DB_CONNECTION,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: false,
    synchronize: true,
    entities: [
        'src/database/models/**/*.ts',
    ],
    migrations: [
        'src/migrations/**/*.ts',
    ],
    cli: {
        entitiesDir: 'src/database/models',
        migrationsDir: 'src/database/migrations',
    },
};
