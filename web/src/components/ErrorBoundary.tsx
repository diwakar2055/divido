import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className='min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center px-4'>
                    <div className='bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center'>
                        <div className='w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className='text-2xl font-bold text-gray-800 mb-2'>Something went wrong</h1>
                        <p className='text-gray-600 mb-6'>
                            We're sorry, but an unexpected error has occurred.
                        </p>
                        <div className='flex justify-center gap-4'>
                            <button
                                onClick={() => window.location.reload()}
                                className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium'
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className='bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium'
                            >
                                Go Home
                            </button>
                        </div>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-6 text-left bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40 font-mono text-red-600">
                                {this.state.error.toString()}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
