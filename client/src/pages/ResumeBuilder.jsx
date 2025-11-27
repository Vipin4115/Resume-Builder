// src/pages/ResumeBuilder.jsx
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, Briefcase, ChevronLeft, ChevronRight, DownloadIcon, EyeIcon, EyeOffIcon, FileText, FolderIcon, GraduationCap, Share2Icon, Sparkles, User } from 'lucide-react'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm'
import ExperineceForm from '../components/ExperineceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillsForm from '../components/SkillsForm'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'

const ResumeBuilder = () => {
  const { resumeId } = useParams()
  const { token } = useSelector(state => state.auth)
  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    personal_info: {},
    professional_summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
  })

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false)

  const sections = [
    { id: "personal", name: "Personal info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ]

  const activeSection = sections[activeSectionIndex]

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get('/api/resumes/get/' + resumeId, { headers: { Authorization: token } })
      if (data.resume) {
        setResumeData(data.resume)
        document.title = data.resume.title || 'Resume Builder'
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    loadExistingResume()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeResumeVisibility = async () => {
    try {
      const formData = new FormData()
      formData.append("resumeId", resumeId)
      formData.append("resumeData", JSON.stringify({ public: !resumeData.public }))
      const { data } = await api.put('/api/resumes/update', formData, { headers: { Authorization: token } })
      setResumeData(prev => ({ ...prev, public: !prev.public }))
      toast.success(data.message)
    } catch (error) {
      console.error("Error saving resume:", error)
      toast.error("Failed to change visibility")
    }
  }

  const handleShare = () => {
    const frontendUrl = window.location.href.split("/app/")[0]
    const resumeUrl = frontendUrl + '/view/' + resumeId;

    if (navigator.share) {
      navigator.share({ url: resumeUrl, text: "My Resume" })
    }
    else {
      alert('Share not supported on this browser.')
    }
  }

  const downloadResume = () => {
    window.print();
  }

  // helper: convert dataURL -> File
  function dataUrlToFile(dataUrl, fileName = 'upload.jpg') {
    const [meta, base64] = dataUrl.split(',');
    if (!base64) return null;
    const mimeMatch = meta.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const binary = atob(base64);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return new File([u8], fileName, { type: mime });
  }

  // Robust saveResume
  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData);

      // If a File or object is stored in personal_info.image, don't include it in JSON
      if (updatedResumeData.personal_info?.image && typeof updatedResumeData.personal_info.image === 'object') {
        delete updatedResumeData.personal_info.image;
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(updatedResumeData));

      // normalize and send removeBackground flag that server expects
      if (removeBackground) formData.append("removeBackground", "true");

      // handle image possibilities
      const imgObj = resumeData.personal_info?.image;
      let appended = false;

      if (imgObj instanceof File) {
        formData.append("image", imgObj);
        appended = true;
      } else if (imgObj && typeof imgObj === 'object' && imgObj.file && imgObj.file instanceof File) {
        formData.append("image", imgObj.file);
        appended = true;
      } else if (typeof imgObj === 'string' && imgObj.startsWith('data:')) {
        const file = dataUrlToFile(imgObj, 'resume.jpg');
        if (file) {
          formData.append("image", file);
          appended = true;
        }
      } else if (imgObj && imgObj.rawFile && imgObj.rawFile instanceof File) {
        formData.append("image", imgObj.rawFile);
        appended = true;
      }

      // Debug: list keys (useful during dev)
      for (const [k, v] of formData.entries()) {
        console.log("FormData:", k, v);
      }

      const { data } = await api.put("/api/resumes/update", formData, {
        headers: {
          Authorization: token, // keep consistent with your backend
        },
      });

      console.log("save response", data);

      if (data.resume) {
        // Replace entire resume with server truth to avoid stale merges
        setResumeData(data.resume);
      } else {
        await loadExistingResume();
      }

      toast.success(data.message);
    } catch (error) {
      console.error("Error saving resume:", error);
      console.error("server body:", error.response?.data);
      toast.error("Failed to save resume");
    }
  };

  useEffect(() => {
    console.log('resumeData.projects changed', resumeData.projects)
  }, [resumeData.projects])

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <Link to={'/app'} className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all'>
          <ArrowLeftIcon className='size-4' />Back to Dashboard
        </Link>
      </div>

      <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='grid lg:grid-cols-12 gap-8'>

          <div className='relative lg:col-span-5 rounded-lg overflow-hidden '>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              <hr className='absolute top-0 left-0 right-0 border-2 border-gray-200' />
              <hr className='absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration -2000'
                style={{ width: `${activeSectionIndex * 100 / (sections.length - 1)}%` }} />

              <div className='flex justify-between items-center mb-6 border-b border-gray-300 py-1' >
                <div className='flex items-center gap-2'>
                  <TemplateSelector selectedTemplate={resumeData.template} onChange={(template) => setResumeData(prev => ({ ...prev, template }))} />
                  <ColorPicker selectedColor={resumeData.accent_color} onChange={(color) => setResumeData(prev => ({ ...prev, accent_color: color }))} />
                </div>

                <div className='flex items-center'>
                  {
                    activeSectionIndex !== 0 && (
                      <button onClick={() => setActiveSectionIndex((prevIndex) => Math.max(prevIndex - 1, 0))}
                        className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all' disabled={activeSectionIndex === 0}>
                        <ChevronLeft className='size-4' /> Previous
                      </button>
                    )
                  }
                  <button onClick={() => setActiveSectionIndex((prevIndex) => Math.min(prevIndex + 1, sections.length - 1))}
                    className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && 'opacity-50'}`}
                    disabled={activeSectionIndex === sections.length - 1}>
                    Next<ChevronRight className='size-4' />
                  </button>
                </div>
              </div>

              <div className='space-y-6'>
                {
                  activeSection.id === 'personal' && (
                    <PersonalInfoForm data={resumeData.personal_info} onChange={(data) => setResumeData(prev => ({ ...prev, personal_info: data }))}
                      removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />
                  )
                }
                {
                  activeSection.id === 'summary' && (
                    <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(data) => setResumeData(prev => ({ ...prev, professional_summary: data }))}
                      setResumeData={setResumeData} />
                  )
                }
                {
                  activeSection.id === 'experience' && (
                    <ExperineceForm data={resumeData.experience} onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))} />
                  )
                }
                {
                  activeSection.id === 'education' && (
                    <EducationForm data={resumeData.education} onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))} />
                  )
                }
                {
                  activeSection.id === 'projects' && (
                    <ProjectForm data={resumeData.projects} onChange={(data) => setResumeData(prev => ({ ...prev, projects: data }))} />
                  )
                }
                {
                  activeSection.id === 'skills' && (
                    <SkillsForm data={resumeData.skills} onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))} />
                  )
                }
              </div>
              <button onClick={() => { toast.promise(saveResume, { loading: 'Saving...' }) }} className='bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm'>
                Save Changes
              </button>
            </div>
          </div>

          <div className='lg:col-span-7 max-lg:mt-6'>
            <div className='w-full flex items-center justify-end gap-2 mb-4'>
              {resumeData.public && (
                <button onClick={handleShare} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors'>
                  <Share2Icon className='size-4' /> Share
                </button>
              )}

              <button onClick={changeResumeVisibility} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors'>
                {resumeData.public ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' />}
                {resumeData.public ? 'Public' : 'Private'}
              </button>

              <button onClick={downloadResume} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
                <DownloadIcon className='size-4' /> Download
              </button>
            </div>

            <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder
