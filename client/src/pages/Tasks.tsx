import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { getPriorityClass, getLabelForPriority, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";

export default function Tasks() {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'due_soon' | 'upcoming'>('all');
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks = tasks?.filter(task => {
    if (filterStatus === 'pending' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  }) || [];

  const pendingCount = tasks?.filter(t => !t.completed).length || 0;
  const completedCount = tasks?.filter(t => t.completed).length || 0;

  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Financial Tasks
            </h1>
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{pendingCount} pending • {completedCount} completed</span>
            </div>
          </div>
          <Button onClick={() => setShowNewTaskForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 md:px-8 mt-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="status-filter">Status:</Label>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="priority-filter">Priority:</Label>
            <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="due_soon">Due Soon</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="px-4 sm:px-6 md:px-8 mt-6">
          <NewTaskForm onClose={() => setShowNewTaskForm(false)} />
        </div>
      )}

      {/* Tasks List */}
      <div className="px-4 sm:px-6 md:px-8 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              Manage your financial tasks and priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <TaskItemSkeleton />
                <TaskItemSkeleton />
                <TaskItemSkeleton />
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tasks found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface TaskItemProps {
  task: Task;
}

function TaskItem({ task }: TaskItemProps) {
  const queryClient = useQueryClient();
  
  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiRequest("PATCH", `/api/tasks/${taskId}`, {
        completed: !task.completed
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiRequest("DELETE", `/api/tasks/${taskId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
  });

  const handleToggleTask = () => {
    toggleTaskMutation.mutate(task.id);
  };

  const handleDeleteTask = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const priorityClass = getPriorityClass(task.priority ?? undefined);
  const priorityLabel = getLabelForPriority(task.priority ?? undefined);

  return (
    <div className={`border rounded-lg p-4 ${task.completed ? 'opacity-60 bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Checkbox 
            checked={task.completed ?? false} 
            onCheckedChange={handleToggleTask}
            disabled={toggleTaskMutation.isPending}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                {task.title}
              </h3>
              <Badge variant="outline" className={priorityClass}>
                {priorityLabel}
              </Badge>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {task.description}
              </p>
            )}
            {task.dueDate && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Due: {formatDate(task.dueDate)}
              </p>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDeleteTask}
          disabled={deleteTaskMutation.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

function NewTaskForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'upcoming' as 'urgent' | 'due_soon' | 'upcoming',
    dueDate: ''
  });
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/tasks", {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    createTaskMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="due_soon">Due Soon</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function TaskItemSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Skeleton className="h-4 w-4 rounded mt-1" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}