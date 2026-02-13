import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 检查环境变量
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// 创建 Supabase 客户端
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 测试连接函数
export async function testConnection() {
  const { data, error } = await supabase.from('homes').select('count');
  if (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
  console.log('✅ Database connected successfully');
  return true;
}