import React from "react";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const ModernTemplate = ({ data = {}, accentColor = "#3B82F6" }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1] || 1) - 1;
    if (!year) return "";
    return new Date(year, month).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const projects = Array.isArray(data.projects) ? data.projects : [];
  const experience = Array.isArray(data.experience) ? data.experience : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const skills = Array.isArray(data.skills) ? data.skills : [];

  const displayHost = (url) => {
    try {
      if (!url) return "";
      const u = new URL(url.includes("://") ? url : `https://${url}`);
      return u.host.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-800">
      {/* Header */}
      <header className="p-8 text-white" style={{ backgroundColor: accentColor }}>
        <h1 className="text-4xl font-light mb-3">{data.personal_info?.full_name || "Your Name"}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {data.personal_info?.email && (
            <div className="flex items-center gap-2">
              <Mail className="size-4" />
              <span>{data.personal_info.email}</span>
            </div>
          )}
          {data.personal_info?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="size-4" />
              <span>{data.personal_info.phone}</span>
            </div>
          )}
          {data.personal_info?.location && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span>{data.personal_info.location}</span>
            </div>
          )}
          {data.personal_info?.linkedin && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={data.personal_info.linkedin}
              className="flex items-center gap-2"
            >
              <Linkedin className="size-4" />
              <span className="break-all text-xs">{displayHost(data.personal_info.linkedin)}</span>
            </a>
          )}
          {data.personal_info?.website && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={data.personal_info.website}
              className="flex items-center gap-2"
            >
              <Globe className="size-4" />
              <span className="break-all text-xs">{displayHost(data.personal_info.website)}</span>
            </a>
          )}
        </div>
      </header>

      <div className="p-8">
        {/* Professional Summary */}
        {data.professional_summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">Professional Summary</h2>
            <p className="text-gray-700">{data.professional_summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-light mb-6 pb-2 border-b border-gray-200">Experience</h2>

            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={exp._id ?? index} className="relative pl-6 border-l border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">{exp.position || ""}</h3>
                      <p className="font-medium" style={{ color: accentColor }}>
                        {exp.company || ""}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                      {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                    </div>
                  </div>
                  {exp.description && <div className="text-gray-700 leading-relaxed mt-3 whitespace-pre-line">{exp.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">Projects</h2>

            <div className="space-y-6">
              {projects.map((p, index) => (
                <div key={p._id ?? index} className="relative pl-6 border-l border-gray-200" style={{ borderLeftColor: accentColor }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{p.name || ""}</h3>
                    </div>
                  </div>
                  {p.description && <div className="text-gray-700 leading-relaxed text-sm mt-3">{p.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid sm:grid-cols-2 gap-8">
          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">Education</h2>

              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={edu._id ?? index}>
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree || ""} {edu.field ? `in ${edu.field}` : ""}
                    </h3>
                    <p style={{ color: accentColor }}>{edu.institution || ""}</p>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{formatDate(edu.graduation_date)}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">Skills</h2>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={skill._id ?? skill ?? index}
                    className="px-3 py-1 text-sm text-white rounded-full"
                    style={{ backgroundColor: accentColor }}
                  >
                    {typeof skill === "string" ? skill : skill.name || ""}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
