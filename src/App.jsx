import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{display: 'flex', marginTop: '60px'}}>
        <Sidebar />
        <div style={{
          marginLeft: '240px',
          flex: 1,
          minHeight: 'calc(100vh - 60px)',
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
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;