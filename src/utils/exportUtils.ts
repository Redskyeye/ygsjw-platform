import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// 导出为PDF
export async function exportToPDF(elementId: string, filename: string = 'report.pdf'): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // 使用html2canvas捕获元素
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    // 添加图片到PDF
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

    // 保存PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('导出PDF失败');
  }
}

// 导出为DOCX
export async function exportToDOCX(
  content: {
    title: string;
    sections: Array<{ title: string; content: string; type: string }>;
  },
  filename: string = 'report.docx'
): Promise<void> {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // 标题
            new Paragraph({
              children: [
                new TextRun({
                  text: content.title,
                  bold: true,
                  size: 32
                })
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400
              }
            }),
            // 日期
            new Paragraph({
              children: [
                new TextRun({
                  text: `生成日期：${new Date().toLocaleDateString('zh-CN')}`,
                  size: 24
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 800
              }
            }),
            // 各个章节
            ...content.sections.map(section => {
              const elements: Paragraph[] = [];

              // 章节标题
              elements.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: section.title,
                      bold: true,
                      size: 28
                    })
                  ],
                  heading: HeadingLevel.HEADING_1,
                  spacing: {
                    before: 400,
                    after: 200
                  }
                })
              );

              // 章节内容
              if (section.type === 'table') {
                // 处理表格内容
                const lines = section.content.split('\n');
                lines.forEach(line => {
                  if (line.trim()) {
                    elements.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: line,
                            size: 24
                          })
                        ],
                        spacing: {
                          after: 100
                        }
                      })
                    );
                  }
                });
              } else {
                // 处理普通文本
                const paragraphs = section.content.split('\n\n');
                paragraphs.forEach(paragraph => {
                  if (paragraph.trim()) {
                    elements.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: paragraph.trim(),
                            size: 24
                          })
                        ],
                        spacing: {
                          after: 200
                        }
                      })
                    );
                  }
                });
              }

              return elements;
            }).flat()
          ]
        }
      ]
    });

    // 生成并下载文档
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // 使用file-saver下载
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    throw new Error('导出Word文档失败');
  }
}

// 导出为HTML
export function exportToHTML(
  content: {
    title: string;
    sections: Array<{ title: string; content: string; type: string }>;
    styling?: any;
  },
  filename: string = 'report.html'
): void {
  try {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        ${content.styling ? generateStyling(content.styling) : defaultStyles}
    </style>
</head>
<body>
    <div class="document">
        <header class="header">
            <h1>${content.title}</h1>
            <p class="date">生成日期：${new Date().toLocaleDateString('zh-CN')}</p>
        </header>

        <main class="content">
            ${content.sections.map(section => generateSectionHTML(section)).join('')}
        </main>

        <footer class="footer">
            <p>© 2024 AI效率分析系统</p>
        </footer>
    </div>
</body>
</html>`;

    // 创建并下载HTML文件
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting to HTML:', error);
    throw new Error('导出HTML失败');
  }
}

// 导出为JSON
export function exportToJSON(data: any, filename: string = 'report.json'): void {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('导出JSON失败');
  }
}

// 导出为CSV（用于表格数据）
export function exportToCSV(data: {
  headers: string[];
  rows: string[][];
}, filename: string = 'data.csv'): void {
  try {
    const csvContent = [
      data.headers.join(','),
      ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // 添加BOM以支持中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('导出CSV失败');
  }
}

// 导出为Excel（使用SheetJS）
export async function exportToExcel(
  data: {
    [sheetName: string]: {
      headers: string[];
      rows: string[][];
    };
  },
  filename: string = 'report.xlsx'
): Promise<void> {
  try {
    // 动态导入xlsx库
    const XLSX = await import('xlsx');

    const workbook = XLSX.utils.book_new();

    // 为每个工作表创建数据
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const worksheetData = [sheetData.headers, ...sheetData.rows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // 设置列宽
      const colWidths = sheetData.headers.map(() => ({ wch: 20 }));
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // 导出文件
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('导出Excel失败');
  }
}

// 打印功能
export function printElement(elementId: string): void {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('无法打开打印窗口');
    }

    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <title>打印报告</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // 等待内容加载后打印
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  } catch (error) {
    console.error('Error printing:', error);
    throw new Error('打印失败');
  }
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

// Base64编码/解码
export function base64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export function base64Decode(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

// 生成样式
function generateStyling(styling: any): string {
  return `
    body {
      font-family: ${styling.fontFamily || 'Inter, sans-serif'};
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      background-color: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${styling.primaryColor || '#2563eb'};
    }
    .header h1 {
      color: ${styling.primaryColor || '#2563eb'};
      margin: 0;
      font-size: 2.5em;
    }
    .header .date {
      color: #666;
      margin: 10px 0 0 0;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: ${styling.primaryColor || '#2563eb'};
      margin-bottom: 15px;
      font-size: 1.8em;
    }
    .section h3 {
      color: ${styling.secondaryColor || '#64748b'};
      margin: 20px 0 10px 0;
      font-size: 1.4em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: ${styling.primaryColor || '#2563eb'};
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
    .summary {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .chart-placeholder {
      background-color: #e9ecef;
      padding: 40px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
    }
    .recommendation {
      background-color: #f0f9ff;
      border-left: 4px solid ${styling.primaryColor || '#2563eb'};
      padding: 15px;
      margin: 15px 0;
    }
    .priority-high {
      border-left-color: #ef4444;
    }
    .priority-medium {
      border-left-color: #f59e0b;
    }
    .priority-low {
      border-left-color: #10b981;
    }
    @media print {
      body { margin: 0; padding: 10px; }
      .no-print { display: none !important; }
    }
  `;
}

// 默认样式
const defaultStyles = `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #333;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
    background-color: #fff;
  }
  .document {
    max-width: 1200px;
    margin: 0 auto;
  }
  .header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #2563eb;
  }
  .header h1 {
    color: #2563eb;
    margin: 0;
    font-size: 2.5em;
  }
  .header .date {
    color: #666;
    margin: 10px 0 0 0;
  }
  .section {
    margin-bottom: 30px;
  }
  .section h2 {
    color: #2563eb;
    margin-bottom: 15px;
    font-size: 1.8em;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  th {
    background-color: #2563eb;
    color: white;
    font-weight: bold;
  }
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
    text-align: center;
    color: #666;
    font-size: 0.9em;
  }
`;

// 生成章节HTML
function generateSectionHTML(section: { title: string; content: string; type: string }): string {
  switch (section.type) {
    case 'table':
      return `
        <div class="section">
          <h2>${section.title}</h2>
          <div class="table-container">${section.content}</div>
        </div>
      `;

    case 'chart':
      return `
        <div class="section">
          <h2>${section.title}</h2>
          <div class="chart-placeholder">
            <p>图表：${section.title}</p>
            <p>（图表将在导出时生成）</p>
          </div>
        </div>
      `;

    case 'custom':
      return `
        <div class="section">
          <h2>${section.title}</h2>
          <div class="custom-content">${section.content.replace(/\n/g, '<br>')}</div>
        </div>
      `;

    default:
      return `
        <div class="section">
          <h2>${section.title}</h2>
          <div class="text-content">${section.content.replace(/\n/g, '<br>')}</div>
        </div>
      `;
  }
}

// 下载文件（通用）
export function downloadFile(data: Blob | string, filename: string, mimeType?: string): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType || 'application/octet-stream' });
  saveAs(blob, filename);
}