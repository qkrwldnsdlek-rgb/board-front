import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './components/user/Home';
import PostList from './components/user/PostList';
import PostDetail from './components/user/PostDetail';
import PostForm from './components/user/PostForm';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import Login from './components/user/Login';
import MyPage from './components/user/MyPage';
import AdminPage from './components/admin/AdminPage';

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
              <Route path="/" element={<Home />} />
              <Route path="/posts" element={<PostList />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/posts/new" element={<PostForm />} />
              <Route path="/posts/:id/edit" element={<PostForm />} />
              <Route path="/login" element={<Login />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;