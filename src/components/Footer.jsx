function Footer() {
  return (
    <footer style={{
      backgroundColor: '#fff',
      borderTop: '1px solid #eee',
      padding: '24px',
      textAlign: 'center',
      marginLeft: '240px',
    }}>
      <p style={{fontSize: '13px', color: '#bbb', marginBottom: '8px'}}>
        © 2026 Board. All rights reserved.
      </p>
      <p style={{fontSize: '12px', color: '#ddd'}}>
        Made with React + Spring Boot + PostgreSQL
      </p>
    </footer>
  );
}

export default Footer;