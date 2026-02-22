// server/keep-alive.js (إذا كان عندك backend)
import cron from 'cron';
import https from 'https';

const job = new cron.CronJob('*/10 * * * *', () => {
  https.get('https://portfolio.onrender.com', (res) => {
    console.log('✅ Ping sent at', new Date().toLocaleTimeString());
  }).on('error', (err) => {
    console.error('❌ Ping error:', err.message);
  });
});

job.start();
console.log('🚀 Keep-alive service started');
