import React from 'react';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';

const App = () => {
  return (
    <DataProvider>
      <Layout />
    </DataProvider>
  );
};

export default App;