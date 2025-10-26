/**
 * 文件验证工具
 * 支持文件类型、大小、数量等验证
 */

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = {
  // 图片
  'image/jpeg': { ext: '.jpg', category: 'image', name: 'JPEG图片' },
  'image/png': { ext: '.png', category: 'image', name: 'PNG图片' },
  'image/gif': { ext: '.gif', category: 'image', name: 'GIF图片' },
  'image/webp': { ext: '.webp', category: 'image', name: 'WebP图片' },
  'image/svg+xml': { ext: '.svg', category: 'image', name: 'SVG矢量图' },

  // 文档
  'application/pdf': { ext: '.pdf', category: 'document', name: 'PDF文档' },
  'application/msword': { ext: '.doc', category: 'document', name: 'Word文档' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    ext: '.docx',
    category: 'document',
    name: 'Word文档'
  },
  'application/vnd.ms-excel': { ext: '.xls', category: 'document', name: 'Excel表格' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    ext: '.xlsx',
    category: 'document',
    name: 'Excel表格'
  },
  'application/vnd.ms-powerpoint': { ext: '.ppt', category: 'document', name: 'PowerPoint演示文稿' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    ext: '.pptx',
    category: 'document',
    name: 'PowerPoint演示文稿'
  },

  // 文本
  'text/plain': { ext: '.txt', category: 'text', name: '纯文本' },
  'text/csv': { ext: '.csv', category: 'text', name: 'CSV表格' },
  'application/json': { ext: '.json', category: 'text', name: 'JSON文件' },
  'text/markdown': { ext: '.md', category: 'text', name: 'Markdown文档' },

  // 压缩文件
  'application/zip': { ext: '.zip', category: 'archive', name: 'ZIP压缩包' },
  'application/x-rar-compressed': { ext: '.rar', category: 'archive', name: 'RAR压缩包' },
  'application/x-7z-compressed': { ext: '.7z', category: 'archive', name: '7Z压缩包' },
};

// 文件限制配置
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_COUNT: 20,
  MAX_TOTAL_SIZE: 100 * 1024 * 1024, // 100MB
} as const;

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

// 文件信息接口
export interface FileInfo {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  ext: string;
  uploadedAt: Date;
}

/**
 * 验证单个文件
 */
export function validateFile(file: File): ValidationResult {
  const warnings: string[] = [];

  // 检查文件大小
  if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `文件 "${file.name}" 大小超过限制 (最大 ${formatFileSize(FILE_LIMITS.MAX_FILE_SIZE)})`,
    };
  }

  // 检查文件类型
  const fileType = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES];
  if (!fileType) {
    return {
      isValid: false,
      error: `文件 "${file.name}" 类型不支持 (支持类型: ${getSupportedTypesString()})`,
    };
  }

  // 检查文件名长度
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: `文件名 "${file.name}" 过长 (最大255字符)`,
    };
  }

  // 检查空文件
  if (file.size === 0) {
    return {
      isValid: false,
      error: `文件 "${file.name}" 为空文件`,
    };
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * 验证文件列表
 */
export function validateFileList(files: File[], existingFiles: FileInfo[] = []): ValidationResult {
  // 检查文件数量
  const totalFiles = existingFiles.length + files.length;
  if (totalFiles > FILE_LIMITS.MAX_FILE_COUNT) {
    return {
      isValid: false,
      error: `文件数量超过限制 (最大 ${FILE_LIMITS.MAX_FILE_COUNT} 个文件)`,
    };
  }

  // 检查总大小
  const existingTotalSize = existingFiles.reduce((sum, f) => sum + f.size, 0);
  const newFilesSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalSize = existingTotalSize + newFilesSize;

  if (totalSize > FILE_LIMITS.MAX_TOTAL_SIZE) {
    return {
      isValid: false,
      error: `文件总大小超过限制 (最大 ${formatFileSize(FILE_LIMITS.MAX_TOTAL_SIZE)})`,
    };
  }

  // 检查重复文件名
  const existingNames = new Set(existingFiles.map(f => f.name.toLowerCase()));
  const duplicateNames = files.filter(f => existingNames.has(f.name.toLowerCase()));

  if (duplicateNames.length > 0) {
    return {
      isValid: false,
      error: `以下文件名已存在: ${duplicateNames.map(f => f.name).join(', ')}`,
    };
  }

  // 验证每个文件
  for (const file of files) {
    const result = validateFile(file);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}

/**
 * 创建文件信息对象
 */
export function createFileInfo(file: File): FileInfo {
  const fileType = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES];

  return {
    file,
    id: generateFileId(),
    name: file.name,
    size: file.size,
    type: file.type,
    category: fileType?.category || 'unknown',
    ext: fileType?.ext || getFileExtension(file.name),
    uploadedAt: new Date(),
  };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取支持的文件类型字符串
 */
export function getSupportedTypesString(): string {
  const types = Object.values(SUPPORTED_FILE_TYPES)
    .map(info => info.ext)
    .filter((ext, index, arr) => arr.indexOf(ext) === index);

  return types.join(', ');
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : '';
}

/**
 * 生成唯一文件ID
 */
export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 检查文件是否为图片类型
 */
export function isImageFile(fileInfo: FileInfo): boolean {
  return fileInfo.category === 'image';
}

/**
 * 检查文件是否为文档类型
 */
export function isDocumentFile(fileInfo: FileInfo): boolean {
  return fileInfo.category === 'document';
}

/**
 * 检查文件是否为文本类型
 */
export function isTextFile(fileInfo: FileInfo): boolean {
  return fileInfo.category === 'text';
}

/**
 * 检查文件是否为压缩文件
 */
export function isArchiveFile(fileInfo: FileInfo): boolean {
  return fileInfo.category === 'archive';
}

/**
 * 获取文件类型的图标名称
 */
export function getFileIcon(fileInfo: FileInfo): string {
  if (isImageFile(fileInfo)) return 'image';
  if (isDocumentFile(fileInfo)) {
    if (fileInfo.ext === '.pdf') return 'file-text';
    if (fileInfo.ext.includes('doc')) return 'file-text';
    if (fileInfo.ext.includes('xls')) return 'file-spreadsheet';
    if (fileInfo.ext.includes('ppt')) return 'file-presentation';
    return 'file-text';
  }
  if (isTextFile(fileInfo)) return 'file-code';
  if (isArchiveFile(fileInfo)) return 'archive';
  return 'file';
}

/**
 * 创建文件预览URL
 */
export function createPreviewUrl(fileInfo: FileInfo): string | null {
  if (isImageFile(fileInfo)) {
    return URL.createObjectURL(fileInfo.file);
  }
  return null;
}

/**
 * 释放预览URL
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}