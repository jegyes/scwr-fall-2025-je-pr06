export default function Container({ children }) {
  return (
    <div style={containerStyle}>
      {children}
    </div>
  )
}

const containerStyle = {
  width: '100%',
  maxWidth: '1024px',
  margin: '20px auto',
  padding: '0 16px'
}