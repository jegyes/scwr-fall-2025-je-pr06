/* src/Main.js */
import { useState, useEffect } from 'react'
import Container from './Container'
import { get, del } from 'aws-amplify/api'
import { List } from 'antd'
import checkUser from './checkUser'
import Nav from './Nav'

function Home() {
  const [state, setState] = useState({products: [], loading: true})
  const [user, updateUser] = useState({})
  // let didCancel = false

  useEffect(() => {
    getProducts()
    checkUser(updateUser)
    // return () => didCancel = true
  }, [])
  
async function getProducts() {
  try {
    const request = await get({
      apiName: "ecommerceapi",
      path: "/products",
    });

    const res = await request.response; // contains statusCode, headers, body
    console.log("status:", res.statusCode);
    console.log("headers:", res.headers);

    const text = await res.body.text();
    console.log("raw body:", text);

    // If it's JSON, parse it
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    console.log("parsed:", data);

    const items =
      data?.data?.Items ??
      data?.Items ??
      data?.items ??
      data?.data ??
      [];

    setState({ products: items, loading: false });
  } catch (err) {
    console.log("getProducts error:", err);
    setState({ products: [], loading: false });
  }
}
  return (
    <Container>
      This is the home page

      <List
        itemLayout="horizontal"
        dataSource={state.products}
        loading={state.loading}
        renderItem={item => (
          <List.Item
            actions={user.isAuthorized ?
              [<p onClick={() => deleteItem(item.id)}
                  key={item.id}>delete</p>] : null}
          >
            <List.Item.Meta
              title={item.name}
              description={item.price}
            />
          </List.Item>
        )}
      />
    </Container>
  )
}

export default Home