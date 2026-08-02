import { redirect } from 'next/navigation';

export default function RootPage() {
  // Arahkan pengunjung ke halaman login terlebih dahulu
  redirect('/login');
}