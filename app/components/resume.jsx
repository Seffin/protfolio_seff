import React from 'react';
import data from '../../data.json';
import { GoBriefcase, GoMortarBoard, GoVerified } from 'react-icons/go';

export const Resume = () => {
    const { experience, education, certifications } = data;

    const hasExperience = experience && experience.length > 0;
    const hasEducation = education && education.length > 0;
    const hasCertifications = certifications && certifications.length > 0;

    if (!hasExperience && !hasEducation && !hasCertifications) return null;

    return (
        <div className="w-full max-w-2xl mx-auto mt-16 text-left animate-fade-in px-4">
            {hasExperience && (
                <div className="mb-12">
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 mb-6">
                        <GoBriefcase className="w-6 h-6" /> Experience
                    </h3>
                    <div className="space-y-8 border-l border-zinc-700 ml-3 pl-6">
                        {experience.map((exp, index) => (
                            <div key={index} className="relative">
                                <span className="absolute -left-[33px] top-1 h-3 w-3 rounded-full bg-zinc-300 ring-4 ring-black" />
                                <h4 className="text-lg font-medium text-zinc-200">{exp.role}</h4>
                                <div className="text-sm font-medium text-zinc-300 mt-1">{exp.company} <span className="text-zinc-500 font-normal">| {exp.location}</span></div>
                                <div className="text-xs text-zinc-500 mt-1">{exp.period}</div>
                                {exp.highlights && exp.highlights.length > 0 && (
                                    <ul className="mt-3 list-disc list-inside text-sm text-zinc-400 space-y-1">
                                        {exp.highlights.map((highlight, hIndex) => (
                                            <li key={hIndex} className="leading-snug">{highlight}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasEducation && (
                <div className="mb-12">
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 mb-6">
                        <GoMortarBoard className="w-6 h-6" /> Education
                    </h3>
                    <div className="space-y-6 border-l border-zinc-700 ml-3 pl-6">
                        {education.map((edu, index) => (
                            <div key={index} className="relative">
                                <span className="absolute -left-[33px] top-1 h-3 w-3 rounded-full bg-zinc-300 ring-4 ring-black" />
                                <h4 className="text-lg font-medium text-zinc-200">{edu.degree}</h4>
                                <div className="text-sm text-zinc-300 mt-1">{edu.institution}</div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                                    <span>{edu.period}</span>
                                    {edu.score && <span className="px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-300">{edu.score}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasCertifications && (
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 mb-6">
                        <GoVerified className="w-6 h-6" /> Certifications
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certifications.map((cert, index) => (
                            <li key={index} className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition duration-300">
                                <GoVerified className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                                <span className="text-sm text-zinc-300 leading-snug">{cert}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
