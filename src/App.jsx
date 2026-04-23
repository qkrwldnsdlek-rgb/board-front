import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Login from './components/Login';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{display: 'flex', marginTop: '60px'}}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content" 
          onClick={() => setSidebarOpen(false)}
          style={{
            marginLeft: '240px',
            flex: 1,
            minHeight: '100vh',
            backgroundColor: '#f5f7fa',
            display: 'flex',
            flexDirection: 'column'
          }}>
          <div style={{flex: 1, padding: '24px 0'}}>
            <Routes>
              <Route path="/" element={<PostList />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/posts/new" element={<PostForm />} />
              <Route path="/posts/:id/edit" element={<PostForm />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;