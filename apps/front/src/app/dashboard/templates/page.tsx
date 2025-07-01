import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar,
  Eye,
  Copy,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Star
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const templates = [
  {
    id: 1,
    name: "Welcome Email Series",
    category: "Onboarding",
    description: "3-part welcome series for new subscribers",
    lastUsed: "2024-01-15",
    usageCount: 45,
    isFavorite: true,
    status: "active"
  },
  {
    id: 2,
    name: "Weekly Newsletter",
    category: "Newsletter",
    description: "Standard newsletter template with featured content",
    lastUsed: "2024-01-14",
    usageCount: 128,
    isFavorite: true,
    status: "active"
  },
  {
    id: 3,
    name: "Product Launch",
    category: "Promotional",
    description: "Announcement template for new product launches",
    lastUsed: "2024-01-12",
    usageCount: 23,
    isFavorite: false,
    status: "active"
  },
  {
    id: 4,
    name: "Abandoned Cart",
    category: "Transactional",
    description: "Reminder email for abandoned shopping carts",
    lastUsed: "2024-01-10",
    usageCount: 67,
    isFavorite: false,
    status: "active"
  },
  {
    id: 5,
    name: "Holiday Sale",
    category: "Promotional",
    description: "Seasonal promotional template with discount codes",
    lastUsed: "2023-12-20",
    usageCount: 12,
    isFavorite: false,
    status: "archived"
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Onboarding":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "Newsletter":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
    case "Promotional":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800";
    case "Transactional":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
    case "archived":
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
  }
};

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Templates</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage your email templates and designs</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="border-0 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getCategoryColor(template.category)} border text-xs`}>
                        {template.category}
                      </Badge>
                      <Badge className={`${getStatusColor(template.status)} border text-xs`}>
                        {template.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {template.isFavorite && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {template.description}
              </p>
              <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Used {new Date(template.lastUsed).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{template.usageCount} times</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Use Template
                </Button>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Templates
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">5</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Active templates
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Most Used
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-sm">
              <Star className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">128</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Weekly Newsletter
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Favorites
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-sm">
              <Star className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">2</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Starred templates
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Categories
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">4</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Template types
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 