import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';
import SearchForm from './components/SearchForm';
import FlightList from './components/FlightList';
import { LogIn, LogOut, User, Plane } from 'lucide-react';
import { useState } from 'react';
import { auth } from './api/backend';
import toast from 'react-hot-toast';

function App() {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        await auth.register({ email, password, name });
        toast.success('Konto utworzone! Zaloguj się.');
        setIsRegister(false);
        setName('');
      } else {
        const response = await auth.login({ email, password });
        const token = response.data.access_token;
        localStorage.setItem('token', token);

        const userResponse = await auth.getMe();
        setAuth(userResponse.data, token);

        toast.success('Zalogowano pomyślnie!');
        setShowLogin(false);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Błąd auth:', error);
      toast.error(error.response?.data?.detail || 'Błąd logowania');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Wyszukiwarka Lotów Ryanair
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-600 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Wyloguj
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Zaloguj się
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              {isRegister ? 'Rejestracja' : 'Logowanie'}
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasło
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {isRegister ? 'Zarejestruj się' : 'Zaloguj'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-blue-600 hover:underline"
              >
                {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
              </button>
            </div>

            <button
              onClick={() => setShowLogin(false)}
              className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form - Left Sidebar */}
          <div className="lg:col-span-1">
            <SearchForm />

            {!isAuthenticated && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Zaloguj się</strong> aby zapisywać wyszukiwania,
                  ulubione loty i tworzyć alerty cenowe!
                </p>
              </div>
            )}
          </div>

          {/* Results - Main Area */}
          <div className="lg:col-span-2">
            <FlightList />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              🚀 <strong>Jak to działa?</strong>
            </p>
            <p className="text-sm">
              Wyszukiwarka łączy się <strong>bezpośrednio z API Ryanair</strong> z Twojej przeglądarki.
              <br />
              Nasz backend zapisuje tylko historię wyszukiwań i ulubione - nie przeciąża serwerów Ryanair!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
