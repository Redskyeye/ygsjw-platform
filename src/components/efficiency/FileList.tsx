'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Image,
  FileCode,
  Archive,
  Download,
  Trash2,
  Edit2,
  Eye,
  MoreVertical,
  SortAsc,
  SortDesc,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  FileInfo,
  formatFileSize,
  isImageFile,
  isDocumentFile,
  isTextFile,
  isArchiveFile,
  getFileIcon,
} from '@/utils/fileValidation';

export type SortField = 'name' | 'size' | 'uploadedAt' | 'type';
export type SortOrder = 'asc' | 'desc';

interface FileListProps {
  files: FileInfo[];
  onFilesRemove: (fileIds: string[]) => void;
  onFileRename?: (fileId: string, newName: string) => void;
  onFileDownload?: (file: FileInfo) => void;
  onFilePreview?: (file: FileInfo) => void;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  showDownload?: boolean;
}

interface RenameDialogState {
  isOpen: boolean;
  fileId: string | null;
  currentName: string;
  newName: string;
}

interface DeleteDialogState {
  isOpen: boolean;
  fileIds: string[];
  fileNames: string[];
}

export function FileList({
  files,
  onFilesRemove,
  onFileRename,
  onFileDownload,
  onFilePreview,
  className,
  disabled = false,
  showPreview = true,
  showDownload = true,
}: FileListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [renameDialog, setRenameDialog] = useState<RenameDialogState>({
    isOpen: false,
    fileId: null,
    currentName: '',
    newName: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    fileIds: [],
    fileNames: [],
  });

  // 过滤和排序文件
  const filteredAndSortedFiles = useMemo(() => {
    const filtered = files.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 排序
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'uploadedAt':
          aValue = a.uploadedAt.getTime();
          bValue = b.uploadedAt.getTime();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [files, searchQuery, sortField, sortOrder]);

  // 切换排序
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 获取文件图标
  const getFileIconComponent = (file: FileInfo) => {
    const iconClass = 'h-4 w-4';

    if (isImageFile(file)) return <Image className={iconClass} />;
    if (isDocumentFile(file)) return <FileText className={iconClass} />;
    if (isTextFile(file)) return <FileCode className={iconClass} />;
    if (isArchiveFile(file)) return <Archive className={iconClass} />;
    return <FileText className={iconClass} />;
  };

  // 获取文件类型标签颜色
  const getTypeBadgeVariant = (file: FileInfo) => {
    if (isImageFile(file)) return 'default';
    if (isDocumentFile(file)) return 'secondary';
    if (isTextFile(file)) return 'outline';
    if (isArchiveFile(file)) return 'destructive';
    return 'secondary';
  };

  // 选择文件
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredAndSortedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredAndSortedFiles.map(f => f.id)));
    }
  };

  // 重命名文件
  const handleRename = () => {
    if (renameDialog.fileId && renameDialog.newName.trim() && onFileRename) {
      onFileRename(renameDialog.fileId, renameDialog.newName.trim());
      setRenameDialog({ isOpen: false, fileId: null, currentName: '', newName: '' });
    }
  };

  // 删除文件
  const handleDelete = () => {
    if (deleteDialog.fileIds.length > 0) {
      onFilesRemove(deleteDialog.fileIds);
      setDeleteDialog({ isOpen: false, fileIds: [], fileNames: [] });
      setSelectedFiles(new Set());
    }
  };

  // 批量删除选中的文件
  const handleDeleteSelected = () => {
    const selectedFileInfos = files.filter(f => selectedFiles.has(f.id));
    if (selectedFileInfos.length > 0) {
      setDeleteDialog({
        isOpen: true,
        fileIds: selectedFileInfos.map(f => f.id),
        fileNames: selectedFileInfos.map(f => f.name),
      });
    }
  };

  // 单个文件操作
  const handleFileAction = (action: string, file: FileInfo) => {
    switch (action) {
      case 'rename':
        setRenameDialog({
          isOpen: true,
          fileId: file.id,
          currentName: file.name,
          newName: file.name,
        });
        break;
      case 'delete':
        setDeleteDialog({
          isOpen: true,
          fileIds: [file.id],
          fileNames: [file.name],
        });
        break;
      case 'download':
        onFileDownload?.(file);
        break;
      case 'preview':
        onFilePreview?.(file);
        break;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 搜索和操作栏 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">文件列表 ({files.length})</CardTitle>
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  已选择 {selectedFiles.size} 个文件
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  删除选中
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                disabled={disabled || filteredAndSortedFiles.length === 0}
              >
                {selectedFiles.size === filteredAndSortedFiles.length ? '取消全选' : '全选'}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* 排序按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSort('name')}
                className={cn(sortField === 'name' && 'bg-accent')}
              >
                名称
                {sortField === 'name' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSort('size')}
                className={cn(sortField === 'size' && 'bg-accent')}
              >
                大小
                {sortField === 'size' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSort('uploadedAt')}
                className={cn(sortField === 'uploadedAt' && 'bg-accent')}
              >
                上传时间
                {sortField === 'uploadedAt' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文件列表 */}
      {filteredAndSortedFiles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchQuery ? '没有找到匹配的文件' : '暂无文件'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? '尝试修改搜索关键词' : '上传一些文件开始使用'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedFiles.map((file) => (
            <Card
              key={file.id}
              className={cn(
                'transition-colors hover:bg-accent/50',
                selectedFiles.has(file.id) && 'bg-accent border-accent-foreground/20'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* 文件信息 */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* 选择框 */}
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />

                    {/* 文件图标 */}
                    <div className="flex-shrink-0">
                      {getFileIconComponent(file)}
                    </div>

                    {/* 文件详情 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <Badge variant={getTypeBadgeVariant(file)} className="text-xs">
                          {file.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{new Date(file.uploadedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1">
                    {showPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileAction('preview', file)}
                        disabled={disabled}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {showDownload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileAction('download', file)}
                        disabled={disabled}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={disabled}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onFileRename && (
                          <DropdownMenuItem onClick={() => handleFileAction('rename', file)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            重命名
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleFileAction('delete', file)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 重命名对话框 */}
      <AlertDialog open={renameDialog.isOpen} onOpenChange={(open) => !open && setRenameDialog({ isOpen: false, fileId: null, currentName: '', newName: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重命名文件</AlertDialogTitle>
            <AlertDialogDescription>
              为文件 "{renameDialog.currentName}" 输入新名称
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={renameDialog.newName}
            onChange={(e) => setRenameDialog(prev => ({ ...prev, newName: e.target.value }))}
            placeholder="输入新文件名"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename} disabled={!renameDialog.newName.trim()}>
              确认重命名
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, fileIds: [], fileNames: [] })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.fileNames.length === 1 ? (
                <>确定要删除文件 "{deleteDialog.fileNames[0]}" 吗？此操作无法撤销。</>
              ) : (
                <>确定要删除选中的 {deleteDialog.fileNames.length} 个文件吗？此操作无法撤销。</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}