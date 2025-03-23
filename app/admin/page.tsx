'use client';

import Link from 'next/link';
import RoomAdmin from '@/components/RoomAdmin';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Administration des Chambres
            </h1>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Retour au tableau de bord
            </Link>
          </div>
          <RoomAdmin />
        </div>
      </div>
    </main>
  );
} 