import { NextResponse } from 'next/server';
import { AIPersona } from '@/lib/types/dashboard';

// Mock data - replace with actual database queries
const mockAIPersonas: AIPersona[] = [
  {
    id: 'persona-1',
    name: 'Sales Pro',
    description: 'Professional sales representative with expertise in B2B sales'
  },
  {
    id: 'persona-2',
    name: 'Marketing Expert',
    description: 'Creative marketing professional focused on brand awareness'
  },
  {
    id: 'persona-3',
    name: 'Customer Success',
    description: 'Friendly customer success manager focused on relationship building'
  },
  {
    id: 'persona-4',
    name: 'Technical Consultant',
    description: 'Technical expert with deep product knowledge'
  }
];

export async function GET() {
  try {
    // In a real implementation, you would query your database
    // SELECT * FROM ai_personas WHERE company_id = ? OR is_global = true
    
    return NextResponse.json(mockAIPersonas);
  } catch (error) {
    console.error('AI personas error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 