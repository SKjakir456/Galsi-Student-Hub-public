import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { NoticesSection } from '@/components/NoticesSection';
import { QuickLinksSection } from '@/components/QuickLinksSection';
import { DepartmentsSection } from '@/components/DepartmentsSection';
import { ServicesSection } from '@/components/ServicesSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { BackgroundImage } from '@/components/BackgroundImage';
import { AdminNotificationTest } from '@/components/AdminNotificationTest';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <BackgroundImage />
      <Header />
      <AdminNotificationTest />
      <main>
        <Hero />
        <NoticesSection />
        <DepartmentsSection />
        <QuickLinksSection />
        <ServicesSection />
        <ContactSection />
      </main>
      <Footer />
      <PWAInstallBanner />
    </div>
  );
};

export default Index;
