import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;

  // 这里应该实现实际的文件下载逻辑
  // 可以从存储服务（如AWS S3、阿里云OSS等）获取文件

  try {
    // 模拟文件下载
    const fileContent = `这是报告文件: ${filename}`;
    const buffer = Buffer.from(fileContent, 'utf-8');

    // 根据文件扩展名设置Content-Type
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'html':
        contentType = 'text/html';
        break;
      case 'json':
        contentType = 'application/json';
        break;
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('下载文件失败:', error);
    return NextResponse.json(
      { error: '文件不存在或下载失败' },
      { status: 404 }
    );
  }
}