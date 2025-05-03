import { supabase } from '@/lib/supabase';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({ 
      success: true, 
      message: 'Подключение к Supabase успешно',
      data 
    });
  } catch (error) {
    console.error('Ошибка подключения к Supabase:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка подключения к Supabase',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
} 