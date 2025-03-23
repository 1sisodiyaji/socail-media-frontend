import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-rose-500 mb-4">404</h1>
            <p className="text-2xl font-semibold text-white mb-2">Page Not Found</p>
            <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      );
    }

    if (error.status === 401) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-rose-500 mb-4">401</h1>
            <p className="text-2xl font-semibold text-white mb-2">Unauthorized</p>
            <p className="text-gray-400 mb-8">Please log in to continue.</p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              Log In
            </a>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-rose-500 mb-4">Oops!</h1>
        <p className="text-2xl font-semibold text-white mb-2">Something went wrong</p>
        <p className="text-gray-400 mb-8">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          Try Again
        </a>
      </div>
    </div>
  );
};

export default ErrorBoundary; 