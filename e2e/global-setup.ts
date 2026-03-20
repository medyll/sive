import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function globalSetup() {
  console.log('🗄️  Setting up test database...');
  try {
    // Run migrations before tests
    console.log('📦 Applying database migrations...');
    execSync('npm run db:push', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      timeout: 30000
    });
    console.log('✅ Database migrations complete');
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
    throw error;
  }
}

export default globalSetup;
