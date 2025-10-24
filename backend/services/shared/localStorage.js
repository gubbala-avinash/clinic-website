import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory structure
const uploadsDir = path.join(__dirname, '../../../uploads')
const prescriptionsDir = path.join(uploadsDir, 'prescriptions')
const imagesDir = path.join(prescriptionsDir, 'images')
const pdfsDir = path.join(prescriptionsDir, 'pdfs')
const whiteboardsDir = path.join(prescriptionsDir, 'whiteboards')

// Create all necessary directories
const dirs = [uploadsDir, prescriptionsDir, imagesDir, pdfsDir, whiteboardsDir]
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

export const localFileStorage = {
  // Save prescription file with organized structure
  async savePrescriptionFile(file, prescriptionId, fileType = 'image') {
    try {
      // Create prescription-specific folder structure
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      
      // Organize by: prescriptions/{type}/{year}/{month}/{day}/{prescriptionId}/
      const folderPath = path.join(prescriptionsDir, fileType, year.toString(), month, day, prescriptionId)
      
      // Create folder structure if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }

      // Generate organized filename
      const timestamp = Date.now()
      const extension = path.extname(file.originalname)
      const filename = `${fileType}_${timestamp}${extension}`
      
      const filePath = path.join(folderPath, filename)
      
      // Write file to disk
      fs.writeFileSync(filePath, file.buffer)
      
      // Return organized file info
      return {
        success: true,
        filename,
        originalName: file.originalname,
        path: filePath,
        relativePath: path.relative(prescriptionsDir, filePath),
        url: `/uploads/prescriptions/${fileType}/${year}/${month}/${day}/${prescriptionId}/${filename}`,
        size: file.size,
        mimetype: file.mimetype,
        prescriptionId,
        fileType,
        uploadedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error saving prescription file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Save file to local storage (legacy method)
  async saveFile(file, subfolder = '') {
    try {
      const folderPath = path.join(prescriptionsDir, subfolder)
      
      // Create subfolder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = path.extname(file.originalname)
      const filename = `${timestamp}_${randomString}${extension}`
      
      const filePath = path.join(folderPath, filename)
      
      // Write file to disk
      fs.writeFileSync(filePath, file.buffer)
      
      // Return file info
      return {
        success: true,
        filename,
        originalName: file.originalname,
        path: filePath,
        url: `/uploads/prescriptions/${subfolder}/${filename}`,
        size: file.size,
        mimetype: file.mimetype
      }
    } catch (error) {
      console.error('Error saving file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get file from local storage
  async getFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          data: fs.readFileSync(filePath),
          exists: true
        }
      } else {
        return {
          success: false,
          exists: false,
          error: 'File not found'
        }
      }
    } catch (error) {
      console.error('Error getting file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Delete file from local storage
  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return {
          success: true,
          deleted: true
        }
      } else {
        return {
          success: false,
          deleted: false,
          error: 'File not found'
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get prescription files by ID
  async getPrescriptionFiles(prescriptionId) {
    try {
      const files = []
      const fileTypes = ['images', 'pdfs', 'whiteboards']
      
      for (const fileType of fileTypes) {
        const typeDir = path.join(prescriptionsDir, fileType)
        if (fs.existsSync(typeDir)) {
          // Search through year/month/day folders
          const years = fs.readdirSync(typeDir).filter(item => 
            fs.statSync(path.join(typeDir, item)).isDirectory()
          )
          
          for (const year of years) {
            const yearDir = path.join(typeDir, year)
            const months = fs.readdirSync(yearDir).filter(item => 
              fs.statSync(path.join(yearDir, item)).isDirectory()
            )
            
            for (const month of months) {
              const monthDir = path.join(yearDir, month)
              const days = fs.readdirSync(monthDir).filter(item => 
                fs.statSync(path.join(monthDir, item)).isDirectory()
              )
              
              for (const day of days) {
                const dayDir = path.join(monthDir, day)
                const prescriptionDirs = fs.readdirSync(dayDir).filter(item => 
                  fs.statSync(path.join(dayDir, item)).isDirectory() && item === prescriptionId
                )
                
                for (const prescriptionDir of prescriptionDirs) {
                  const prescriptionPath = path.join(dayDir, prescriptionDir)
                  const prescriptionFiles = fs.readdirSync(prescriptionPath)
                  
                  for (const file of prescriptionFiles) {
                    const filePath = path.join(prescriptionPath, file)
                    const stats = fs.statSync(filePath)
                    
                    if (stats.isFile()) {
                      files.push({
                        filename: file,
                        fileType,
                        path: filePath,
                        relativePath: path.relative(prescriptionsDir, filePath),
                        url: `/uploads/prescriptions/${fileType}/${year}/${month}/${day}/${prescriptionId}/${file}`,
                        size: stats.size,
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime
                      })
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      return {
        success: true,
        files,
        count: files.length
      }
    } catch (error) {
      console.error('Error getting prescription files:', error)
      return {
        success: false,
        error: error.message,
        files: []
      }
    }
  },

  // Delete prescription files
  async deletePrescriptionFiles(prescriptionId) {
    try {
      const result = await this.getPrescriptionFiles(prescriptionId)
      if (!result.success) {
        return result
      }
      
      let deletedCount = 0
      for (const file of result.files) {
        try {
          fs.unlinkSync(file.path)
          deletedCount++
        } catch (error) {
          console.error(`Error deleting file ${file.filename}:`, error)
        }
      }
      
      // Remove empty directories
      const fileTypes = ['images', 'pdfs', 'whiteboards']
      for (const fileType of fileTypes) {
        const typeDir = path.join(prescriptionsDir, fileType)
        if (fs.existsSync(typeDir)) {
          this.cleanupEmptyDirectories(typeDir)
        }
      }
      
      return {
        success: true,
        deletedCount,
        message: `Deleted ${deletedCount} files for prescription ${prescriptionId}`
      }
    } catch (error) {
      console.error('Error deleting prescription files:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Cleanup empty directories
  cleanupEmptyDirectories(dir) {
    try {
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          this.cleanupEmptyDirectories(itemPath)
          const isEmpty = fs.readdirSync(itemPath).length === 0
          if (isEmpty) {
            fs.rmdirSync(itemPath)
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up directories:', error)
    }
  },

  // Get file URL for serving
  getFileUrl(filename, subfolder = '') {
    return `/uploads/prescriptions/${subfolder}/${filename}`
  },

  // Get absolute file path
  getFilePath(filename, subfolder = '') {
    return path.join(prescriptionsDir, subfolder, filename)
  },

  // Get organized file path for prescription
  getPrescriptionFilePath(prescriptionId, fileType, filename) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return path.join(prescriptionsDir, fileType, year.toString(), month, day, prescriptionId, filename)
  }
}
