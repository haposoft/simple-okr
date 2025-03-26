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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const objective = objectives.find(obj => obj.id === params.id);
    
    if (!objective) {
      return NextResponse.json(
        { message: 'Objective not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(objective);
  } catch (error) {
    console.error('Error fetching objective:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    // Check if objective exists
    const objectiveIndex = objectives.findIndex(obj => obj.id === params.id);
    
    if (objectiveIndex === -1) {
      return NextResponse.json(
        { message: 'Objective not found' },
        { status: 404 }
      );
    }
    
    // Update objective (would be a database update in production)
    const updatedObjective = {
      ...objectives[objectiveIndex],
      title: data.title,
      description: data.description || objectives[objectiveIndex].description,
      type: data.type,
      status: data.status || objectives[objectiveIndex].status,
      startDate: data.startDate,
      endDate: data.endDate,
      departmentId: data.departmentId,
      progress: data.progress || objectives[objectiveIndex].progress
    };
    
    // For mock data purposes only
    objectives[objectiveIndex] = updatedObjective;
    
    return NextResponse.json(updatedObjective);
  } catch (error) {
    console.error('Error updating objective:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Check if objective exists
    const objectiveIndex = objectives.findIndex(obj => obj.id === params.id);
    
    if (objectiveIndex === -1) {
      return NextResponse.json(
        { message: 'Objective not found' },
        { status: 404 }
      );
    }
    
    // Delete objective (would be a database delete in production)
    const deletedObjective = objectives[objectiveIndex];
    
    // For mock data purposes only
    objectives.splice(objectiveIndex, 1);
    
    return NextResponse.json({ success: true, deletedObjective });
  } catch (error) {
    console.error('Error deleting objective:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 