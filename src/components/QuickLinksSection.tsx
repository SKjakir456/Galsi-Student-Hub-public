import {
  GraduationCap,
  FileText,
  Calendar,
  Building2,
  BookOpen,
  ClipboardList,
  LogIn,
  CreditCard
} from 'lucide-react';
import { QuickActionCard } from './QuickActionCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const quickLinks = [
  {
    icon: LogIn,
    title: 'Student Login',
    description: 'Access your student portal for attendance, marks, fees, and more.',
    href: 'https://galsimahavidyalaya.in/student_login.aspx',
  },
  {
    icon: CreditCard,
    title: 'Fee Payment',
    description: 'Pay semester fees, examination fees, and other payments online.',
    href: 'https://galsimahavidyalaya.in/student_login.aspx',
  },
  {
    icon: GraduationCap,
    title: 'Admissions 2025-26',
    description: 'Apply online through WBCAP portal for new admissions and semester enrollment.',
    href: 'https://wbcap.in/',
  },
  {
    icon: FileText,
    title: 'Results & Grade Cards',
    description: 'Download semester results, grade cards, and provisional certificates.',
    href: 'https://galsimahavidyalaya.ac.in/result/',
  },
  {
    icon: Calendar,
    title: 'Academic Calendar',
    description: 'View class routines, exam schedules, and important academic dates.',
    href: 'https://galsimahavidyalaya.ac.in/academic-calender/',
  },
  {
    icon: Building2,
    title: 'Departments',
    description: 'Explore all departments, faculty members, and course offerings.',
    href: 'https://galsimahavidyalaya.ac.in/department/',
  },
  {
    icon: BookOpen,
    title: 'Library',
    description: 'Access library resources, e-books, and OPAC catalog.',
    href: 'https://galsimahavidyalaya.ac.in/central-library/',
  },
  {
    icon: ClipboardList,
    title: 'Examinations',
    description: 'Exam forms, admit cards, and examination guidelines (CBCS & NEP).',
    href: 'https://galsimahavidyalaya.ac.in/examination/',
  },
];

export function QuickLinksSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section id="quick-links" className="py-24 md:py-32" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`reveal ${isVisible ? 'visible' : ''}`}>
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Quick Access
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Jump directly to the most frequently used sections of the college portal.
            </p>
          </div>

          {/* Cards Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children ${isVisible ? 'visible' : ''}`}>
            {quickLinks.map((link) => (
              <QuickActionCard
                key={link.title}
                icon={link.icon}
                title={link.title}
                description={link.description}
                href={link.href}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
