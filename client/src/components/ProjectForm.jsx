import { Plus, Trash2 } from 'lucide-react'
import React from 'react'

// simple id generator — replace with uuid if you prefer
const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

const ProjectForm = ({ data = [], onChange }) => {

  const addProject = () => {
    const newProject = { _id: makeId(), name: "", type: "", description: "" }
    const next = [...data, newProject]
    console.log('ProjectForm.addProject -> next', next)
    onChange(next)
  }

  const updateProject = (index, field, value) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    console.log('ProjectForm.updateProject -> updated', updated)
    onChange(updated)
  }

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index)
    console.log('ProjectForm.removeProject -> updated', updated)
    onChange(updated)
  }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
            Projects
          </h3>
          <p className='text-sm text-gray-500'>Add your project details</p>
        </div>

        <button
          type='button'
          onClick={addProject}
          className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
          <Plus className='size-4' />
          Add Project
        </button>
      </div>

      <div className='space-y-4 mt-6'>
        {data.map((project, index) => (
          <div key={project._id} className='p-4 border border-gray-200 rounded-lg space-y-3'>
            <div className='flex justify-between items-start'>
              <h4>Project #{index + 1}</h4>

              <button
                onClick={() => removeProject(index)}
                className='text-red-500 hover:text-red-700 transition-colors'
              >
                <Trash2 className='size-4' />
              </button>
            </div>

            <div className='grid gap-3'>
              <input
                value={project.name || ""}
                type='text'
                placeholder='Project Name'
                onChange={(e) => updateProject(index, "name", e.target.value)}
                className='px-3 py-2 text-sm rounded-lg'
              />

              <input
                value={project.type || ""}
                type='text'
                placeholder='Project Type'
                onChange={(e) => updateProject(index, "type", e.target.value)}
                className='px-3 py-2 text-sm rounded-lg'
              />

              <textarea
                rows={4}
                value={project.description || ""}
                placeholder='Describe your project...'
                onChange={(e) => updateProject(index, "description", e.target.value)}
                className='w-full px-3 py-2 text-sm rounded-lg resize-none'
              />
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectForm
