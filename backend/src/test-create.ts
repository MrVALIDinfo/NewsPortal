async function test() {
  const API_BASE = 'http://localhost:5000/api';
  try {
    // 1. Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@newsportal.ru',
        password: 'admin'
      })
    });
    const loginData: any = await loginRes.json();
    if (!loginData.success) throw new Error('Login failed: ' + JSON.stringify(loginData));
    
    const token = loginData.token;
    console.log('Logged in, token received');

    // 2. Create post
    const createRes = await fetch(`${API_BASE}/admin/posts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: 'Тестовая статья ' + new Date().toLocaleTimeString(),
        content: 'Это содержание статьи для теста создания функционала. Минимум 10 символов.',
        category: 'Технологии',
        tags: ['тест', 'новое'],
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        featured: true
      })
    });

    const createData: any = await createRes.json();
    console.log('Create result:', JSON.stringify(createData, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

test();
