import api from './axios'

export const getTodos = async (params) => {
  const response = await api.get('/todos', { params })
  return response.data
}

export const getTodoStats = async () => {
  const response = await api.get('/todos/stats')
  return response.data
}

export const createTodo = async (data) => {
  const hasFiles =
    Array.isArray(data.attachments) &&
    data.attachments.some(
      (f) => typeof File !== 'undefined' && f instanceof File
    )

  if (!hasFiles) {
    const payload = { ...data }
    delete payload.attachments
    const response = await api.post('/todos', payload)
    return response.data
  }

  const formData = new FormData()
  if (data.title) formData.append('title', data.title)
  if (data.description !== undefined) formData.append('description', data.description)
  if (data.category) formData.append('category', data.category)
  if (data.priority) formData.append('priority', data.priority)
  if (data.status) formData.append('status', data.status)
  if (data.dueDate) formData.append('dueDate', data.dueDate)
  if (data.reminderAt) formData.append('reminderAt', data.reminderAt)
  if (data.subtasks) formData.append('subtasks', JSON.stringify(data.subtasks))
  for (const file of data.attachments) {
    if (typeof File !== 'undefined' && file instanceof File) {
      formData.append('attachments', file)
    }
  }

  const response = await api.post('/todos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateTodo = async (id, data) => {
  const hasFiles =
    Array.isArray(data.attachments) &&
    data.attachments.some(
      (f) => typeof File !== 'undefined' && f instanceof File
    )

  if (!hasFiles) {
    const payload = { ...data }
    delete payload.attachments
    const response = await api.put(`/todos/${id}`, payload)
    return response.data
  }

  const formData = new FormData()
  if (data.title !== undefined) formData.append('title', data.title)
  if (data.description !== undefined) formData.append('description', data.description)
  if (data.category !== undefined) formData.append('category', data.category)
  if (data.priority !== undefined) formData.append('priority', data.priority)
  if (data.status !== undefined) formData.append('status', data.status)
  if (data.dueDate !== undefined) formData.append('dueDate', data.dueDate || '')
  if (data.reminderAt !== undefined) formData.append('reminderAt', data.reminderAt || '')
  if (data.subtasks !== undefined) formData.append('subtasks', JSON.stringify(data.subtasks))
  for (const file of data.attachments) {
    if (typeof File !== 'undefined' && file instanceof File) {
      formData.append('attachments', file)
    }
  }

  const response = await api.put(`/todos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteTodo = async (id) => {
  const response = await api.delete(`/todos/${id}`)
  return response.data
}

export const restoreTodo = async (id) => {
  const response = await api.patch(`/todos/${id}/restore`)
  return response.data
}

export const permanentDeleteTodo = async (id) => {
  const response = await api.delete(`/todos/${id}/permanent`)
  return response.data
}

export const toggleComplete = async (id) => {
  const response = await api.patch(`/todos/${id}/complete`)
  return response.data
}

export const getAttachmentUrl = (todoId, filename) => {
  const baseURL = import.meta.env.VITE_API_URL || '/api'
  return `${baseURL}/todos/${todoId}/attachments/${filename}`
}

export const deleteAttachment = async (todoId, filename) => {
  const response = await api.delete(`/todos/${todoId}/attachments/${filename}`)
  return response.data
}
