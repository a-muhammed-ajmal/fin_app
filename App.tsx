import React from 'react';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <DataProvider>
        <Layout />
      </DataProvider>
    </ErrorBoundary>
  );
};

export default App;