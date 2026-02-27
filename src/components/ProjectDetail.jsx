import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDeveloper } from "../context/DeveloperContext";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Code2,
  Star,
  ChevronRight,
  Layers,
  Package
} from "lucide-react";
import Swal from "sweetalert2";

const TECH_ICONS = {
  React: Code2,
  Tailwind: Code2,
  Express: Code2,
  Python: Code2,
  Javascript: Code2,
  HTML: Code2,
  CSS: Code2,
  default: Package,
};

const TechBadge = ({ tech }) => {
  const Icon = TECH_ICONS[tech] || TECH_ICONS["default"];

  return (
    <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
      <Icon className="w-4 h-4 text-purple-400" />
      <span className="text-sm text-gray-300">{tech}</span>
    </div>
  );
};

const FeatureItem = ({ feature }) => (
  <li className="flex items-start gap-2 text-gray-300">
    <span className="w-2 h-2 mt-2 rounded-full bg-purple-400"></span>
    <span>{feature}</span>
  </li>
);

const handleGithubClick = (githubLink) => {
  if (!githubLink || githubLink === "Private") {
    Swal.fire({
      icon: "info",
      title: "Source Code Private",
      text: "هذا المشروع كوده خاص وغير متاح حالياً.",
      confirmButtonColor: "#6366f1",
      background: "#030014",
      color: "#ffffff",
    });
    return false;
  }
  return true;
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjects } = useDeveloper();

  const [project, setProject] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const projects = getProjects() || [];
    const selected = projects.find((p) => String(p.id) === id);

    if (selected) {
      setProject({
        id: selected.id,
        title: selected.title,
        description: selected.description,
        image: selected.image,
        technologies: selected.technologies || [],
        features: selected.features || [],
        live_url: selected.live_url,
        github_url: selected.github_url,
      });
    }
  }, [id, getProjects]);

  if (!project) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <p className="text-white text-xl">Loading Project...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <span>Projects</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{project.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* Left Side */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
              {project.title}
            </h1>

            <p className="text-gray-300 leading-relaxed">
              {project.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}

              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) =>
                    !handleGithubClick(project.github_url) &&
                    e.preventDefault()
                  }
                  className="px-6 py-3 border border-white/20 rounded-lg flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  Github
                </a>
              )}
            </div>

            {/* Technologies */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                Technologies
              </h3>

              {project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => (
                    <TechBadge key={index} tech={tech} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No technologies added.</p>
              )}
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Key Features
              </h3>

              {project.features.length > 0 ? (
                <ul className="space-y-3">
                  {project.features.map((feature, index) => (
                    <FeatureItem key={index} feature={feature} />
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No features added.</p>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div>
            {project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="rounded-xl border border-white/10"
              />
            ) : (
              <div className="h-80 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <Layers className="w-12 h-12 text-gray-600" />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
