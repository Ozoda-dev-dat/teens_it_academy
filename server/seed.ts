import { pool, db } from './db';
import { storage } from './storage';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Only create demo data in development
    if (process.env.NODE_ENV !== 'production') {
      // Create admin user
      const existingAdmin = await storage.getUserByEmail('admin@mail.com');
      if (!existingAdmin) {
        const adminData = {
          email: 'admin@mail.com',
          password: await hashPassword('admin2233'),
          firstName: 'Admin',
          lastName: 'Teens IT',
          role: 'admin' as const,
          parentPhone: 'N/A',
          parentName: 'Admin Parent',
          medals: { gold: 0, silver: 0, bronze: 0 }
        };

        await storage.createUser(adminData);
        console.log('✅ Admin user created: admin@mail.com / admin2233');
      } else {
        console.log('✅ Admin user already exists');
      }
    } else {
      console.log('✅ Skipping demo user creation in production');
    }

    // Create sample data only in development
    if (process.env.NODE_ENV !== 'production') {
      // Create sample groups
      const groups = await storage.getAllGroups();
      if (groups.length === 0) {
        await storage.createGroup({
          name: 'Web Dasturlash (Boshlang\'ich)',
          description: 'HTML, CSS va JavaScript asoslari',
          schedule: ['Dushanba 14:00', 'Chorshanba 14:00', 'Juma 14:00']
        });

        await storage.createGroup({
          name: 'Python Dasturlash',
          description: 'Python dasturlash tili va dasturiy ta\'minot yaratish',
          schedule: ['Seshanba 16:00', 'Payshanba 16:00']
        });

        console.log('✅ Sample groups created');
      }

      // Create sample products
      const products = await storage.getAllProducts();
      if (products.length === 0) {
        await storage.createProduct({
          name: 'Teens IT Futbolka',
          description: 'Rasmiy Teens IT School futbolkasi - yuqori sifatli paxta',
          medalCost: { gold: 3, silver: 2, bronze: 1 },
          image: 'https://via.placeholder.com/300x200?text=Teens+IT+Futbolka',
          isActive: true,
          quantity: 10
        });

        await storage.createProduct({
          name: 'Dasturlash Stikerlar To\'plami',
          description: 'Turli dasturlash tillari va texnologiyalari uchun stikerlar',
          medalCost: { gold: 1, silver: 1, bronze: 0 },
          image: 'https://via.placeholder.com/300x200?text=Stikerlar',
          isActive: true,
          quantity: 50
        });

        await storage.createProduct({
          name: 'IT Sohasi Kitobi',
          description: 'Yoshlar uchun dasturlash va IT sohasiga kirish bo\'yicha qo\'llanma',
          medalCost: { gold: 5, silver: 3, bronze: 2 },
          image: 'https://via.placeholder.com/300x200?text=IT+Kitob',
          isActive: true,
          quantity: 5
        });

        console.log('✅ Sample products created');
      }
    } else {
      console.log('✅ Skipping sample data creation in production');
    }

    console.log('🎉 Database seeding completed successfully!');
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n📋 Demo Accounts:');
      console.log('👤 Administrator: admin@mail.com / admin2233');
      console.log('👥 Students: Create them through the admin panel');
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();