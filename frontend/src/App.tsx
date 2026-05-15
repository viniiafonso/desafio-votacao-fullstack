import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ListaPautasPage } from '@/pages/ListaPautasPage';
import { CriarPautaPage } from '@/pages/CriarPautaPage';
import { DetalhePautaPage } from '@/pages/DetalhePautaPage';
import { VotarPage } from '@/pages/VotarPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Página do cooperado — sem o layout administrativo */}
      <Route path="/votar/:id" element={<VotarPage />} />

      {/* Painel administrativo */}
      <Route element={<Layout />}>
        <Route path="/" element={<ListaPautasPage />} />
        <Route path="/pautas/nova" element={<CriarPautaPage />} />
        <Route path="/pautas/:id" element={<DetalhePautaPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
