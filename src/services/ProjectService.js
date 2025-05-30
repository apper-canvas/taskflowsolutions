class ProjectService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'project'; // From Tables & Fields JSON
    
    // All fields from the project table
    this.allFields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'projectStatus', 'budget', 'priority', 'isCompleted', 'description', 
      'clientName', 'projectType', 'progressPercentage'
    ];
    
    // Only updateable fields for create/update operations
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'projectStatus', 'budget', 'priority', 
      'isCompleted', 'description', 'clientName', 'projectType', 'progressPercentage'
    ];
  }

  // Fetch all projects with optional filtering and pagination
  async fetchProjects(filters = {}) {
    try {
      const params = {
        fields: this.allFields, // Include all fields for display
        orderBy: [
          {
            fieldName: "CreatedOn",
            SortType: "DESC"
          }
        ],
        pagingInfo: {
          limit: filters.limit || 50,
          offset: filters.offset || 0
        }
      };

      // Add where conditions if filters are provided
      if (filters.status && filters.status !== 'all') {
        params.where = [
          {
            fieldName: "projectStatus",
            operator: "ExactMatch",
            values: [filters.status]
          }
        ];
      }

      // Add search functionality
      if (filters.search && filters.search.trim() !== '') {
        const searchConditions = [
          {
            fieldName: "Name",
            operator: "Contains",
            values: [filters.search.trim()]
          },
          {
            fieldName: "description",
            operator: "Contains", 
            values: [filters.search.trim()]
          },
          {
            fieldName: "clientName",
            operator: "Contains",
            values: [filters.search.trim()]
          }
        ];

        if (params.where) {
          // Combine status filter with search using whereGroups
          params.whereGroups = [
            {
              operator: "AND",
              subGroups: [
                {
                  conditions: params.where,
                  operator: ""
                },
                {
                  conditions: searchConditions,
                  operator: "OR"
                }
              ]
            }
          ];
          delete params.where;
        } else {
          params.whereGroups = [
            {
              operator: "OR", 
              subGroups: [
                {
                  conditions: searchConditions,
                  operator: ""
                }
              ]
            }
          ];
        }
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw new Error("Failed to fetch projects. Please try again.");
    }
  }

  // Get a single project by ID
  async getProjectById(projectId) {
    try {
      const params = {
        fields: this.allFields // Include all fields for complete view
      };

      const response = await this.apperClient.getRecordById(this.tableName, projectId, params);
      
      if (!response || !response.data) {
        throw new Error("Project not found");
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching project with ID ${projectId}:`, error);
      throw new Error("Failed to fetch project details. Please try again.");
    }
  }

  // Create a new project
  async createProject(projectData) {
    try {
      // Filter to include only updateable fields
      const filteredData = {};
      this.updateableFields.forEach(field => {
        if (projectData[field] !== undefined && projectData[field] !== null && projectData[field] !== '') {
          filteredData[field] = projectData[field];
        }
      });

      // Format data according to field types
      if (filteredData.budget) {
        filteredData.budget = parseFloat(filteredData.budget);
      }
      if (filteredData.progressPercentage) {
        filteredData.progressPercentage = parseInt(filteredData.progressPercentage);
      }
      if (filteredData.priority && Array.isArray(filteredData.priority)) {
        filteredData.priority = filteredData.priority.join(',');
      }
      if (filteredData.isCompleted && Array.isArray(filteredData.isCompleted)) {
        filteredData.isCompleted = filteredData.isCompleted.join(',');
      }

      const params = {
        records: [filteredData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        } else {
          const failedRecord = response.results[0];
          if (failedRecord.errors) {
            const errorMessages = failedRecord.errors.map(error => 
              `${error.fieldLabel}: ${error.message}`
            ).join(', ');
            throw new Error(`Validation failed: ${errorMessages}`);
          } else {
            throw new Error(failedRecord.message || "Failed to create project");
          }
        }
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  // Update an existing project
  async updateProject(projectId, projectData) {
    try {
      // Filter to include only updateable fields plus ID
      const filteredData = { Id: projectId };
      this.updateableFields.forEach(field => {
        if (projectData[field] !== undefined && projectData[field] !== null) {
          filteredData[field] = projectData[field];
        }
      });

      // Format data according to field types
      if (filteredData.budget) {
        filteredData.budget = parseFloat(filteredData.budget);
      }
      if (filteredData.progressPercentage) {
        filteredData.progressPercentage = parseInt(filteredData.progressPercentage);
      }
      if (filteredData.priority && Array.isArray(filteredData.priority)) {
        filteredData.priority = filteredData.priority.join(',');
      }
      if (filteredData.isCompleted && Array.isArray(filteredData.isCompleted)) {
        filteredData.isCompleted = filteredData.isCompleted.join(',');
      }

      const params = {
        records: [filteredData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        } else {
          const failedUpdate = response.results[0];
          throw new Error(failedUpdate.message || "Failed to update project");
        }
      } else {
        throw new Error("Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }

  // Delete projects by IDs
  async deleteProjects(projectIds) {
    try {
      const params = {
        RecordIds: Array.isArray(projectIds) ? projectIds : [projectIds]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.warn(`Failed to delete ${failedDeletions.length} projects`);
          failedDeletions.forEach(record => {
            console.error("Error:", record.message || "Record does not exist");
          });
        }
        
        return successfulDeletions.length > 0;
      } else {
        throw new Error("Failed to delete projects");
      }
    } catch (error) {
      console.error("Error deleting projects:", error);
      throw error;
    }
  }
}

export default new ProjectService();