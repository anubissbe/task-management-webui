import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { ExportService } from '../services/exportService';

interface AuthRequest extends Request {
  user?: any;
  workspaceId?: string;
}

export class ReportController {
  private reportService: ReportService;
  private exportService: ExportService;

  constructor() {
    this.reportService = new ReportService();
    this.exportService = new ExportService();
  }

  async getDashboards(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const dashboards = await this.reportService.getDashboards(workspaceId);
      res.json(dashboards);
    } catch (error) {
      console.error('Failed to get dashboards:', error);
      res.status(500).json({ error: 'Failed to retrieve dashboards' });
    }
  }

  async createDashboard(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const userId = req.user!.id;
      const dashboard = await this.reportService.createDashboard({
        ...req.body,
        workspaceId,
        createdBy: userId
      });
      res.status(201).json(dashboard);
    } catch (error) {
      console.error('Failed to create dashboard:', error);
      res.status(500).json({ error: 'Failed to create dashboard' });
    }
  }

  async updateDashboard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.workspaceId!;
      const dashboard = await this.reportService.updateDashboard(id, workspaceId, req.body);
      res.json(dashboard);
    } catch (error) {
      console.error('Failed to update dashboard:', error);
      res.status(500).json({ error: 'Failed to update dashboard' });
    }
  }

  async deleteDashboard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.workspaceId!;
      await this.reportService.deleteDashboard(id, workspaceId);
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
      res.status(500).json({ error: 'Failed to delete dashboard' });
    }
  }

  async getAdvancedMetrics(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const filters = req.query;
      const metrics = await this.reportService.getAdvancedMetrics(workspaceId, filters);
      res.json(metrics);
    } catch (error) {
      console.error('Failed to get advanced metrics:', error);
      res.status(500).json({ error: 'Failed to retrieve metrics' });
    }
  }

  async getBurndownData(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const { projectId, sprintId, dateRange } = req.query;
      
      const burndownData = await this.reportService.getBurndownData({
        workspaceId,
        projectId: projectId as string,
        sprintId: sprintId as string | undefined,
        dateRange: dateRange as string
      });
      
      res.json(burndownData);
    } catch (error) {
      console.error('Failed to get burndown data:', error);
      res.status(500).json({ error: 'Failed to retrieve burndown data' });
    }
  }

  async exportReport(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.workspaceId!;
      const { format, includeCharts, includeRawData, dateRange } = req.body;

      let fileBuffer: Buffer;
      let filename: string;
      let contentType: string;

      switch (format) {
        case 'pdf':
          fileBuffer = await this.exportService.exportToPDF(id, workspaceId, {
            includeCharts,
            dateRange
          });
          filename = 'report.pdf';
          contentType = 'application/pdf';
          break;
        
        case 'excel':
          fileBuffer = await this.exportService.exportToExcel(id, workspaceId, {
            includeCharts,
            includeRawData,
            dateRange
          });
          filename = 'report.xlsx';
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        
        case 'csv':
          fileBuffer = await this.exportService.exportToCSV(id, workspaceId, {
            dateRange
          });
          filename = 'report.csv';
          contentType = 'text/csv';
          break;
        
        default:
          return res.status(400).json({ error: 'Invalid export format' });
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Failed to export report:', error);
      res.status(500).json({ error: 'Failed to export report' });
    }
  }

  async scheduleReport(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = req.workspaceId!;
      const schedule = req.body;
      
      await this.reportService.scheduleReport(id, workspaceId, schedule);
      res.json({ success: true, message: 'Report scheduled successfully' });
    } catch (error) {
      console.error('Failed to schedule report:', error);
      res.status(500).json({ error: 'Failed to schedule report' });
    }
  }
}

export const reportController = new ReportController();