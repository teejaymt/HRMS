import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runMigration() {
  try {
    console.log('🔄 Running Prisma migration to add employee hierarchy...');
    
    const { stdout, stderr } = await execAsync(
      'npx prisma migrate dev --name add_employee_hierarchy',
      { cwd: __dirname }
    );
    
    console.log('✅ Migration output:');
    console.log(stdout);
    
    if (stderr) {
      console.error('⚠️  Warnings/Errors:');
      console.error(stderr);
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Generating Prisma Client...');
    
    const { stdout: genStdout } = await execAsync('npx prisma generate', { cwd: __dirname });
    console.log(genStdout);
    
    console.log('✅ All done!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
