/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { AuthorsBlock } from '../content/schema';

interface AuthorCardProps {
  name: string;
  role: string;
  delay: string;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ name, role, delay }) => {
  return (
    <div
      className="flex flex-col group animate-fade-in-up items-center p-8 bg-theme-card rounded-xl border border-theme-border shadow-xs hover:shadow-md transition-all duration-300 w-full max-w-xs hover:border-theme-accent/50"
      style={{ animationDelay: delay }}
    >
      <h3 className="font-serif text-2xl text-theme-main text-center mb-3">{name}</h3>
      <div className="w-12 h-0.5 bg-theme-accent mb-4 opacity-60"></div>
      <p className="text-xs text-theme-muted font-bold uppercase tracking-widest text-center leading-relaxed">{role}</p>
    </div>
  );
};

interface AuthorsSectionProps {
  authors: AuthorsBlock;
}

export const AuthorsSection: React.FC<AuthorsSectionProps> = ({ authors }) => {
  return (
    <section id="authors" className="py-20 bg-theme-bg border-b border-theme-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block mb-3 text-xs font-bold tracking-widest text-theme-muted uppercase">{authors.eyebrow}</div>
          <h2 className="font-serif text-3xl md:text-5xl mb-4 text-theme-main">{authors.heading}</h2>
          {authors.subheading && (
            <p className="text-theme-muted max-w-2xl mx-auto">{authors.subheading}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center flex-wrap">
          {authors.list.map((author, index) => (
            <AuthorCard
              key={index}
              name={author.name}
              role={author.role}
              delay={`${index * 0.1}s`}
            />
          ))}
        </div>
        {authors.footnote && (
          <div className="text-center mt-12">
            <p className="text-theme-muted italic">{authors.footnote}</p>
          </div>
        )}
      </div>
    </section>
  );
};
