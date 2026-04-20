import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial blog data...');

  // 1. Create Categories
  const categories = [
    "Buying Guide", 
    "Investment", 
    "Interior Design", 
    "Legal", 
    "Sustainability", 
    "Selling Guide"
  ];

  const createdCategories = [];
  for (const catName of categories) {
    const cat = await prisma.blogCategory.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName }
    });
    createdCategories.push(cat);
    console.log(`- Category: ${catName}`);
  }

  // 2. Create Blogs
  const blogs = [
    {
      title: "10 Tips for First-Time Home Buyers in Mogadishu",
      excerpt: "Navigating the real estate market for the first time can be daunting. Here are our top tips to help you secure your dream home.",
      content: "Full content for 10 Tips for First-Time Home Buyers in Mogadishu...",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      author: "Abdi Rahman",
      categoryName: "Buying Guide"
    },
    {
      title: "Why Investing in Commercial Property is Booming",
      excerpt: "Commercial real estate is booming. Discover the best locations and sectors to invest your capital for maximum returns.",
      content: "Full content for Why Investing in Commercial Property is Booming...",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      author: "Sahra Ahmed",
      categoryName: "Investment"
    },
    {
      title: "Modern Interior Trends for 2026 Apartments",
      excerpt: "From minimalist designs to smart home integration, see what's trending in the world of modern apartment interiors this year.",
      content: "Full content for Modern Interior Trends for 2026 Apartments...",
      image: "https://images.unsplash.com/photo-1616489953149-8c9e075080c2?auto=format&fit=crop&q=80&w=800",
      author: "Mohamed Ali",
      categoryName: "Interior Design"
    }
  ];

  for (const b of blogs) {
    const category = createdCategories.find(c => c.name === b.categoryName);
    await prisma.blog.create({
      data: {
        title: b.title,
        excerpt: b.excerpt,
        content: b.content,
        image: b.image,
        author: b.author,
        categoryId: category.id
      }
    });
    console.log(`- Blog: ${b.title}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
