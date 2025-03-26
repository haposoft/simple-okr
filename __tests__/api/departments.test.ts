import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/departments/route';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    department: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Departments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/departments', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const response = await GET(new NextRequest('http://localhost:3000/api/departments'));
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should return departments list for authenticated user', async () => {
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
        },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      
      const mockDepartments = [
        { id: '1', name: 'Engineering' },
        { id: '2', name: 'Marketing' },
      ];
      (prisma.department.findMany as jest.Mock).mockResolvedValue(mockDepartments);
      
      const response = await GET(new NextRequest('http://localhost:3000/api/departments'));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(mockDepartments);
    });
  });

  describe('POST /api/departments', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/departments', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Department' }),
      });
      
      const response = await POST(request);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should create a new department', async () => {
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
        },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      
      const newDepartment = {
        name: 'New Department',
        description: 'Department description',
      };
      
      const mockCreatedDepartment = {
        id: '1',
        ...newDepartment,
      };
      
      (prisma.department.create as jest.Mock).mockResolvedValue(mockCreatedDepartment);
      
      const request = new NextRequest('http://localhost:3000/api/departments', {
        method: 'POST',
        body: JSON.stringify(newDepartment),
      });
      
      const response = await POST(request);
      expect(response.status).toBe(201);
      expect(await response.json()).toEqual(mockCreatedDepartment);
    });

    it('should return 400 if department name is missing', async () => {
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
        },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      
      const request = new NextRequest('http://localhost:3000/api/departments', {
        method: 'POST',
        body: JSON.stringify({ description: 'Department description' }),
      });
      
      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Department name is required' });
    });
  });
}); 