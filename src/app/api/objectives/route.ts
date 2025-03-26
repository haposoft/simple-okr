import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock data - thay thế bằng DB query trong môi trường production
const objectives = [
  {
    id: '1',
    title: 'Phát triển phần mềm quản lý dự án',
    description: 'Xây dựng hệ thống quản lý dự án toàn diện',
    type: 'DEPARTMENT',
    status: 'ACTIVE',
    startDate: '2023-04-01',
    endDate: '2023-06-30',
    departmentId: '1', // Software Development
    progress: 65
  },
  {
    id: '2',
    title: 'Tối ưu hóa quy trình tuyển dụng',
    description: 'Cải thiện quy trình tuyển dụng để tăng hiệu quả',
    type: 'DEPARTMENT',
    status: 'COMPLETED',
    startDate: '2023-02-15',
    endDate: '2023-05-10',
    departmentId: '2', // HR
    progress: 100
  },
  {
    id: '3',
    title: 'Tăng doanh số bán hàng 30%',
    description: 'Thực hiện các chiến dịch marketing và bán hàng mới',
    type: 'DEPARTMENT',
    status: 'ACTIVE',
    startDate: '2023-03-01',
    endDate: '2023-08-30',
    departmentId: '3', // Sales&Marketing
    progress: 45
  }
];

export async function GET(request: Request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get('departmentId');
  
  try {
    let filteredObjectives = objectives;
    
    if (departmentId) {
      filteredObjectives = objectives.filter(obj => obj.departmentId === departmentId);
    }
    
    return NextResponse.json(filteredObjectives);
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.type || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new objective (would be a database insert in production)
    const newObjective = {
      id: (objectives.length + 1).toString(),
      title: data.title,
      description: data.description || '',
      type: data.type,
      status: data.status || 'DRAFT',
      startDate: data.startDate,
      endDate: data.endDate,
      departmentId: data.departmentId,
      progress: data.progress || 0,
      createdAt: new Date().toISOString()
    };
    
    objectives.push(newObjective);
    
    return NextResponse.json(newObjective, { status: 201 });
  } catch (error) {
    console.error('Error creating objective:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 