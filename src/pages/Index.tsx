import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import NavigationCards from '@/components/home/NavigationCards';
import StatsSection from '@/components/home/StatsSection';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <NavigationCards />
      <StatsSection />
    </Layout>
  );
};

export default Index;
