import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Mock data - sẽ được thay đổi theo các thao tác nhưng không được lưu giữa các request
let mockUserDepartments = [
  {
    id: 'user-dept-1',
    userId: 'user1',
    departmentId: 'dept1',
    isPrimary: true,
    role: 'MANAGER',
    user: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://ui-avatars.com/api/?name=John+Doe',
      role: 'ADMIN'
    },
    department: {
      id: 'dept1',
      name: 'Engineering',
      description: 'Software Engineering Department'
    }
  },
  {
    id: 'user-dept-2',
    userId: 'user1',
    departmentId: 'dept2',
    isPrimary: false,
    role: 'MEMBER',
    user: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://ui-avatars.com/api/?name=John+Doe',
      role: 'ADMIN'
    },
    department: {
      id: 'dept2',
      name: 'Product',
      description: 'Product Management'
    }
  },
  {
    id: 'user-dept-3',
    userId: 'user2',
    departmentId: 'dept2',
    isPrimary: true,
    role: 'LEADER',
    user: {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      image: 'https://ui-avatars.com/api/?name=Jane+Smith',
      role: 'MANAGER'
    },
    department: {
      id: 'dept2',
      name: 'Product',
      description: 'Product Management'
    }
  },
  {
    id: 'user-dept-4',
    userId: 'user3',
    departmentId: 'dept1',
    isPrimary: true,
    role: 'MEMBER',
    user: {
      id: 'user3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      image: 'https://ui-avatars.com/api/?name=Bob+Johnson',
      role: 'USER'
    },
    department: {
      id: 'dept1',
      name: 'Engineering',
      description: 'Software Engineering Department'
    }
  },
  {
    id: 'user-dept-5',
    userId: 'user5',
    departmentId: 'dept3',
    isPrimary: true,
    role: 'MANAGER',
    user: {
      id: 'user5',
      name: 'David Lee',
      email: 'david@example.com',
      image: 'https://ui-avatars.com/api/?name=David+Lee',
      role: 'MANAGER'
    },
    department: {
      id: 'dept3',
      name: 'Marketing',
      description: 'Marketing Department'
    }
  }
];

// Hàm tiện ích để tạo ID độc nhất
function generateId() {
  return 'ud-' + Math.random().toString(36).substring(2, 11);
}

// Thêm người dùng vào phòng ban
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, departmentId, isPrimary = false, role = 'MEMBER' } = body;
    
    if (!userId || !departmentId) {
      return NextResponse.json(
        { error: 'userId and departmentId are required' }, 
        { status: 400 }
      );
    }
    
    // Kiểm tra xem user đã có trong phòng ban này chưa
    const existingUserDept = mockUserDepartments.find(
      ud => ud.userId === userId && ud.departmentId === departmentId
    );
    
    if (existingUserDept) {
      return NextResponse.json(
        { error: 'User already assigned to this department' }, 
        { status: 409 }
      );
    }
    
    // Nếu đánh dấu là phòng ban chính, cập nhật tất cả các phòng ban khác thành không phải phòng ban chính
    if (isPrimary) {
      mockUserDepartments = mockUserDepartments.map(ud => {
        if (ud.userId === userId && ud.isPrimary) {
          return { ...ud, isPrimary: false };
        }
        return ud;
      });
    }
    
    // Tìm user từ users/route.ts để lấy thông tin (giả lập)
    const mockUser = {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      image: `https://ui-avatars.com/api/?name=User+${userId}`,
      role: 'USER'
    };
    
    // Tìm department từ departments/route.ts để lấy thông tin (giả lập)
    const mockDepartment = {
      id: departmentId,
      name: `Department ${departmentId}`,
      description: `Description for department ${departmentId}`
    };
    
    // Thêm người dùng vào phòng ban
    const newUserDepartment = {
      id: generateId(),
      userId,
      departmentId,
      isPrimary,
      role,
      user: mockUser,
      department: mockDepartment
    };
    
    mockUserDepartments.push(newUserDepartment);
    
    return NextResponse.json(newUserDepartment, { status: 201 });
  } catch (error: any) {
    console.error('Error adding user to department:', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Cập nhật thông tin người dùng trong phòng ban
export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, departmentId, isPrimary, role } = body;
    
    if (!userId || !departmentId) {
      return NextResponse.json(
        { error: 'userId and departmentId are required' }, 
        { status: 400 }
      );
    }
    
    // Tìm user department để cập nhật
    const userDeptIndex = mockUserDepartments.findIndex(
      ud => ud.userId === userId && ud.departmentId === departmentId
    );
    
    if (userDeptIndex === -1) {
      return NextResponse.json(
        { error: 'User not found in this department' }, 
        { status: 404 }
      );
    }
    
    // Nếu đánh dấu là phòng ban chính, cập nhật tất cả các phòng ban khác thành không phải phòng ban chính
    if (isPrimary) {
      mockUserDepartments = mockUserDepartments.map(ud => {
        if (ud.userId === userId && ud.isPrimary && ud.departmentId !== departmentId) {
          return { ...ud, isPrimary: false };
        }
        return ud;
      });
    }
    
    // Cập nhật phòng ban của người dùng
    const updatedUserDept = {
      ...mockUserDepartments[userDeptIndex],
      isPrimary: isPrimary !== undefined ? isPrimary : mockUserDepartments[userDeptIndex].isPrimary,
      role: role || mockUserDepartments[userDeptIndex].role
    };
    
    mockUserDepartments[userDeptIndex] = updatedUserDept;
    
    return NextResponse.json(updatedUserDept);
  } catch (error) {
    console.error('Error updating user department:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// Xóa người dùng khỏi phòng ban
export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const departmentId = searchParams.get('departmentId');
    
    if (!userId || !departmentId) {
      return NextResponse.json(
        { error: 'userId and departmentId are required' }, 
        { status: 400 }
      );
    }
    
    // Kiểm tra xem user department có tồn tại không
    const userDeptIndex = mockUserDepartments.findIndex(
      ud => ud.userId === userId && ud.departmentId === departmentId
    );
    
    if (userDeptIndex === -1) {
      return NextResponse.json(
        { error: 'User not found in this department' }, 
        { status: 404 }
      );
    }
    
    // Xóa người dùng khỏi phòng ban
    mockUserDepartments = mockUserDepartments.filter(
      ud => !(ud.userId === userId && ud.departmentId === departmentId)
    );
    
    return NextResponse.json(
      { message: 'User removed from department successfully' }
    );
  } catch (error) {
    console.error('Error removing user from department:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 