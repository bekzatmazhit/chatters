import React, { useState } from 'react';
import { BrandProvider } from './components/BrandContext';
import WorkspacesHubView from './components/views/WorkspacesHubView';

function App() {
  return (
    <BrandProvider>
      <div className="bg-background min-h-screen text-content-primary">
        <WorkspacesHubView />
      </div>
    </BrandProvider>
  );
}

export default App;
