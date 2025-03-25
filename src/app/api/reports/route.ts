import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { Department, Objective, DepartmentProgress, MonthlyProgress, ReportData } from '@/types';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    // Get total objectives count
    const totalObjectives = await prisma.objective.count();

    // Get completed objectives count
    const completedObjectives = await prisma.objective.count({
      where: {
        status: 'COMPLETED',
      },
    });

    // Get active objectives count
    const activeObjectives = await prisma.objective.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Get department progress
    const departments = await prisma.department.findMany({
      include: {
        objectives: true,
      },
    });

    const departmentProgress = departments.map((dept: Department) => {
      const totalDeptObjectives = dept.objectives.length;
      const completedDeptObjectives = dept.objectives.filter((obj: Objective) => obj.status === 'COMPLETED').length;
      const progress = totalDeptObjectives > 0 
        ? Math.round((completedDeptObjectives / totalDeptObjectives) * 100)
        : 0;

      return {
        departmentName: dept.name,
        progress,
      };
    });

    // Get monthly progress
    const startDate = new Date();
    switch (timeRange) {
      case 'month':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const monthlyObjectives = await prisma.objective.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group objectives by month
    const monthlyProgress = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthObjectives = monthlyObjectives.filter((obj: Objective) => {
        const objDate = new Date(obj.createdAt);
        return objDate.getMonth() === month.getMonth() &&
               objDate.getFullYear() === month.getFullYear();
      });

      const completedInMonth = monthObjectives.filter((obj: Objective) => obj.status === 'COMPLETED').length;
      const progress = monthObjectives.length > 0
        ? Math.round((completedInMonth / monthObjectives.length) * 100)
        : 0;

      return {
        month: month.toLocaleString('vi-VN', { month: 'short' }),
        progress,
      };
    }).reverse();

    const reportData: ReportData = {
      totalObjectives,
      completedObjectives,
      activeObjectives,
      departmentProgress,
      monthlyProgress,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 