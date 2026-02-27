/* src/Main.js */
import { useState, useEffect } from 'react'
import Container from './Container'
import { get, del, post } from 'aws-amplify/api'
import { Table, Button, Popconfirm } from "antd";
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

async function deleteItem(id) {
  try {
    await del({
      apiName: "ecommerceapi",
      path: `/products/${id}`, // backticks matter
    });

    // Update UI immediately
    setState((s) => ({
      ...s,
      products: s.products.filter((p) => p.id !== id),
    }));

    console.log("successfully deleted item:", id);
  } catch (err) {
    console.log("error deleting item:", err);
  }
}

async function upvoteItem(id) {
  try {
    const { response } = await post({
      apiName: "ecommerceapi",
      path: `/products/${id}/upvote`,
    });

    console.log("upvote success", response);

    // Option 1: refetch all products
    getProducts();

    // Option 2 (faster): update state locally instead
    /*
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === id ? { ...p, likes: (p.likes ?? 0) + 1 } : p
      ),
    }));
    */
  } catch (err) {
    console.log("error upvoting item:", err);
  }
}
return (
  <Container>
    This is the home page

    <Table
      rowKey={(item) => item.id}                 // important: stable unique key
      dataSource={state.products}
      loading={state.loading}
      pagination={false}                         // optional: remove if you want pagination
      columns={[
        {
          title: "Item",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "Price",
          dataIndex: "price",
          key: "price",
          render: (value) => (value ?? ""),      // optional formatting spot
        },

        {
          title: "Likes",
          key: "likes",
          render: (_, item) => (
            <Button
              type="link"
              onClick={() => upvoteItem(item.id)}
              disabled={user.isAuthorized}  // disables for Admin
            >
              👍 {item.likes ?? 0}
            </Button>
          ),
        },
        {
          title: "Actions",
          key: "actions",
          render: (_, item) =>
            user.isAuthorized ? (
              <Popconfirm
                title="Delete this item?"
                okText="Delete"
                cancelText="Cancel"
                onConfirm={() => deleteItem(item.id)}
              >
                <Button danger type="link">
                  delete
                </Button>
              </Popconfirm>
            ) : (
              <span style={{ opacity: 0.5 }}>—</span>
            ),
        },
      ]}
    />
  </Container>
  )
}

export default Home