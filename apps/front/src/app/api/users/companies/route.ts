import { NextResponse } from 'next/server';
import { Company } from '@/lib/types/dashboard';

export async function GET() {
  try {
    // In a real implementation, you would query your database
    // SELECT * FROM companies WHERE id IN (SELECT company_id FROM user_companies WHERE user_id = ?)
    
    const mockCompanies: Company[] = [
      {
        id: 'company-1',
        name: 'Acme Corp',
        isActive: true
      },
      {
        id: 'company-2',
        name: 'TechStart Inc',
        isActive: true
      },
      {
        id: 'company-3',
        name: 'Global Solutions',
        isActive: false
      }
    ];
    
    return NextResponse.json(mockCompanies);
  } catch (error) {
    console.error('Companies error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 