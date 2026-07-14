import mongoose from 'mongoose';
import dns from 'dns';

function isSrvDnsRefusedError(error: any): boolean {
  if (!error) return false;

  const candidates = [error, error.cause].filter(Boolean);

  return candidates.some((candidate: any) => {
    const message = String(candidate.message || '');
    return (
      (candidate.code === 'ECONNREFUSED' && candidate.syscall === 'querySrv') ||
      message.includes('querySrv ECONNREFUSED')
    );
  });
}

function applyDnsFallbackServers(): void {
  const configuredServers = process.env.DNS_SERVERS;
  const fallbackServers = (configuredServers || '8.8.8.8,1.1.1.1')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (fallbackServers.length === 0) return;

  dns.setServers(fallbackServers);
  console.warn(`Using DNS fallback servers: ${fallbackServers.join(', ')}`);
}

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables.');
  }

  // Apply known-good DNS servers before first connect to avoid SRV lookup failures.
  applyDnsFallbackServers();

  try {
    await mongoose.connect(mongoUri);
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().command({ ping: 1 });
    }
    console.log('MongoDB connected successfully');
  } catch (error: any) {
    if (isSrvDnsRefusedError(error)) {
      console.warn('MongoDB SRV lookup failed. Retrying with DNS fallback servers...');

      try {
        applyDnsFallbackServers();
        await mongoose.connect(mongoUri);
        if (mongoose.connection.db) {
          await mongoose.connection.db.admin().command({ ping: 1 });
        }
        console.log('MongoDB connected successfully (after DNS fallback)');
        return;
      } catch (retryError) {
        console.error('Error connecting to MongoDB after DNS fallback:', retryError);
        process.exit(1);
      }
    }

    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};