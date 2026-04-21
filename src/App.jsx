import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/new" element={<PostForm />} />
        <Route path="/posts/:id/edit" element={<PostForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;