import Navbar from './components/Navbar';

export default function App() {
  return (
    <div className="text-gray-800 antialiased min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900">Моніторинг сайтів</h1>
        <p className="text-gray-500 text-sm mt-1">
          Відстежуйте доступність ваших ресурсів у реальному часі
        </p>
      </main>
    </div>
  );
}
