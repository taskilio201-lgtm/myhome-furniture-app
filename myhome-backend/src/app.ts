import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './lib/supabase';

// 加载环境变量
dotenv.config();

// 测试数据库连接
testConnection();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'MyHome backend is running' });
});

app.listen(port, () => {
  console.log(`⚡️ [server]: MyHome backend running at http://localhost:${port}`);
});