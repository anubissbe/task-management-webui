import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { ReportService } from './reportService';

interface ExportOptions {
  includeCharts?: boolean;
  includeRawData?: boolean;
  dateRange?: any;
}

export class ExportService {
  private reportService: ReportService;
  constructor() {
    this.reportService = new ReportService();
  }

  async exportToPDF(dashboardId: string, workspaceId: string, options: ExportOptions): Promise<Buffer> {
    const dashboard = await this.reportService.getDashboardById(dashboardId, workspaceId);
    const metrics = await this.reportService.getAdvancedMetrics(workspaceId, options.dateRange || {});

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title Page
      doc.fontSize(24).text(dashboard.name, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(dashboard.description || 'Performance Report', { align: 'center' });
      doc.moveDown(2);

      // Date Range
      if (options.dateRange) {
        doc.fontSize(12).text(`Report Period: ${options.dateRange.start} to ${options.dateRange.end}`, { align: 'center' });
      }
      doc.moveDown(2);

      // Executive Summary
      doc.fontSize(18).text('Executive Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Teams: ${metrics.performanceMetrics.length}`);
      doc.text(`Average Completion Rate: ${this.calculateAverage(metrics.performanceMetrics, 'completionRate').toFixed(1)}%`);
      doc.text(`Total Tasks Completed: ${this.sumMetric(metrics.performanceMetrics, 'tasksCompleted')}`);
      doc.moveDown(2);

      // Team Performance
      doc.addPage();
      doc.fontSize(18).text('Team Performance Metrics', { underline: true });
      doc.moveDown();

      metrics.performanceMetrics.forEach(team => {
        doc.fontSize(14).text(team.teamName, { underline: true });
        doc.fontSize(12);
        doc.text(`  - Completion Rate: ${team.completionRate}%`);
        doc.text(`  - Tasks Completed: ${team.tasksCompleted}`);
        doc.text(`  - Average Task Time: ${team.averageTaskTime} hours`);
        doc.text(`  - Velocity: ${team.velocity} points`);
        doc.moveDown();
      });

      // Velocity Trends
      if (metrics.velocityTrend.length > 0) {
        doc.addPage();
        doc.fontSize(18).text('Velocity Trends', { underline: true });
        doc.moveDown();
        
        metrics.velocityTrend.forEach(sprint => {
          doc.fontSize(12).text(`${sprint.sprint}: ${sprint.storyPoints} points`);
        });
      }

      // Risk Factors
      if (metrics.predictiveAnalytics.riskFactors.length > 0) {
        doc.addPage();
        doc.fontSize(18).text('Risk Assessment', { underline: true });
        doc.moveDown();
        
        metrics.predictiveAnalytics.riskFactors.forEach(risk => {
          doc.fontSize(12);
          doc.text(`• ${risk.factor} (${risk.impact.toUpperCase()} impact)`);
          doc.text(`  Probability: ${(risk.probability * 100).toFixed(0)}%`);
          doc.text(`  ${risk.mitigation}`);
          doc.moveDown();
        });
      }

      doc.end();
    });
  }

  async exportToExcel(dashboardId: string, workspaceId: string, options: ExportOptions): Promise<Buffer> {
    const dashboard = await this.reportService.getDashboardById(dashboardId, workspaceId);
    const metrics = await this.reportService.getAdvancedMetrics(workspaceId, options.dateRange || {});

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ProjectHub';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    summarySheet.addRows([
      { metric: 'Dashboard Name', value: dashboard.name },
      { metric: 'Total Teams', value: metrics.performanceMetrics.length },
      { metric: 'Average Completion Rate', value: `${this.calculateAverage(metrics.performanceMetrics, 'completionRate').toFixed(1)}%` },
      { metric: 'Total Tasks Completed', value: this.sumMetric(metrics.performanceMetrics, 'tasksCompleted') },
      { metric: 'Average Velocity', value: this.calculateAverage(metrics.performanceMetrics, 'velocity').toFixed(1) }
    ]);

    // Team Performance Sheet
    const performanceSheet = workbook.addWorksheet('Team Performance');
    performanceSheet.columns = [
      { header: 'Team Name', key: 'teamName', width: 25 },
      { header: 'Completion Rate (%)', key: 'completionRate', width: 20 },
      { header: 'Tasks Completed', key: 'tasksCompleted', width: 20 },
      { header: 'Avg Task Time (h)', key: 'averageTaskTime', width: 20 },
      { header: 'Velocity', key: 'velocity', width: 15 }
    ];
    performanceSheet.addRows(metrics.performanceMetrics);

    // Velocity Trend Sheet
    if (metrics.velocityTrend.length > 0) {
      const velocitySheet = workbook.addWorksheet('Velocity Trend');
      velocitySheet.columns = [
        { header: 'Sprint', key: 'sprint', width: 20 },
        { header: 'Story Points', key: 'storyPoints', width: 20 },
        { header: 'Committed Points', key: 'committedPoints', width: 20 }
      ];
      velocitySheet.addRows(metrics.velocityTrend);
    }

    // Raw Data Sheet (if requested)
    if (options.includeRawData) {
      const rawDataSheet = workbook.addWorksheet('Raw Data');
      rawDataSheet.addRow(['Raw metrics data']);
      rawDataSheet.addRow([JSON.stringify(metrics, null, 2)]);
    }

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }

  async exportToCSV(_dashboardId: string, workspaceId: string, options: ExportOptions): Promise<Buffer> {
    const metrics = await this.reportService.getAdvancedMetrics(workspaceId, options.dateRange || {});
    
    const csvData = metrics.performanceMetrics.map(team => ({
      'Team Name': team.teamName,
      'Completion Rate (%)': team.completionRate,
      'Tasks Completed': team.tasksCompleted,
      'Average Task Time (hours)': team.averageTaskTime,
      'Velocity': team.velocity
    }));

    const parser = new Parser({
      fields: ['Team Name', 'Completion Rate (%)', 'Tasks Completed', 'Average Task Time (hours)', 'Velocity']
    });
    
    const csv = parser.parse(csvData);
    return Buffer.from(csv, 'utf-8');
  }

  private calculateAverage(data: Record<string, any>[], field: string): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
    return sum / data.length;
  }

  private sumMetric(data: Record<string, any>[], field: string): number {
    return data.reduce((acc, item) => acc + (item[field] || 0), 0);
  }
}