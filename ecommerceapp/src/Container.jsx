export default function Container({ children }) {
  return (
    <div style={containerStyle}>
      {children}
    </div>
  )
}

const containerStyle = {
  width: '100vw',
  margin: '0 auto',
  padding: '1em',
  background: '#eee'
}