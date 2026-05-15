const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      ssl: { rejectUnauthorized: true },
    },
  }
);

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Create roles
    const roles = ['admin', 'manager', 'agent'];
    for (const name of roles) {
      await sequelize.query('INSERT IGNORE INTO roles (name) VALUES (:name)', {
        replacements: { name },
      });
    }
    console.log('Roles seeded.');

    // Create lead sources
    const sources = ['Facebook Ads', 'Referral', 'WhatsApp', 'Walk-in', 'Instagram', 'Website', 'Phone Call', 'Email', 'Other'];
    for (const name of sources) {
      await sequelize.query('INSERT IGNORE INTO lead_sources (name) VALUES (:name)', {
        replacements: { name },
      });
    }
    console.log('Lead sources seeded.');

    // Create admin user
    const passwordHash = bcrypt.hashSync('password123', 10);
    await sequelize.query(
      `INSERT IGNORE INTO users (full_name, email, phone, password_hash, role_id)
       VALUES (:name, :email, :phone, :password, :role_id)`,
      {
        replacements: {
          name: 'Admin User',
          email: 'admin@crm.com',
          phone: '08000000000',
          password: passwordHash,
          role_id: 1,
        },
      }
    );

    // Create sample agent
    await sequelize.query(
      `INSERT IGNORE INTO users (full_name, email, phone, password_hash, role_id)
       VALUES (:name, :email, :phone, :password, :role_id)`,
      {
        replacements: {
          name: 'Agent One',
          email: 'agent@crm.com',
          phone: '08000000001',
          password: passwordHash,
          role_id: 3,
        },
      }
    );

    console.log('Users seeded.');
    console.log('\n--- Login Credentials ---');
    console.log('Admin: admin@crm.com / password123');
    console.log('Agent: agent@crm.com / password123');
    console.log('-------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
