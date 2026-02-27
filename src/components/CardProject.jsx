import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight, Github, Star } from "lucide-react";

const CardProject = ({
  Img,
  Title,
  Description,
  Link: ProjectLink,
  Github: GithubLink,
  id,
  status,
  is_featured
}) => {

  const isPublished = status !== "draft";

  return (
    <div className="group relative w-full">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-lg border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20">

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

        <div className="relative p-5 z-10">

          {/* Image */}
          <div className="relative overflow-hidden rounded-lg aspect-video">
            <img
              src={Img || "/default-project.jpg"}
              alt={Title || "Project Image"}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Featured badge */}
            {is_featured && (
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs backdrop-blur">
                <Star className="w-3 h-3" />
                Featured
              </div>
            )}

            {/* Draft overlay */}
            {!isPublished && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-gray-300 text-sm font-medium">
                Draft Project
              </div>
            )}
          </div>

          {/* Content */}
          <div className="mt-4 space-y-3">

            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {Title || "Untitled Project"}
            </h3>

            <p className="text-gray-300/80 text-sm leading-relaxed line-clamp-2">
              {Description || "No description available."}
            </p>

            {/* Buttons */}
            <div className="pt-4 flex items-center justify-between">

              {/* Live Demo */}
              {ProjectLink && isPublished ? (
                <a
                  href={ProjectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <span className="text-sm font-medium">Live Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span className="text-gray-500 text-sm">
                  Demo Not Available
                </span>
              )}

              {/* Details */}
              {id && isPublished ? (
                <Link
                  to={`/project/${id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <span className="text-sm font-medium">Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-gray-500 text-sm">
                  Details Not Available
                </span>
              )}
            </div>

            {/* GitHub */}
            {GithubLink && isPublished && (
              <div className="pt-2">
                <a
                  href={GithubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>View Source</span>
                </a>
              </div>
            )}

          </div>

          {/* Border hover effect */}
          <div className="absolute inset-0 border border-white/0 group-hover:border-purple-500/50 rounded-xl transition-colors duration-300 -z-50"></div>
        </div>
      </div>
    </div>
  );
};

export default CardProject;
