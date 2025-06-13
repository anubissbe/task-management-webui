function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Task Management</h1>
      <nav className="mb-8">
        <a href="/" className="mr-4">Projects</a>
        <a href="/board" className="mr-4">Board</a>
        <a href="/analytics" className="mr-4">Analytics</a>
      </nav>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded"
        aria-label="Toggle theme"
        onClick={() => document.documentElement.classList.toggle('dark')}
      >
        Toggle Theme
      </button>
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
          Add project
        </button>
        <p className="mt-4">No projects yet. Create your first project to get started.</p>
      </div>
    </div>
  );
}

export default App;