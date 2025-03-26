import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { Department, Objective, DepartmentProgress, MonthlyProgress, ReportData } from '@/types';

const prisma = new PrismaClient();

// Giả lập dữ liệu từ cơ sở dữ liệu
const mockObjectives = [
  { id: '1', title: 'Tăng doanh thu 20%', status: 'COMPLETED', createdAt: '2023-01-15', departmentId: '1' },
  { id: '2', title: 'Giảm chi phí 10%', status: 'ACTIVE', createdAt: '2023-02-10', departmentId: '1' },
  { id: '3', title: 'Tăng chất lượng sản phẩm', status: 'ACTIVE', createdAt: '2023-01-05', departmentId: '2' },
  { id: '4', title: 'Tăng số lượng khách hàng', status: 'DRAFT', createdAt: '2023-03-01', departmentId: '3' },
  { id: '5', title: 'Mở rộng thị trường', status: 'COMPLETED', createdAt: '2023-02-15', departmentId: '3' },
  { id: '6', title: 'Nâng cao kỹ năng nhân viên', status: 'ACTIVE', createdAt: '2023-01-20', departmentId: '4' },
  { id: '7', title: 'Cải thiện văn hóa công ty', status: 'COMPLETED', createdAt: '2023-03-10', departmentId: '4' },
  { id: '8', title: 'Triển khai công nghệ mới', status: 'DRAFT', createdAt: '2023-02-05', departmentId: '1' },
  { id: '9', title: 'Tối ưu hóa quy trình', status: 'ACTIVE', createdAt: '2023-01-10', departmentId: '2' },
  { id: '10', title: 'Xây dựng thương hiệu', status: 'COMPLETED', createdAt: '2023-03-15', departmentId: '3' },
  { id: '11', title: 'Phát triển sản phẩm mới', status: 'ACTIVE', createdAt: '2023-01-25', departmentId: '2' },
  { id: '12', title: 'Tăng cường bảo mật', status: 'COMPLETED', createdAt: '2023-02-20', departmentId: '1' },
  { id: '13', title: 'Cải thiện dịch vụ khách hàng', status: 'ACTIVE', createdAt: '2023-03-05', departmentId: '3' },
  { id: '14', title: 'Tối ưu hóa chuỗi cung ứng', status: 'DRAFT', createdAt: '2023-01-30', departmentId: '2' },
  { id: '15', title: 'Xây dựng đội ngũ lãnh đạo', status: 'COMPLETED', createdAt: '2023-02-25', departmentId: '4' },
  { id: '16', title: 'Tăng cường R&D', status: 'ACTIVE', createdAt: '2023-03-20', departmentId: '1' },
  { id: '17', title: 'Mở rộng kênh phân phối', status: 'DRAFT', createdAt: '2023-01-07', departmentId: '3' },
  { id: '18', title: 'Cải thiện môi trường làm việc', status: 'COMPLETED', createdAt: '2023-02-17', departmentId: '4' },
  { id: '19', title: 'Tối ưu hóa chi phí vận hành', status: 'ACTIVE', createdAt: '2023-03-12', departmentId: '2' },
  { id: '20', title: 'Phát triển thị trường quốc tế', status: 'DRAFT', createdAt: '2023-01-22', departmentId: '3' },
  { id: '21', title: 'Tăng độ nhận diện thương hiệu', status: 'COMPLETED', createdAt: '2023-02-27', departmentId: '3' },
  { id: '22', title: 'Phát triển ứng dụng di động', status: 'ACTIVE', createdAt: '2023-03-17', departmentId: '1' },
  { id: '23', title: 'Cải thiện SEO', status: 'DRAFT', createdAt: '2023-01-17', departmentId: '2' },
  { id: '24', title: 'Tối ưu hóa UX/UI', status: 'COMPLETED', createdAt: '2023-02-22', departmentId: '1' },
];

const mockDepartments = [
  { id: '1', name: 'Engineering' },
  { id: '2', name: 'Marketing' },
  { id: '3', name: 'Sales' },
  { id: '4', name: 'HR' },
];

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || 'month';
  const departmentId = searchParams.get('departmentId');

  // Lọc mục tiêu theo khoảng thời gian
  let filteredObjectives = [...mockObjectives];
  const currentDate = new Date();
  
  if (timeRange === 'month') {
    // Lọc trong 1 tháng
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    filteredObjectives = filteredObjectives.filter(obj => 
      new Date(obj.createdAt) >= oneMonthAgo
    );
  } else if (timeRange === 'quarter') {
    // Lọc trong 3 tháng
    const threeMonthsAgo = new Date(currentDate);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    filteredObjectives = filteredObjectives.filter(obj => 
      new Date(obj.createdAt) >= threeMonthsAgo
    );
  } else if (timeRange === 'year') {
    // Lọc trong 1 năm
    const oneYearAgo = new Date(currentDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    filteredObjectives = filteredObjectives.filter(obj => 
      new Date(obj.createdAt) >= oneYearAgo
    );
  }

  // Lọc theo phòng ban nếu có
  if (departmentId) {
    filteredObjectives = filteredObjectives.filter(obj => 
      obj.departmentId === departmentId
    );
  }

  // Tính toán dữ liệu thống kê
  const totalObjectives = filteredObjectives.length;
  const completedObjectives = filteredObjectives.filter(obj => obj.status === 'COMPLETED').length;
  const activeObjectives = filteredObjectives.filter(obj => obj.status === 'ACTIVE').length;

  // Tính toán tiến độ theo phòng ban
  const departmentProgress = mockDepartments.map(dept => {
    const deptObjectives = filteredObjectives.filter(obj => obj.departmentId === dept.id);
    const completed = deptObjectives.filter(obj => obj.status === 'COMPLETED').length;
    const progress = deptObjectives.length > 0 
      ? Math.round((completed / deptObjectives.length) * 100) 
      : 0;
    
    return {
      departmentName: dept.name,
      progress
    };
  });

  // Tính toán tiến độ theo tháng
  const monthlyProgress = [];
  if (timeRange === 'month' || timeRange === 'quarter') {
    // Tạo dữ liệu cho từng tuần
    const weeks = timeRange === 'month' ? 4 : 12;
    
    for (let i = 0; i < weeks; i++) {
      const weekAgo = new Date(currentDate);
      weekAgo.setDate(weekAgo.getDate() - (7 * i));
      const weekLabel = `W${weeks - i}`;
      
      const weekObjectives = filteredObjectives.filter(obj => {
        const objDate = new Date(obj.createdAt);
        const weekStart = new Date(weekAgo);
        weekStart.setDate(weekStart.getDate() - 7);
        return objDate >= weekStart && objDate <= weekAgo;
      });
      
      const completed = weekObjectives.filter(obj => obj.status === 'COMPLETED').length;
      const progress = weekObjectives.length > 0 
        ? Math.round((completed / weekObjectives.length) * 100) 
        : 0;
      
      monthlyProgress.push({
        month: weekLabel,
        progress
      });
    }
  } else {
    // Tạo dữ liệu cho từng tháng
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = currentDate.getMonth();
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthLabel = months[monthIndex];
      
      const monthObjectives = filteredObjectives.filter(obj => {
        const objDate = new Date(obj.createdAt);
        return objDate.getMonth() === monthIndex;
      });
      
      const completed = monthObjectives.filter(obj => obj.status === 'COMPLETED').length;
      const progress = monthObjectives.length > 0 
        ? Math.round((completed / monthObjectives.length) * 100) 
        : 0;
      
      monthlyProgress.push({
        month: monthLabel,
        progress
      });
    }
  }

  // Đảo ngược mảng để hiển thị theo thứ tự thời gian tăng dần
  monthlyProgress.reverse();

  const reportData: ReportData = {
    totalObjectives,
    completedObjectives,
    activeObjectives,
    departmentProgress,
    monthlyProgress,
  };

  return NextResponse.json(reportData);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Trong thực tế, tại đây sẽ lưu vào cơ sở dữ liệu
    console.log('Received report creation request:', body);
    
    // Trả về ID giả lập
    return NextResponse.json({
      id: Math.random().toString(36).substring(2, 9),
      ...body,
      createdAt: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 