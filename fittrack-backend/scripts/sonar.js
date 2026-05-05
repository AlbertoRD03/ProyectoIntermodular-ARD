import dotenv from 'dotenv';
import sonarqubeScanner from 'sonarqube-scanner';

dotenv.config();

const scanner = sonarqubeScanner.default ?? sonarqubeScanner;
const token = process.env.SONAR_TOKEN;
const serverUrl = process.env.SONAR_HOST_URL || 'http://localhost:9000';

if (!token) {
  console.error('SONAR_TOKEN no definido. Añádelo en .env');
  process.exit(1);
}

scanner(
  {
    serverUrl,
    token
  },
  () => process.exit(0)
);
