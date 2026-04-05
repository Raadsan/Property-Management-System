import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Current Users in DB:", users.map(u => ({ id: u.id, email: u.email, status: u.status })));

  const targetEmail = "john@example.com";
  const user = await prisma.user.findUnique({ where: { email: targetEmail } });

  if (user) {
    console.log(`Found user: ${user.email}`);
    // Let's reset the password for testing
    const newPassword = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, status: "ACTIVE" }
    });
    
    console.log(`✅ Password for ${targetEmail} reset to: ${newPassword}`);
  } else {
    console.log(`❌ User ${targetEmail} not found`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
