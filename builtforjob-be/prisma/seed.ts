/**
 * Prisma Seed Script
 * Seeds: 10 Indian users, 5 founder accounts with companies (verified docs),
 *        20 posts (mix of image & text), cross-likes, and comments.
 * Run: bun run prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD = "Test@123";

// ─── Indian user profiles ──────────────────────────────────────────────────
const REGULAR_USERS = [
  {
    firstName: "Arjun",
    lastName: "Sharma",
    email: "arjun.sharma@example.com",
    jobTitle: "Full Stack Developer",
    bio: "Passionate about building scalable web apps. Love React & Node.js.",
    location: "Bengaluru, Karnataka",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=ArjunSharma&backgroundColor=b6e3f4",
  },
  {
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@example.com",
    jobTitle: "UI/UX Designer",
    bio: "Crafting delightful digital experiences. Figma & Framer enthusiast.",
    location: "Kochi, Kerala",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=PriyaNair&backgroundColor=ffdfbf",
  },
  {
    firstName: "Rohit",
    lastName: "Verma",
    email: "rohit.verma@example.com",
    jobTitle: "DevOps Engineer",
    bio: "AWS certified. Kubernetes & Terraform in my daily life.",
    location: "Hyderabad, Telangana",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=RohitVerma&backgroundColor=c0aede",
  },
  {
    firstName: "Sneha",
    lastName: "Patel",
    email: "sneha.patel@example.com",
    jobTitle: "Data Scientist",
    bio: "Turning raw data into actionable insights. Python & TensorFlow.",
    location: "Ahmedabad, Gujarat",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=SnehaPatel&backgroundColor=d1d4f9",
  },
  {
    firstName: "Vikram",
    lastName: "Singh",
    email: "vikram.singh@example.com",
    jobTitle: "Mobile Developer",
    bio: "Building beautiful iOS & Android apps. Flutter is life. 📱",
    location: "New Delhi",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=VikramSingh&backgroundColor=b6e3f4",
  },
  {
    firstName: "Ananya",
    lastName: "Krishnan",
    email: "ananya.krishnan@example.com",
    jobTitle: "Product Manager",
    bio: "Bridging business and tech. Building products users love. 🚀",
    location: "Chennai, Tamil Nadu",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=AnanyaKrishnan&backgroundColor=ffdfbf",
  },
  {
    firstName: "Karan",
    lastName: "Mehta",
    email: "karan.mehta@example.com",
    jobTitle: "Backend Engineer",
    bio: "Microservices & distributed systems. Go & Rust are my playground.",
    location: "Pune, Maharashtra",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=KaranMehta&backgroundColor=c0aede",
  },
  {
    firstName: "Deepika",
    lastName: "Reddy",
    email: "deepika.reddy@example.com",
    jobTitle: "Machine Learning Engineer",
    bio: "Building AI that actually works in production. LLMs & embeddings.",
    location: "Hyderabad, Telangana",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=DeepikaReddy&backgroundColor=d1d4f9",
  },
  {
    firstName: "Suresh",
    lastName: "Iyer",
    email: "suresh.iyer@example.com",
    jobTitle: "Security Engineer",
    bio: "Ethical hacker & bug bounty hunter. OWASP Top 10 is just the start.",
    location: "Mumbai, Maharashtra",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=SureshIyer&backgroundColor=b6e3f4",
  },
  {
    firstName: "Tanvi",
    lastName: "Gupta",
    email: "tanvi.gupta@example.com",
    jobTitle: "Cloud Architect",
    bio: "Designing resilient cloud infrastructure. Multi-cloud & FinOps.",
    location: "Gurugram, Haryana",
    avatarUrl:
      "https://api.dicebear.com/8.x/avataaars/svg?seed=TanviGupta&backgroundColor=ffdfbf",
  },
];

// ─── Founder profiles + companies ────────────────────────────────────────────
const FOUNDERS = [
  {
    user: {
      firstName: "Rahul",
      lastName: "Kapoor",
      email: "rahul.kapoor@techvision.in",
      jobTitle: "CEO & Co-Founder",
      bio: "Serial entrepreneur. Previously built & exited 2 startups. Now building the future of HR-tech.",
      location: "Bengaluru, Karnataka",
      avatarUrl:
        "https://api.dicebear.com/8.x/avataaars/svg?seed=RahulKapoor&backgroundColor=c0aede",
    },
    company: {
      name: "TechVision AI",
      description:
        "AI-powered recruitment platform connecting top tech talent with the best companies in India.",
      website: "https://techvision.ai",
      industry: "HR Technology",
      logoUrl:
        "https://api.dicebear.com/8.x/initials/svg?seed=TechVision&backgroundColor=6366f1&fontColor=ffffff",
      docUrl:
        "https://ik.imagekit.io/demo/medium_cafe_B1iTdD0C.jpg", // sample verified doc
      docFileId: "sample-doc-001",
    },
  },
  {
    user: {
      firstName: "Meera",
      lastName: "Bose",
      email: "meera.bose@greenleaf.io",
      jobTitle: "CTO & Co-Founder",
      bio: "CleanTech entrepreneur on a mission to make sustainability profitable.",
      location: "Mumbai, Maharashtra",
      avatarUrl:
        "https://api.dicebear.com/8.x/avataaars/svg?seed=MeeraBose&backgroundColor=d1d4f9",
    },
    company: {
      name: "GreenLeaf Solutions",
      description:
        "SaaS platform for carbon footprint tracking and sustainability reporting for enterprises.",
      website: "https://greenleaf.io",
      industry: "CleanTech",
      logoUrl:
        "https://api.dicebear.com/8.x/initials/svg?seed=GreenLeaf&backgroundColor=22c55e&fontColor=ffffff",
      docUrl:
        "https://ik.imagekit.io/demo/medium_cafe_B1iTdD0C.jpg",
      docFileId: "sample-doc-002",
    },
  },
  {
    user: {
      firstName: "Aditya",
      lastName: "Mishra",
      email: "aditya.mishra@educhain.co",
      jobTitle: "Founder & CEO",
      bio: "EdTech veteran. 10+ yrs in education. Using blockchain to verify credentials globally.",
      location: "Pune, Maharashtra",
      avatarUrl:
        "https://api.dicebear.com/8.x/avataaars/svg?seed=AdityaMishra&backgroundColor=b6e3f4",
    },
    company: {
      name: "EduChain",
      description:
        "Blockchain-based credential verification platform for universities and employers worldwide.",
      website: "https://educhain.co",
      industry: "EdTech",
      logoUrl:
        "https://api.dicebear.com/8.x/initials/svg?seed=EduChain&backgroundColor=f59e0b&fontColor=ffffff",
      docUrl:
        "https://ik.imagekit.io/demo/medium_cafe_B1iTdD0C.jpg",
      docFileId: "sample-doc-003",
    },
  },
  {
    user: {
      firstName: "Nisha",
      lastName: "Joshi",
      email: "nisha.joshi@finflow.in",
      jobTitle: "Co-Founder & COO",
      bio: "Ex-HDFC banker turned fintech founder. Making financial tools accessible to every Indian.",
      location: "New Delhi",
      avatarUrl:
        "https://api.dicebear.com/8.x/avataaars/svg?seed=NishaJoshi&backgroundColor=ffdfbf",
    },
    company: {
      name: "FinFlow",
      description:
        "Neo-banking platform built for India's 450M gig workers and freelancers.",
      website: "https://finflow.in",
      industry: "FinTech",
      logoUrl:
        "https://api.dicebear.com/8.x/initials/svg?seed=FinFlow&backgroundColor=0ea5e9&fontColor=ffffff",
      docUrl:
        "https://ik.imagekit.io/demo/medium_cafe_B1iTdD0C.jpg",
      docFileId: "sample-doc-004",
    },
  },
  {
    user: {
      firstName: "Gaurav",
      lastName: "Tiwari",
      email: "gaurav.tiwari@healthbridge.care",
      jobTitle: "CEO & Founder",
      bio: "HealthTech founder making quality healthcare reachable for Bharat.",
      location: "Chennai, Tamil Nadu",
      avatarUrl:
        "https://api.dicebear.com/8.x/avataaars/svg?seed=GauravTiwari&backgroundColor=c0aede",
    },
    company: {
      name: "HealthBridge",
      description:
        "Telemedicine and AI-diagnostics platform connecting rural India with specialist doctors.",
      website: "https://healthbridge.care",
      industry: "HealthTech",
      logoUrl:
        "https://api.dicebear.com/8.x/initials/svg?seed=HealthBridge&backgroundColor=ef4444&fontColor=ffffff",
      docUrl:
        "https://ik.imagekit.io/demo/medium_cafe_B1iTdD0C.jpg",
      docFileId: "sample-doc-005",
    },
  },
];

// ─── Post templates ───────────────────────────────────────────────────────────
const TEXT_POSTS = [
  "Just shipped a major feature after 3 weeks of grinding. The feeling is unmatched. 🚀 What keeps you motivated during long dev cycles? Drop below 👇",
  "Unpopular opinion: Clean code > clever code. Ten times out of ten. I'd rather read a simple for-loop than a one-liner nobody understands. Thoughts?",
  "Had my first system design interview today. They asked me to design Instagram. I panicked. Then I took a breath and started with requirements gathering. Went amazing! 💪",
  "India has 5M+ developers and we're still underpaid compared to our global counterparts. Time for us to own our worth. Salary transparency is the future.",
  "Completed my AWS Solutions Architect exam today! Failed once, studied for 6 more weeks, passed with 892/1000. Never give up. 🏆",
  "My biggest product lesson of the year: Talk to your users every single week. Not every quarter. Every. Single. Week. The insights are irreplaceable.",
  "React vs Vue vs Angular in 2026: They've all converged on the same patterns. Pick the one your team knows best and ship. That's it.",
  "First 100 users milestone hit today! We bootstrapped from zero with ₹0 in external funding. Pure hustle, pure India. 🇮🇳",
  "PSA: Learning to read a balance sheet changed my career more than any technical cert. Engineers who understand business are priceless.",
  "Burn-out is real. I took 2 weeks off with zero laptop time. Came back sharper than ever. Protect your energy, it's your biggest asset.",
  "The Ayodhya tech hub is growing faster than I expected. India's tier-2 cities are the new hubs for innovation. Proud to be part of this wave.",
  "Hot take: LLMs won't replace programmers. They will, however, make mediocre programmers redundant. Be the programmer who can guide AI, not compete with it.",
];

// Real Unsplash/Picsum images tagged for tech/work context
const IMAGE_POSTS = [
  {
    content:
      "Our new office space is ready! 🏢 250+ seat Bengaluru HQ. Come join us — we're hiring across all roles. Link in bio!",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
  },
  {
    content:
      "Team hackathon day 2 wrap-up 🛠️ We built a real-time collaborative code editor in 18 hours. Couldn't be prouder of this crew.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
  },
  {
    content:
      "Excited to announce we just closed our Seed round! 🎉 Can't share numbers yet but the mission just got a whole lot more real.",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop",
  },
  {
    content:
      "Whiteboard sessions are my favourite part of the job. Nothing beats physical collaboration for complex system design. ✍️",
    imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop",
  },
  {
    content:
      "Dashboard v2 is live! Dark mode, real-time updates, and 3× faster load times. The redesign took 6 weeks. Totally worth it 🌙",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
  },
  {
    content:
      "Represented India at the Singapore Tech Summit today 🇮🇳 The energy around Indian startups globally is electric. We're on the map!",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
  },
  {
    content:
      "Beautiful morning in Bengaluru with the team. Work from office Thursdays are becoming my favourite day of the week ☕",
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop",
  },
  {
    content:
      "Just hit ₹1 Cr ARR! 🥳 From a WhatsApp group 18 months ago to a real business. Thank you to everyone who believed in us.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
  },
];

const COMMENT_TEMPLATES = [
  "This is so inspiring! 🔥",
  "Totally agree with this. Well said!",
  "Congratulations! Well deserved 🎉",
  "This is exactly what I needed to read today.",
  "Could not agree more. Sharing this with my team.",
  "How long did it take you to get here?",
  "Followed you for more content like this!",
  "This hits different. Bookmarked. ⭐",
  "Legend! Keep going 🚀",
  "Such great advice. Thank you for sharing!",
  "India is growing so fast. Proud of you all! 🇮🇳",
  "This is the kind of content that LinkedIn should have more of.",
  "Loved reading this. Dropped you a DM!",
  "What would you say to someone just starting out?",
  "So real. We don't talk about this enough.",
];

// ─── Main seed function ──────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting seed...\n");

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  // ── 1. Upsert regular users ──────────────────────────────────────────────
  console.log("👤 Creating 10 regular users...");
  const createdUsers = [];
  for (const u of REGULAR_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        jobTitle: u.jobTitle,
        bio: u.bio,
        location: u.location,
        avatarUrl: u.avatarUrl,
        role: "USER",
        isVerified: true,
      },
    });
    createdUsers.push(user);
    console.log(`  ✅ ${user.firstName} ${user.lastName} <${user.email}>`);
  }

  // ── 2. Upsert founder users + companies ─────────────────────────────────
  console.log("\n🏢 Creating 5 founders with companies...");
  const createdFounders = [];
  for (const f of FOUNDERS) {
    const founder = await prisma.user.upsert({
      where: { email: f.user.email },
      update: {},
      create: {
        email: f.user.email,
        password: hashedPassword,
        firstName: f.user.firstName,
        lastName: f.user.lastName,
        jobTitle: f.user.jobTitle,
        bio: f.user.bio,
        location: f.user.location,
        avatarUrl: f.user.avatarUrl,
        role: "FOUNDER",
        isVerified: true,
      },
    });

    await prisma.company.upsert({
      where: { userId: founder.id },
      update: {},
      create: {
        userId: founder.id,
        name: f.company.name,
        description: f.company.description,
        website: f.company.website,
        industry: f.company.industry,
        logoUrl: f.company.logoUrl,
        docUrl: f.company.docUrl,
        docFileId: f.company.docFileId,
      },
    });

    createdFounders.push(founder);
    console.log(
      `  ✅ ${founder.firstName} ${founder.lastName} — ${f.company.name}`
    );
  }

  // ── 3. Create 20 posts ───────────────────────────────────────────────────
  console.log("\n📝 Creating 20 posts (mix image + text)...");

  const allAuthors = [...createdUsers, ...createdFounders];
  const createdPosts = [];

  // 8 image posts
  for (let i = 0; i < IMAGE_POSTS.length; i++) {
    const ip = IMAGE_POSTS[i];
    const author = allAuthors[i % allAuthors.length];
    const post = await prisma.post.create({
      data: {
        type: "IMAGE",
        content: ip.content,
        imageUrl: ip.imageUrl,
        authorId: author.id,
      },
    });
    createdPosts.push(post);
    console.log(`  🖼️  [IMAGE] Post by ${author.firstName} — "${ip.content.slice(0, 50)}..."`);
  }

  // 12 text posts
  for (let i = 0; i < TEXT_POSTS.length; i++) {
    const text = TEXT_POSTS[i];
    const author = allAuthors[(i + 3) % allAuthors.length]; // offset so different authors
    const post = await prisma.post.create({
      data: {
        type: "TEXT",
        content: text,
        authorId: author.id,
      },
    });
    createdPosts.push(post);
    console.log(`  📄 [TEXT ] Post by ${author.firstName} — "${text.slice(0, 50)}..."`);
  }

  // ── 4. Cross-likes: every user likes ~60% of posts ───────────────────────
  console.log("\n❤️  Adding likes...");
  let likeCount = 0;
  for (const user of allAuthors) {
    for (const post of createdPosts) {
      // Skip liking own post
      if (post.authorId === user.id) continue;
      // ~65% chance to like
      if (Math.random() < 0.65) {
        await prisma.like.upsert({
          where: { postId_userId: { postId: post.id, userId: user.id } },
          update: {},
          create: { postId: post.id, userId: user.id },
        });
        likeCount++;
      }
    }
  }
  console.log(`  ✅ Created ${likeCount} likes`);

  // ── 5. Comments: each post gets 2-4 random comments ─────────────────────
  console.log("\n💬 Adding comments...");
  let commentCount = 0;
  for (const post of createdPosts) {
    const numComments = 2 + Math.floor(Math.random() * 3); // 2–4 comments
    const commenters = allAuthors
      .filter((u) => u.id !== post.authorId)
      .sort(() => Math.random() - 0.5)
      .slice(0, numComments);

    for (const commenter of commenters) {
      const content =
        COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)];
      await prisma.comment.create({
        data: {
          content,
          postId: post.id,
          authorId: commenter.id,
        },
      });
      commentCount++;
    }
  }
  console.log(`  ✅ Created ${commentCount} comments`);

  console.log("\n✨ Seed complete!");
  console.log(`   Users  : ${createdUsers.length} regular + ${createdFounders.length} founders`);
  console.log(`   Posts  : ${createdPosts.length}`);
  console.log(`   Likes  : ${likeCount}`);
  console.log(`   Comments: ${commentCount}`);
  console.log(`\n   🔑 All passwords: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
