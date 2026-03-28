import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function globalSetup() {
  console.log('🗄️  Setting up test database...');
  try {
    // Run migrations before tests (use --force to auto-approve)
    console.log('📦 Applying database migrations...');
    execSync('npm run db:push -- --force', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      timeout: 60000
    });
    console.log('✅ Database migrations complete');
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
    // Continue anyway - tests will use in-memory data
    console.log('⚠️  Continuing without database migrations...');
  }
}

export default globalSetup;
