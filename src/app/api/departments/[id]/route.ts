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
    const department = departments.find(dept => dept.id === params.id);
    
    if (!department) {
      return NextResponse.json(
        { message: 'Department not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
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
    if (!data.name) {
      return NextResponse.json(
        { message: 'Department name is required' },
        { status: 400 }
      );
    }
    
    // Check if department exists
    const departmentIndex = departments.findIndex(dept => dept.id === params.id);
    
    if (departmentIndex === -1) {
      return NextResponse.json(
        { message: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Update department (would be a database update in production)
    const updatedDepartment = {
      ...departments[departmentIndex],
      name: data.name,
      description: data.description,
      parentId: data.parentId
    };
    
    // For mock data purposes only
    departments[departmentIndex] = updatedDepartment;
    
    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error('Error updating department:', error);
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
    // Check if department exists
    const departmentIndex = departments.findIndex(dept => dept.id === params.id);
    
    if (departmentIndex === -1) {
      return NextResponse.json(
        { message: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Check if department has children
    const hasChildren = departments.some(dept => dept.parentId === params.id);
    
    if (hasChildren) {
      return NextResponse.json(
        { message: 'Cannot delete department with sub-departments' },
        { status: 400 }
      );
    }
    
    // Delete department (would be a database delete in production)
    const deletedDepartment = departments[departmentIndex];
    
    // For mock data purposes only
    departments.splice(departmentIndex, 1);
    
    return NextResponse.json({ success: true, deletedDepartment });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 