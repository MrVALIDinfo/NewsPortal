import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const mockUsers = [
  {
    email: 'admin@newsportal.ru',
    password: 'admin',
    name: 'Алексей Новиков',
    initials: 'АН',
    color: '#4F46E5',
    role: 'admin',
    bio: 'Главный редактор новостного портала. Пишу о технологиях и бизнесе.',
  },
  {
    email: 'maria@example.com',
    password: 'user123',
    name: 'Мария Чен',
    initials: 'МЧ',
    color: '#ec4899',
    role: 'user',
    bio: 'Читатель и активный комментатор.',
  },
  {
    email: 'sergey@example.com',
    password: 'user123',
    name: 'Сергей Волков',
    initials: 'СВ',
    color: '#10b981',
    role: 'user',
    bio: 'Интересуюсь наукой и технологиями.',
  },
];

const mockArticles = [
  {
    title: 'Восход ИИ: как машинное обучение трансформирует каждую отрасль',
    excerpt: 'Искусственный интеллект больше не является футуристической концепцией — он кардинально меняет то, как мы работаем, живём и взаимодействуем с миром вокруг нас.',
    content: `
Искусственный интеллект уже давно вышел за рамки лабораторий и академических статей. Сегодня он присутствует в каждом смартфоне, в каждом офисе и на каждой производственной линии.

## Революция в здравоохранении

Системы диагностики на основе ИИ демонстрируют результаты, сопоставимые с опытными врачами. Алгоритмы анализируют медицинские снимки с точностью 97%, помогая выявлять рак на ранних стадиях, когда лечение наиболее эффективно.

## Трансформация производства

Промышленные предприятия внедряют интеллектуальные системы предсказательного обслуживания. Это позволяет сокращать незапланированные простои на 40% и снижать операционные расходы на миллиарды рублей ежегодно.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1770171323762-7b9a517a7094?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    category: 'Технологии',
    tags: '["ИИ", "Инновации"]',
    views: 12400,
    readTime: 6,
    featured: true,
    authorEmail: 'admin@newsportal.ru',
  },
  {
    title: 'Возобновляемая энергия побила рекорд: 50% мирового электричества из чистых источников',
    excerpt: 'Впервые в истории половина всей вырабатываемой в мире электроэнергии приходится на возобновляемые источники.',
    content: `
Мировая энергетика достигла исторического рубежа: доля возобновляемых источников превысила 50%.

## Солнце и ветер ведут

Солнечная и ветровая энергетика обеспечивают 38% мировой выработки. Стоимость солнечных панелей за последние десять лет снизилась на 89%, сделав этот вид энергии самым дешёвым в истории.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1774927334511-c2d1cf654b08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    category: 'Экология',
    tags: '["Климат", "Инновации"]',
    views: 9300,
    readTime: 4,
    featured: false,
    authorEmail: 'admin@newsportal.ru',
  },
  {
    title: 'Глобальный экономический прогноз: рынки адаптируются к новой реальности',
    excerpt: 'Мировые рынки демонстрируют устойчивость несмотря на геополитическую напряжённость. Аналитики пересматривают прогнозы роста в сторону повышения.',
    content: `Новая реальность диктует свои условия. Инвесторы вкладываются в IT...`,
    imageUrl: 'https://images.unsplash.com/photo-1591522810896-cb5f45acb9a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    category: 'Бизнес',
    tags: '["Финансы", "Инновации"]',
    views: 8700,
    readTime: 5,
    featured: false,
    authorEmail: 'maria@example.com',
  }
];

async function main() {
  console.log('Start seeding...');

  const usersMap = new Map();

  for (const u of mockUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        name: u.name,
        initials: u.initials,
        color: u.color,
        role: u.role,
        bio: u.bio,
      },
    });
    usersMap.set(u.email, user.id);
    console.log(`Created user with email: ${user.email}`);
  }

  for (const a of mockArticles) {
    const authorId = usersMap.get(a.authorEmail);
    const post = await prisma.post.create({
      data: {
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        imageUrl: a.imageUrl,
        category: a.category,
        tags: a.tags,
        views: a.views,
        readTime: a.readTime,
        featured: a.featured,
        authorId: authorId,
      },
    });
    console.log(`Created post with title: ${post.title}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
