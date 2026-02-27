import { useState, useEffect } from 'react'
import Container from './Container'
import { get, del, post } from 'aws-amplify/api'
import { Table, Button, Popconfirm } from "antd";
// import { LikeOutlined, HeartOutlined, FireOutlined } from '@ant-design/icons'
import checkUser from './checkUser'

function Home() {
  const [state, setState] = useState({products: [], loading: true})
  const [user, updateUser] = useState({})
  // let didCancel = false

  useEffect(() => {
    getProducts()
    checkUser(updateUser)
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
      path: `/products/${id}`, 
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
    await post({
      apiName: "ecommerceapi",
      path: `/products/${id}/upvote`,
    });

    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === id
          ? { ...p, likes: (p.likes ?? 0) + 1 }
          : p
      ),
    }));

  } catch (err) {
    console.log("error upvoting item:", err);
  }
}
  console.log(
  "ids:",
  state.products.map(p => ({ name: p.name, id: p.id }))
);
return (
  <Container>
    <Table
      rowKey={(item) => item.id}                 
      dataSource={state.products}
      loading={state.loading}
      pagination={false}                        
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
          render: (value) => (value ?? ""),      
        },
        {
          title: "Likes",
          key: "likes",
          render: (_, item) => (
            <Button
              type="link"
                onClick={() => {
                console.log("CLICK LIKE:", { name: item.name, id: item.id });
                upvoteItem(item.id);
              }}
              disabled={user.isAuthorized}
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