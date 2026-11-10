import React, { useState } from 'react';
import { SimkasProvider, useSimkas } from './context/SimkasContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { DatabaseModal } from './components/DatabaseModal';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './views/DashboardView';
import { SantriDataView } from './views/SantriDataView';
import { KegiatanView } from './views/KegiatanView';
import { PerizinanView } from './views/PerizinanView';
import { LaporanView } from './views/LaporanView';
import { ProfilSantriView } from './views/ProfilSantriView';
import { KedisiplinanView } from './views/KedisiplinanView';
import { KasOperasionalView } from './views/KasOperasionalView';
import { SppView } from './views/SppView';
import { KasSantriView } from './views/KasSantriView';

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentView } = useSimkas();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'santris':
        return <SantriDataView />;
      case 'kegiatan':
        return <KegiatanView />;
      case 'perizinan':
        return <PerizinanView />;
      case 'spp':
      case 'keuangan':
        return <SppView />;
      case 'kas-santri':
        return <KasSantriView />;
      case 'kedisiplinan':
        return <KedisiplinanView />;
      case 'kas-operasional':
        return <KasOperasionalView />;
      case 'laporan':
        return <LaporanView />;
      case 'profil':
        return <ProfilSantriView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header toggleMobileMenu={toggleMobileMenu} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/60">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActiveView()}
          </div>
        </main>
      </div>

      <LoginModal />
      <DatabaseModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SimkasProvider>
      <MainLayout />
    </SimkasProvider>
  );
}
