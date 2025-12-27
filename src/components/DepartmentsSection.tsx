import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { DepartmentCard } from './DepartmentCard';
import { departmentsData } from '@/lib/departmentsData';

export function DepartmentsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const [openDept, setOpenDept] = useState<string | null>(null);

  const handleToggle = (deptName: string) => {
    setOpenDept(prev => prev === deptName ? null : deptName);
  };

  return (
    <section id="departments" className="py-24 md:py-32 relative" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`reveal ${isVisible ? 'visible' : ''}`}>
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Departments
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore the diverse academic departments offering Honours and General courses under NEP 2020 & CBCS. Click on any department to view details, syllabus, routine, and more.
            </p>
          </div>

          {/* Departments Grid */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children ${isVisible ? 'visible' : ''}`}>
            {departmentsData.map((dept) => (
              <DepartmentCard 
                key={dept.name} 
                department={dept} 
                isOpen={openDept === dept.name}
                onToggle={() => handleToggle(dept.name)}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
