"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./config/db");
async function main() {
    console.log('🌱 Database seeding initiated...');
    // 1. Clean the database
    await db_1.prisma.watchlistItem.deleteMany();
    await db_1.prisma.user.deleteMany();
    console.log('🧹 Existing database records purged.');
    // 2. Hash standard passwords
    const defaultPassword = 'password123';
    const passwordHash = await bcryptjs_1.default.hash(defaultPassword, 10);
    // 3. Create regular user
    const regularUser = await db_1.prisma.user.create({
        data: {
            email: 'user@primetrade.ai',
            name: 'Alpha Trader',
            passwordHash,
            role: 'USER',
        },
    });
    console.log(`👤 Regular user created: ${regularUser.email} (Password: ${defaultPassword})`);
    // 4. Create admin user
    const adminUser = await db_1.prisma.user.create({
        data: {
            email: 'admin@primetrade.ai',
            name: 'Systems Architect',
            passwordHash,
            role: 'ADMIN',
        },
    });
    console.log(`🛡️ Admin user created: ${adminUser.email} (Password: ${defaultPassword})`);
    // 5. Seed watchlist items for regular user
    await db_1.prisma.watchlistItem.createMany({
        data: [
            {
                symbol: 'BTC',
                name: 'Bitcoin',
                amount: 1.25,
                purchasePrice: 67200.5,
                note: 'DCA support fill. Long-term spot position.',
                userId: regularUser.id,
            },
            {
                symbol: 'ETH',
                name: 'Ethereum',
                amount: 8.5,
                purchasePrice: 3450.2,
                note: 'Buying descending channel breakout.',
                userId: regularUser.id,
            },
            {
                symbol: 'SOL',
                name: 'Solana',
                amount: 45.0,
                purchasePrice: 138.75,
                note: 'Adding to ecosystem spot bag.',
                userId: regularUser.id,
            },
        ],
    });
    console.log('📈 Watchlist items seeded for regular user.');
    // 6. Seed watchlist items for admin user (so the admin user also has a watchlist)
    await db_1.prisma.watchlistItem.createMany({
        data: [
            {
                symbol: 'LINK',
                name: 'Chainlink',
                amount: 150.0,
                purchasePrice: 15.2,
                note: 'Oracle integration scaling play.',
                userId: adminUser.id,
            },
            {
                symbol: 'AVAX',
                name: 'Avalanche',
                amount: 35.0,
                purchasePrice: 28.9,
                note: 'Subnet scaling architecture testing.',
                userId: adminUser.id,
            },
        ],
    });
    console.log('📈 Watchlist items seeded for admin user.');
    console.log('✅ Database seeding finished successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding process encountered an error:', e);
    process.exit(1);
})
    .finally(async () => {
    await db_1.prisma.$disconnect();
});
