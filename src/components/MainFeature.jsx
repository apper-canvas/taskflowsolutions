import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ApperIcon from './ApperIcon'
import TaskService from '../services/TaskService'
import { AuthContext } from '../App'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' })
  const [filter, setFilter] = useState('all') // all, active, completed
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(false)
const [showAddForm, setShowAddForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

// Check authentication and redirect if needed
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
  }, [isAuthenticated, navigate])

  // Load tasks from database on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
    }
  }, [isAuthenticated])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const fetchedTasks = await TaskService.fetchTasks()
      setTasks(fetchedTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
      toast.error(error.message || 'Failed to load tasks')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title!')
      return
    }

    setCreateLoading(true)
    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        completed: false,
owner: user?.emailAddress || '',
        tags: ''
      }

      const createdTask = await TaskService.createTask(taskData)
      setTasks(prev => [createdTask, ...prev])
      setNewTask({ title: '', description: '', priority: 'medium' })
      toast.success('Task added successfully!')
setShowAddForm(false) // Hide form after successful creation
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error(error.message || 'Failed to create task')
    } finally {
      setCreateLoading(false)
    }
  }

const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    setUpdateLoading(true)
    try {
      const updatedTaskData = {
        ...task,
        completed: !task.completed
      }

      const updatedTask = await TaskService.updateTask(id, updatedTaskData)
      setTasks(prev => prev.map(t => 
        t.id === id ? updatedTask : t
      ))
      
      toast.success(task.completed ? 'Task marked as incomplete!' : 'Task completed! 🎉')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error(error.message || 'Failed to update task')
    } finally {
      setUpdateLoading(false)
    }
  }

const deleteTask = async (id) => {
    setDeleteLoading(true)
    try {
      await TaskService.deleteTask(id)
      setTasks(prev => prev.filter(task => task.id !== id))
      toast.success('Task deleted!')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error(error.message || 'Failed to delete task')
    } finally {
      setDeleteLoading(false)
    }
  }

const updateTask = async (id, updatedTaskData) => {
    setUpdateLoading(true)
    try {
      const updatedTask = await TaskService.updateTask(id, updatedTaskData)
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ))
      setEditingTask(null)
      toast.success('Task updated!')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error(error.message || 'Failed to update task')
    } finally {
      setUpdateLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const completedCount = tasks.filter(task => task.completed).length
  const totalCount = tasks.length

  const priorityColors = {
    high: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    medium: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    low: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
  }

  const priorityIcons = {
    high: 'AlertCircle',
    medium: 'Clock',
    low: 'CheckCircle2'
  }

// Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-surface-600 dark:text-surface-400">Loading tasks...</p>
        </div>
      </div>
    )
  }

  // Show authentication required if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-surface-800 dark:text-surface-200 mb-4">
          Authentication Required
        </h2>
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          Please log in to access your tasks.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          Go to Login
        </button>
      </div>
    )
  }
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
      >
        <div className="task-card rounded-2xl p-4 sm:p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl mb-3">
            <ApperIcon name="ListTodo" className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-surface-800 dark:text-surface-200">{totalCount}</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">Total Tasks</p>
        </div>
        
        <div className="task-card rounded-2xl p-4 sm:p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-3">
            <ApperIcon name="CheckCheck" className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-surface-800 dark:text-surface-200">{completedCount}</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">Completed</p>
        </div>
        
        <div className="task-card rounded-2xl p-4 sm:p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-3">
            <ApperIcon name="Clock" className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-surface-800 dark:text-surface-200">{totalCount - completedCount}</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">Pending</p>
        </div>
      </motion.div>

      {/* Add Task Form */}

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
className="flex flex-wrap items-center justify-between gap-2 sm:gap-4"
      >
<div className="flex flex-wrap gap-2 sm:gap-4">
        {[
          { key: 'all', label: 'All Tasks', icon: 'List' },
          { key: 'active', label: 'Active', icon: 'Clock' },
          { key: 'completed', label: 'Completed', icon: 'CheckCircle' }
        ].map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              filter === tab.key
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                : 'glass-effect text-surface-700 dark:text-surface-300 hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name={tab.icon} className="w-4 h-4" />
            <span className="text-sm sm:text-base">{tab.label}</span>
          </motion.button>
        ))}
</div>
        
        {/* Add Task Button */}
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary text-white shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon name={showAddForm ? "X" : "Plus"} className="w-4 h-4" />
          <span className="text-sm sm:text-base">{showAddForm ? 'Cancel' : 'Add Task'}</span>
        </motion.button>
      </motion.div>

{/* Add Task Form - Expandable */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="task-card rounded-2xl p-4 sm:p-6 lg:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-xl">
                  <ApperIcon name="Plus" className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-surface-800 dark:text-surface-200">Add New Task</h2>
              </div>

              <form onSubmit={addTask} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="What needs to be done?"
                      className="task-input w-full px-4 py-3 rounded-xl border-0 outline-none placeholder-surface-400 text-surface-800 dark:text-surface-200"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="task-input w-full px-4 py-3 rounded-xl border-0 outline-none text-surface-800 dark:text-surface-200"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Add more details about this task..."
                      rows={3}
                      className="task-input w-full px-4 py-3 rounded-xl border-0 outline-none placeholder-surface-400 text-surface-800 dark:text-surface-200 resize-none"
                      maxLength={300}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    type="submit"
                    disabled={createLoading}
                    className="neu-button px-6 py-3 rounded-xl font-medium text-surface-800 dark:text-surface-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ApperIcon name={createLoading ? "Loader2" : "Plus"} className={`w-5 h-5 ${createLoading ? "animate-spin" : ""}`} />
                    <span>{createLoading ? 'Adding...' : 'Add Task'}</span>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-xl font-medium hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-3 sm:space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="task-card rounded-2xl p-8 sm:p-12 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-surface-200 to-surface-300 rounded-full mb-4">
                <ApperIcon name="CheckCircle2" className="w-8 h-8 text-surface-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">
                {filter === 'completed' ? 'No completed tasks yet' : 
                 filter === 'active' ? 'No active tasks' : 'No tasks yet'}
              </h3>
              <p className="text-surface-500 dark:text-surface-400">
                {filter === 'all' ? 'Create your first task to get started!' : 
                 filter === 'active' ? 'All tasks are completed! Great job!' :
                 'Complete some tasks to see them here.'}
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`task-card rounded-2xl p-4 sm:p-6 border-l-4 ${priorityColors[task.priority]}`}
              >
                {editingTask === task.id ? (
<EditTaskForm
task={task}
onSave={(updatedTask) => updateTask(task.id, updatedTask)}
onCancel={() => setEditingTask(null)}
updateLoading={updateLoading}
                    deleteLoading={deleteLoading}
                  />
                ) : (
                  <div className="flex items-start space-x-3 sm:space-x-4">
<motion.button
                      onClick={() => toggleTask(task.id)}
                      disabled={updateLoading || deleteLoading}
                      className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                        task.completed
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500'
                          : 'border-surface-300 hover:border-primary'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {task.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <ApperIcon name="Check" className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <h3 className={`font-semibold transition-all duration-300 ${
                          task.completed 
                            ? 'text-surface-500 dark:text-surface-400 line-through' 
                            : 'text-surface-800 dark:text-surface-200'
                        }`}>
{task?.title || 'Untitled Task'}
                        </h3>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            <ApperIcon name={priorityIcons[task.priority]} className="w-3 h-3" />
                            <span className="capitalize">{task.priority}</span>
                          </div>
                        </div>
                      </div>

{task?.description && (
                        <p className={`text-sm mb-3 transition-all duration-300 ${
                          task.completed 
                            ? 'text-surface-400 dark:text-surface-500' 
                            : 'text-surface-600 dark:text-surface-400'
                        }`}>
{task?.description}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-xs text-surface-400 dark:text-surface-500">
Created {task?.createdAt ? format(new Date(task.createdAt), 'MMM dd, yyyy • HH:mm') : 'Unknown date'}
                        </p>

                        <div className="flex items-center space-x-2">
<motion.button
                            onClick={() => setEditingTask(task.id)}
                            disabled={updateLoading || deleteLoading}
                            className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4 text-surface-500 hover:text-primary" />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => deleteTask(task.id)}
                            disabled={updateLoading || deleteLoading}
                            className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4 text-surface-500 hover:text-red-500" />
                          </motion.button>
                        </div>
                          
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// Edit Task Form Component
const EditTaskForm = ({ task, onSave, onCancel, updateLoading, deleteLoading }) => {
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority
  })

  const handleSave = (e) => {
    e.preventDefault()
    if (!editedTask.title.trim()) {
      toast.error('Please enter a task title!')
      return
    }
    onSave(editedTask)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
          className="task-input w-full px-3 py-2 rounded-lg text-sm"
          placeholder="Task title"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <textarea
          value={editedTask.description}
          onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
          className="task-input w-full px-3 py-2 rounded-lg text-sm resize-none"
          placeholder="Task description"
          rows={2}
          maxLength={300}
        />
      </div>

      <div className="space-y-2">
        <select
          value={editedTask.priority}
          onChange={(e) => setEditedTask(prev => ({ ...prev, priority: e.target.value }))}
          className="task-input w-full px-3 py-2 rounded-lg text-sm"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
<motion.button
          type="submit"
          disabled={updateLoading}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {updateLoading ? 'Saving...' : 'Save'}
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          disabled={updateLoading}
          className="px-4 py-2 bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 text-sm font-medium rounded-lg hover:bg-surface-300 dark:hover:bg-surface-600 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancel
        </motion.button>
      </div>
    </form>
  )
}

export default MainFeature