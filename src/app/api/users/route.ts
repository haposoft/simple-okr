import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock data - thay thế bằng DB query trong môi trường production
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: '/avatars/avatar1.png',
    role: 'ADMIN',
    departments: [
      { id: '1', userId: '1', departmentId: '1', role: 'MANAGER', isPrimary: true }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    image: '/avatars/avatar2.png',
    role: 'USER',
    departments: [
      { id: '2', userId: '2', departmentId: '2', role: 'MANAGER', isPrimary: true }
    ]
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    image: '/avatars/avatar3.png',
    role: 'USER',
    departments: [
      { id: '3', userId: '3', departmentId: '3', role: 'MANAGER', isPrimary: true }
    ]
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    image: '/avatars/avatar4.png',
    role: 'USER',
    departments: [
      { id: '4', userId: '4', departmentId: '1', role: 'MEMBER', isPrimary: true }
    ]
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    image: '/avatars/avatar5.png',
    role: 'USER',
    departments: [
      { id: '5', userId: '5', departmentId: '2', role: 'MEMBER', isPrimary: true }
    ]
  },
  {
    id: '6',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    image: '/avatars/avatar6.png',
    role: 'USER',
    departments: [
      { id: '6', userId: '6', departmentId: '3', role: 'MEMBER', isPrimary: true }
    ]
  }
];

// Lấy danh sách người dùng
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
  const email = searchParams.get('email');
  
  try {
    let filteredUsers = [...users];
    
    // Add current user to the list if not already present
    const currentUserEmail = session.user?.email;
    if (currentUserEmail && !filteredUsers.some(user => user.email === currentUserEmail)) {
      const currentUser = {
        id: (filteredUsers.length + 1).toString(),
        name: session.user?.name || 'Current User',
        email: currentUserEmail,
        image: session.user?.image || '/avatars/default.png',
        role: 'USER',
        departments: []
      };
      filteredUsers.push(currentUser);
    }
    
    if (email) {
      filteredUsers = filteredUsers.filter(user => user.email === email);
    }
    
    if (departmentId) {
      filteredUsers = filteredUsers.filter(user => 
        user.departments?.some(dept => dept.departmentId === departmentId)
      );
    }
    
    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cập nhật thông tin người dùng
export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, role, ...userData } = body;
    
    // Tìm user trong mock data
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user data (chỉ là mock nên sẽ không lưu lại thực sự)
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      role: role || users[userIndex].role
    };
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
  
  // Check if user has admin role
  const currentUserEmail = session.user?.email;
  const currentUser = users.find(user => user.email === currentUserEmail);
  
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Admin privileges required' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user with email already exists
    if (users.some(user => user.email === data.email)) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user (would be a database insert in production)
    const newUser = {
      id: (users.length + 1).toString(),
      name: data.name,
      email: data.email,
      image: data.image || '/avatars/default.png',
      role: data.role || 'USER',
      departments: data.departments || []
    };
    
    users.push(newUser);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 