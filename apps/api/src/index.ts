/* eslint-disable prefer-destructuring */
import mysql from 'mysql2/promise';

import { Server } from './server/server.js';
import { logger } from './modules/logger.js';

/* ====== DATABASE ====== */
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = parseInt(process.env.DATABASE_PORT || '3306', 10);
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_ADMIN_USER = process.env.DATABASE_ADMIN_USER || 'root';
const DATABASE_ADMIN_PASSWORD = process.env.DATABASE_ADMIN_PASSWORD;
const DATABASE_READER_USER = process.env.DATABASE_READER_USER || 'reader';
const DATABASE_READER_PASSWORD = process.env.DATABASE_READER_PASSWORD;
const DATABASE_WRITER_USER = process.env.DATABASE_WRITER_USER || 'writer';
const DATABASE_WRITER_PASSWORD = process.env.DATABASE_WRITER_PASSWORD;

const connectionString = `mysql://${DATABASE_ADMIN_USER}:${DATABASE_ADMIN_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;
const connectionStringReader = `mysql://${DATABASE_READER_USER}:${DATABASE_READER_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;
const connectionStringWriter = `mysql://${DATABASE_WRITER_USER}:${DATABASE_WRITER_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;

const rootClient = await mysql.createConnection(connectionString);
await rootClient.query(`
  CREATE TABLE IF NOT EXISTS \`patient\`(
    \`patientID\` int(11) AUTO_INCREMENT NOT NULL,
    \`name\` varchar(100) NOT NULL,
    \`dateOfBirth\` datetime NOT NULL,
    CONSTRAINT\`patient_patientID_pk\` PRIMARY KEY(\`patientID\`)
  );
`);
rootClient.end();

const reader = mysql.createPool(connectionStringReader);
const writer = mysql.createPool(connectionStringWriter);

/* ====== SERVER ====== */
const HOST: string = process.env.API_HOST || '0.0.0.0';
const PORT: number = parseInt(process.env.API_PORT || '3000', 10);

if (!process.env.API_HOST) logger.warn('No API_HOST environment variable detected. Defaulting to 0.0.0.0');
if (!process.env.API_PORT) logger.warn('No API_PORT environment variable detected. Defaulting to 3000');

const server = new Server(reader, writer);

server.start(HOST, PORT, () => {
  logger.info(`Server started on http://${HOST}:${PORT}/`);
});
