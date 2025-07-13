export declare class AdminActionLogResponseDto {
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    details: Record<string, any> | null;
    performedBy: string;
    timestamp: Date;
    performedByUser?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}
export declare class AdminActionLogListResponseDto {
    logs: AdminActionLogResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class AdminActionLogFilterDto {
    action?: string;
    targetType?: string;
    targetId?: string;
    performedBy?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
}
