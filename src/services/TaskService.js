// TaskService.js - Service for managing tasks using Apper backend
const { ApperClient } = window.ApperSDK || {}

class TaskService {
  constructor() {
    if (ApperClient) {
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
    }
  }

  // Get all updateable fields for the task3 table
  getUpdateableFields() {
    return [
      'Name', 'Tags', 'Owner', 'title', 'description', 
      'priority', 'completed', 'created_at'
    ]
  }

  // Get all fields for fetch operations
  getAllFields() {
    return [
      'Id', 'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
      'ModifiedOn', 'ModifiedBy', 'title', 'description', 
      'priority', 'completed', 'created_at'
    ]
  }

  // Fetch all tasks
  async fetchTasks(filters = {}) {
    try {
      const params = {
        fields: this.getAllFields(),
        orderBy: [
          {
            fieldName: "created_at",
            SortType: "DESC"
          }
        ]
      }

      // Add filtering based on completed status if specified
      if (filters.completed !== undefined) {
        params.where = [
          {
            fieldName: "completed",
            operator: "ExactMatch",
            values: [filters.completed.toString()]
          }
        ]
      }

      const response = await this.apperClient.fetchRecords('task3', params)
      
      if (!response || !response.data) {
        return []
      }

      // Transform the data to match the UI expectations
      return response.data.map(task => ({
        id: task.Id?.toString(),
        title: task.title || task.Name || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        completed: task.completed?.includes('completed') || false,
        createdAt: task.created_at || task.CreatedOn || new Date().toISOString(),
        tags: task.Tags || '',
        owner: task.Owner || ''
      }))
      
    } catch (error) {
      console.error("Error fetching tasks:", error)
      throw new Error("Failed to fetch tasks. Please try again.")
    }
  }

  // Create a new task
  async createTask(taskData) {
    try {
      // Only include updateable fields in the request
      const record = {
        Name: taskData.title?.trim() || '',
        title: taskData.title?.trim() || '',
        description: taskData.description?.trim() || '',
        priority: taskData.priority || 'medium',
        completed: taskData.completed ? 'completed' : '',
        created_at: new Date().toISOString(),
        Tags: taskData.tags || '',
        Owner: taskData.owner || ''
      }

      const params = {
        records: [record]
      }

      const response = await this.apperClient.createRecord('task3', params)

      if (response?.success && response?.results?.length > 0) {
        const result = response.results[0]
        if (result.success && result.data) {
          // Transform the created task to match UI expectations
          return {
            id: result.data.Id?.toString(),
            title: result.data.title || result.data.Name || '',
            description: result.data.description || '',
            priority: result.data.priority || 'medium',
            completed: result.data.completed?.includes('completed') || false,
            createdAt: result.data.created_at || result.data.CreatedOn || new Date().toISOString(),
            tags: result.data.Tags || '',
            owner: result.data.Owner || ''
          }
        } else {
          throw new Error(result.message || "Failed to create task")
        }
      } else {
        throw new Error("Failed to create task")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      throw new Error("Failed to create task. Please try again.")
    }
  }

  // Update an existing task
  async updateTask(taskId, taskData) {
    try {
      // Only include updateable fields plus Id for update
      const record = {
        Id: parseInt(taskId),
        Name: taskData.title?.trim() || '',
        title: taskData.title?.trim() || '',
        description: taskData.description?.trim() || '',
        priority: taskData.priority || 'medium',
        completed: taskData.completed ? 'completed' : '',
        Tags: taskData.tags || '',
        Owner: taskData.owner || ''
      }

      const params = {
        records: [record]
      }

      const response = await this.apperClient.updateRecord('task3', params)

      if (response?.success && response?.results?.length > 0) {
        const result = response.results[0]
        if (result.success && result.data) {
          // Transform the updated task to match UI expectations
          return {
            id: result.data.Id?.toString(),
            title: result.data.title || result.data.Name || '',
            description: result.data.description || '',
            priority: result.data.priority || 'medium',
            completed: result.data.completed?.includes('completed') || false,
            createdAt: result.data.created_at || result.data.CreatedOn || new Date().toISOString(),
            tags: result.data.Tags || '',
            owner: result.data.Owner || ''
          }
        } else {
          throw new Error(result.message || "Failed to update task")
        }
      } else {
        throw new Error("Failed to update task")
      }
    } catch (error) {
      console.error("Error updating task:", error)
      throw new Error("Failed to update task. Please try again.")
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    try {
      const params = {
        RecordIds: [parseInt(taskId)]
      }

      const response = await this.apperClient.deleteRecord('task3', params)

      if (response?.success && response?.results?.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          throw new Error(result.message || "Failed to delete task")
        }
        return true
      } else {
        throw new Error("Failed to delete task")
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      throw new Error("Failed to delete task. Please try again.")
    }
  }

  // Get a single task by ID
  async getTaskById(taskId) {
    try {
      const params = {
        fields: this.getAllFields()
      }

      const response = await this.apperClient.getRecordById('task3', parseInt(taskId), params)

      if (!response || !response.data) {
        return null
      }

      // Transform the data to match UI expectations
      return {
        id: response.data.Id?.toString(),
        title: response.data.title || response.data.Name || '',
        description: response.data.description || '',
        priority: response.data.priority || 'medium',
        completed: response.data.completed?.includes('completed') || false,
        createdAt: response.data.created_at || response.data.CreatedOn || new Date().toISOString(),
        tags: response.data.Tags || '',
        owner: response.data.Owner || ''
      }
    } catch (error) {
      console.error(`Error fetching task with ID ${taskId}:`, error)
      throw new Error("Failed to fetch task. Please try again.")
    }
  }
}

export default new TaskService()