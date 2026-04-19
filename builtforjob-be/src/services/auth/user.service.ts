import prisma from '../../config/database/db';
import type { IUser } from '../../interfaces/user.interface';

export class UserService {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            industry: true,
            docVerificationStatus: true,
          },
        },
      }
    });
  }

  static async findByShortId(shortId: string) {
    return prisma.user.findUnique({
      where: { shortId },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            industry: true,
            docVerificationStatus: true,
          },
        },
      }
    });
  }

  static async createUser(data: Omit<IUser, 'id' | 'isVerified' | 'createdAt' | 'updatedAt'> & { role?: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role as any) || 'USER',
        shortId: Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
    });
  }

  static async verifyUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  }

  static async updateUser(id: string, data: any) {
    const { skills, experience, education, projects, ...basicData } = data;

    // Strict whitelisting of allowed fields to prevent Prisma errors with internal fields
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'location', 
      'jobTitle', 'bio', 'socialLinks'
    ];

    const filteredData: any = {};
    allowedFields.forEach(field => {
      if (basicData[field] !== undefined) {
        filteredData[field] = basicData[field];
      }
    });

    return prisma.user.update({
      where: { id },
      data: {
        ...filteredData,
        skills: skills ? {
          deleteMany: {},
          create: skills.map((s: any) => ({ 
            name: s.name,
            isGithubSynced: !!s.isGithubSynced
          }))
        } : undefined,
        experience: experience ? {
          deleteMany: {},
          create: experience.map((e: any) => ({
            company: e.company,
            position: e.position,
            startDate: e.startDate,
            endDate: e.endDate,
            description: e.description,
            isCurrent: !!e.isCurrent
          }))
        } : undefined,
        education: education ? {
          deleteMany: {},
          create: education.map((ed: any) => ({
            institution: ed.institution,
            degree: ed.degree,
            field: ed.field,
            graduationDate: ed.graduationDate,
            gpa: ed.gpa,
            graduationType: ed.graduationType
          }))
        } : undefined,
        projects: projects ? {
          deleteMany: {},
          create: projects.map((p: any) => ({
            name: p.name,
            techStack: p.techStack,
            description: p.description,
            isGithubSynced: !!p.isGithubSynced
          }))
        } : undefined,
      },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
      }
    });
  }
  static async getAllUsers(limit = 20) {
    return prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: { name: true, logoUrl: true }
        }
      }
    });
  }

  static async searchUsersAndCompanies(query: string) {
    // Strip '#' prefix and trim
    let cleanQuery = query.trim();
    if (cleanQuery.startsWith('#')) cleanQuery = cleanQuery.slice(1);
    
    if (!cleanQuery) return { users: [], companies: [] };

    const [users, companies] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { id: { equals: cleanQuery.length === 36 ? cleanQuery : undefined, mode: 'insensitive' } },
            { firstName: { contains: cleanQuery, mode: 'insensitive' } },
            { lastName: { contains: cleanQuery, mode: 'insensitive' } },
            { shortId: { contains: cleanQuery, mode: 'insensitive' } },
            { email: { contains: cleanQuery, mode: 'insensitive' } },
            { jobTitle: { contains: cleanQuery, mode: 'insensitive' } },
            { bio: { contains: cleanQuery, mode: 'insensitive' } },
            { location: { contains: cleanQuery, mode: 'insensitive' } },
            // Search by full name combo
            {
              AND: [
                { firstName: { contains: cleanQuery.split(' ')[0], mode: 'insensitive' } },
                { lastName: { contains: cleanQuery.split(' ')[1] || '', mode: 'insensitive' } }
              ]
            }
          ],
        },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          shortId: true,
          jobTitle: true,
          email: true,
        },
      }),
      prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { industry: { contains: cleanQuery, mode: 'insensitive' } },
            { description: { contains: cleanQuery, mode: 'insensitive' } },
            { website: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          logoUrl: true,
          industry: true,
        },
      }),
    ]);

    // De-duplicate results if same user found via multiple conditions (Prisma handles OR de-duplication mostly, but good to be safe)
    return { users, companies };
  }
}
