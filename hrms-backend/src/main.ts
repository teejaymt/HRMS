import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// Add global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

async function bootstrap() {
  try {
    console.log('🚀 Starting bootstrap...');
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log('✅ NestJS app created');
    
    // Serve static files from public directory
    app.useStaticAssets(join(__dirname, '..', 'public'));
    
    // Enable CORS
    app.enableCors({
      origin: ['http://localhost:3001', 'http://localhost:3000'],
      credentials: true,
    });
    console.log('✅ CORS enabled');
    
    const port = process.env.PORT ?? 3000;
    const host = '0.0.0.0'; // Bind to all interfaces (IPv4)
    console.log(`📡 Attempting to listen on ${host}:${port}...`);
    
    const server = await app.listen(port, host);
    console.log(`✅ app.listen() returned successfully`);
    console.log(`✅ Server object:`, typeof server);
    console.log(`✅ Application is running on: http://localhost:${port}`);
    
    // Log server address
    const address = server.address();
    console.log(`✅ Server address:`, address);
    
    // Keep the process alive with a heartbeat
    setInterval(() => {
      console.log(`💓 Server still running on port ${port}`);
    }, 5000);
    
    // Keep the process alive
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap().catch((error) => {
  console.error('❌ Bootstrap error:', error);
  process.exit(1);
});
