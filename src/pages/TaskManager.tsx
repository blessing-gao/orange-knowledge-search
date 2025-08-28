
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/types/api";

const TaskManager = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Mock data for demonstration
  const mockTasks: Task[] = [
    {
      id: 'task_1',
      type: 'index',
      title: '重建知识库索引',
      description: '正在为API技术文档知识库重建全文搜索索引',
      status: 'running',
      progress: 65,
      knowledge_base_id: 'kb_1',
      created_at: '2024-01-20T10:30:00Z',
      updated_at: '2024-01-20T10:45:00Z'
    },
    {
      id: 'task_2',
      type: 'upload',
      title: '批量文档上传',
      description: '上传25个PDF文件到产品设计资料知识库',
      status: 'completed',
      progress: 100,
      knowledge_base_id: 'kb_2',
      created_at: '2024-01-20T09:15:00Z',
      updated_at: '2024-01-20T09:45:00Z',
      completed_at: '2024-01-20T09:45:00Z'
    },
    {
      id: 'task_3',
      type: 'delete',
      title: '删除过期文档',
      description: '清理培训视频库中超过6个月未使用的文件',
      status: 'failed',
      progress: 30,
      knowledge_base_id: 'kb_3',
      created_at: '2024-01-20T08:00:00Z',
      updated_at: '2024-01-20T08:15:00Z',
      error_message: '权限不足，无法删除受保护的文件'
    },
    {
      id: 'task_4',
      type: 'rebuild',
      title: '全量重建索引',
      description: '为所有知识库执行全量索引重建操作',
      status: 'pending',
      progress: 0,
      created_at: '2024-01-20T11:00:00Z',
      updated_at: '2024-01-20T11:00:00Z'
    },
    {
      id: 'task_5',
      type: 'upload',
      title: '视频文件处理',
      description: '对新上传的培训视频进行转码和切片处理',
      status: 'completed',
      progress: 100,
      knowledge_base_id: 'kb_3',
      created_at: '2024-01-19T16:20:00Z',
      updated_at: '2024-01-19T17:10:00Z',
      completed_at: '2024-01-19T17:10:00Z'
    }
  ];

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'index':
        return 'bg-purple-100 text-purple-700';
      case 'upload':
        return 'bg-blue-100 text-blue-700';
      case 'delete':
        return 'bg-red-100 text-red-700';
      case 'rebuild':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeName = (type: Task['type']) => {
    switch (type) {
      case 'index': return '索引';
      case 'upload': return '上传';
      case 'delete': return '删除';
      case 'rebuild': return '重建';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterTasks = (tasks: Task[], filter: string) => {
    switch (filter) {
      case 'running':
        return tasks.filter(t => t.status === 'running');
      case 'completed':
        return tasks.filter(t => t.status === 'completed');
      case 'failed':
        return tasks.filter(t => t.status === 'failed');
      case 'pending':
        return tasks.filter(t => t.status === 'pending');
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasks(mockTasks, activeTab);

  const getTaskStats = () => {
    return {
      all: mockTasks.length,
      running: mockTasks.filter(t => t.status === 'running').length,
      completed: mockTasks.filter(t => t.status === 'completed').length,
      failed: mockTasks.filter(t => t.status === 'failed').length,
      pending: mockTasks.filter(t => t.status === 'pending').length
    };
  };

  const stats = getTaskStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-red-50 via-white to-orange-red-50/30">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回搜索
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">任务管理</h1>
            </div>
            <Button className="search-gradient">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新状态
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.all}</div>
              <p className="text-sm text-gray-600">总任务</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
              <p className="text-sm text-gray-600">运行中</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-sm text-gray-600">已完成</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-sm text-gray-600">失败</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">等待中</p>
            </CardContent>
          </Card>
        </div>

        {/* Task Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 gap-1 mb-8">
            <TabsTrigger value="all">全部 ({stats.all})</TabsTrigger>
            <TabsTrigger value="running">运行中 ({stats.running})</TabsTrigger>
            <TabsTrigger value="completed">已完成 ({stats.completed})</TabsTrigger>
            <TabsTrigger value="failed">失败 ({stats.failed})</TabsTrigger>
            <TabsTrigger value="pending">等待中 ({stats.pending})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Badge className={`${getStatusColor(task.status)} border`}>
                            {task.status === 'running' ? '运行中' :
                             task.status === 'completed' ? '已完成' :
                             task.status === 'failed' ? '失败' : '等待中'}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            <Badge variant="outline" className={getTypeColor(task.type)}>
                              {getTypeName(task.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          
                          {task.status === 'running' && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">进度</span>
                                <span className="font-medium">{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          )}
                          
                          {task.error_message && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-700">{task.error_message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                        <span>{formatDate(task.updated_at)}</span>
                        {task.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4 mr-1" />
                            启动
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {filteredTasks.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  没有{activeTab === 'all' ? '' : 
                        activeTab === 'running' ? '运行中的' :
                        activeTab === 'completed' ? '已完成的' :
                        activeTab === 'failed' ? '失败的' : '等待中的'}任务
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'all' ? '还没有任何任务记录' : '当前没有符合条件的任务'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TaskManager;
