import { Outlet } from 'react-router-dom';
import NavBar from '@/components/shared/NavBar';
import Footer from '@/components/shared/Footer';

export function DocLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-muted">
      <NavBar />
      <div className="container mx-auto max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
