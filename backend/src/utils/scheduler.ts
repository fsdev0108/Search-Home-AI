import { UploadService } from '../services/uploadService'

export class Scheduler {
  private uploadService: UploadService
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.uploadService = new UploadService()
  }

  startDailyScheduler(): void {
    // Run every hour to check for scheduled uploads
    this.intervalId = setInterval(async () => {
      try {
        await this.uploadService.processScheduledUploads()
        console.log('Scheduled uploads processed successfully')
      } catch (error) {
        console.error('Error processing scheduled uploads:', error)
      }
    }, 60 * 60 * 1000) // 1 hour

    console.log('Daily scheduler started')
  }

  stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('Daily scheduler stopped')
    }
  }

  async processUploadsNow(): Promise<void> {
    try {
      await this.uploadService.processScheduledUploads()
      console.log('Manual upload processing completed')
    } catch (error) {
      console.error('Error in manual upload processing:', error)
      throw error
    }
  }
}
