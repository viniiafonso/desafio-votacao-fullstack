import { Link } from 'react-router-dom';
import { ArrowLeft, Vote } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="card text-center py-20 max-w-md mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-earth-100 mx-auto mb-4">
        <Vote className="h-8 w-8 text-earth-400" />
      </div>
      <p className="text-5xl font-bold text-earth-300 mb-2">404</p>
      <h1 className="text-xl font-bold text-coop-900">Página não encontrada</h1>
      <p className="text-earth-500 text-sm mt-2">A rota acessada não existe no sistema.</p>
      <Link to="/" className="btn-primary mt-8 inline-flex">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Pautas
      </Link>
    </div>
  );
}
