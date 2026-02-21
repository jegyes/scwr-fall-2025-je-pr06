/* src/Admin.js */
import  { useState } from 'react'
import './App.css'
import { Input, Button } from 'antd'
import { post } from 'aws-amplify/api'
import { withAuthenticator } from '@aws-amplify/ui-react'

const initialState = {name: '', price: ''}

// eslint-disable-next-line react-refresh/only-export-components
function Admin() {
  const [itemInfo, updateItemInfo] = useState(initialState)
  function updateForm(e) {
    const formData = {
      ...itemInfo, [e.target.name]: e.target.value
    }
    updateItemInfo(formData)
  }
  async function addItem() {
    try {
      const data = {
        body: { ...itemInfo, price: parseInt(itemInfo.price) }
      }
      updateItemInfo(initialState)
      const { response } = await post({
        apiName: 'ecommerceapi',
        path: '/products',
        options: data
      })
      console.log('item added', response)
    } catch (err) {
      console.log('error adding item...', err)
    }
  }
  return (
    <div style={containerStyle}>
      <Input
        name='name'
        onChange={updateForm}
        value={itemInfo.name}
        placeholder='Item name'
        style={inputStyle}
      />
      <Input
        price='price'
        onChange={updateForm}
        value={itemInfo.price}
        placeholder='item price'
        style={inputStyle}
      />
      <Button
        style={buttonStyle}
        onClick={addItem}
      >
        Add Product
      </Button>
    </div>
  )
}

const containerStyle = { width: 400, margin: '20px auto' }
const inputStyle = { marginTop: 10 }
const buttonStyle = { marginTop: 10 }

export default withAuthenticator(Admin)