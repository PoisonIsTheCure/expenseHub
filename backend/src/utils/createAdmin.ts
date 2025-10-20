import { User } from '../models/User';

export const createDefaultAdmin = async (): Promise<void> => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@expensehub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️  Default admin already exists');
      return;
    }

    // Create admin user
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log('✅ Default admin created successfully');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

