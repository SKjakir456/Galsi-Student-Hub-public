import { 
  CreditCard, 
  FileCheck, 
  Users,
  Award,
  Landmark,
  BookMarked
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const services = [
  {
    icon: CreditCard,
    title: 'Fee Payment',
    description: 'Pay tuition and other fees online',
    href: 'https://galsimahavidyalaya.ac.in/fees-structure-2/',
  },
  {
    icon: FileCheck,
    title: 'Registration',
    description: 'B.U. Registration & Enrollment',
    href: 'https://galsimahavidyalaya.ac.in/b-u-registration/',
  },
  {
    icon: BookMarked,
    title: 'IQAC',
    description: 'Internal Quality Assurance Cell',
    href: 'https://galsimahavidyalaya.ac.in/iqac-2/',
  },
  {
    icon: Users,
    title: 'NSS',
    description: 'National Service Scheme',
    href: 'https://galsimahavidyalaya.ac.in/nss-2/',
  },
  {
    icon: Award,
    title: 'Scholarships',
    description: 'Kanyashree, OASIS, Aikyashree',
    href: 'https://oasis.gov.in/',
  },
  {
    icon: Landmark,
    title: 'NIRF',
    description: 'National Institutional Ranking',
    href: 'https://galsimahavidyalaya.ac.in/nirf-2/',
  },
];

export function ServicesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section id="services" className="py-24 md:py-32" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`reveal ${isVisible ? 'visible' : ''}`}>
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Student Services
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Quick access to essential services designed to support your academic journey.
            </p>
          </div>

          {/* Services Grid */}
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 stagger-children ${isVisible ? 'visible' : ''}`}>
            {services.map((service) => (
              <a
                key={service.title}
                href={service.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card-elevated p-4 md:p-6 text-center hover-lift group cursor-pointer"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center group-hover:from-primary/25 group-hover:to-accent/20 transition-all duration-300 border border-primary/10">
                  <service.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed hidden md:block">
                  {service.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
