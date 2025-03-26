import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock data - thay thế bằng DB query trong môi trường production
const departments = [
  {
    id: '1',
    name: 'Software Development',
    description: 'Software development, architecture and engineering',
    parentId: null
  },
  {
    id: '2',
    name: 'HR',
    description: 'Human resources and talent management',
    parentId: null
  },
  {
    id: '3',
    name: 'Sales&Marketing',
    description: 'Sales, marketing and customer relations',
    parentId: null
  }
];

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');

  // Lọc theo parentId nếu có
  let filteredDepartments = [...departments];
  if (parentId) {
    filteredDepartments = filteredDepartments.filter(dept => dept.parentId === parentId);
  }

  return NextResponse.json(filteredDepartments);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Xác thực dữ liệu đầu vào
    if (!body.name) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }
    
    // Trong thực tế, tại đây sẽ lưu vào cơ sở dữ liệu
    console.log('Received department creation request:', body);
    
    // Trả về ID giả lập và dữ liệu đã tạo
    const newDepartment = {
      id: (departments.length + 1).toString(),
      name: body.name,
      description: body.description || '',
      parentId: body.parentId || null,
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 