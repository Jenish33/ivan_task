import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { List, Card, Button, Avatar } from 'antd';
import { Breadcrumb } from 'antd';
import { Spin } from 'antd';
import './App.css';

const { Sider, Content } = Layout;

function App() {
  // State of the APP
  const [users, setUsers] = useState([]);
  const [favorites, setFavorites] = useState([]);

  //sorting the names in alphabetical order
  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/users')
      .then(response => {
        const sortedUsers = response.data.sort((a, b) => a.name.localeCompare(b.name));
        setUsers(sortedUsers);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);
  //fetching the favorites from the local storage
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites'));
    if (storedFavorites) {
      setFavorites(storedFavorites);
    }
  }, []);
  //Everytime the favorites states get updated we save it to the local storage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (user) => {
    const index = favorites.findIndex(favorite => favorite.id === user.id);
    if (index === -1) {
      setFavorites([...favorites, user]);
    } else {
      setFavorites(favorites.filter(favorite => favorite.id !== user.id));
    }
  };

  const isFavorite = (user) => {
    return favorites.some(favorite => favorite.id === user.id);
  };

  const BreadcrumbComponent = (props) => {
    const { crumbs } = props;
    return (
      <Breadcrumb style={{ margin: '16px 0', width:'300px' }}>
        {crumbs.map((crumb, index) => {
          if (crumb.link) {
            return (
              <Breadcrumb.Item key={index}>
                <Link to={crumb.link}>{crumb.title}</Link>
              </Breadcrumb.Item>
            );
          } else {
            return (
              <Breadcrumb.Item key={index}>
                {crumb.title}
              </Breadcrumb.Item>
            );
          }
        })}
      </Breadcrumb>
    );
  }

  const UserList = () => {
    const crumbs = [
      { title: 'Home', link: '/' },
      { title: 'Users' },
    ];
    console.log(users)
    return (
      <>
        <BreadcrumbComponent crumbs={crumbs}/>
        <div style={{display:"flex", flexDirection:"column", justifyContent:"center"}}>
          <h1>Users</h1>
          <List
            itemLayout="horizontal"
            dataSource={users}
            renderItem={(user) => (
              <List.Item>
                <Card style={{ minWidth: "20rem", boxShadow: "0px 2px 6px rgba(0,0,0,0.3)", marginBottom: "20px" }}>
                  <Card.Meta
                    avatar={<Avatar>{user.name.charAt(0)}</Avatar>}
                    title={<Link to={`/user/${user.id}`}>{user.name} </Link>}
                    description={user.email}
                  />
                </Card>
              </List.Item>
            )}
          />
        </div>
      </>
    );
  }

  const FavoritesList = () => {
    const crumbs = [
      { title: 'Home' },
      { title: 'Favourites' },
    ];
    console.log(favorites)
    return(
      <>
        <BreadcrumbComponent crumbs={crumbs}/>
        <h1>Favorites</h1>
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
            xxl: 5,
          }}
          dataSource={favorites}
          renderItem={favorite => (
            <List.Item>
              <Card style={{width:'20rem'}}>
                <h3>{favorite.name}</h3>
                <p>Email: {favorite.email}</p>
                <p>Phone: {favorite.phone}</p>
                {/* <Button onClick={() => toggleFavorite(favorite)}>{isFavorite(favorite) ? 'Remove from favorites' : 'Add to favorites'}</Button> */}
                <button style={{ backgroundColor: isFavorite(favorite) ? '#f5222d' : '#1890ff', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', width: '150px' }} onClick={() => toggleFavorite(favorite)}>
                  {isFavorite(favorite) ? 'Remove from favorites' : 'Add to favorites'}
                </button>
              </Card>
            </List.Item>
          )}
        />
      </>
    );
}

  const UserDetails = () => {
    const userId = useParams();
    const crumbs = [
      { title: 'Home', link: '/' },
      { title: 'Users', link: '/users' },
      { title: `${userId.id}` },
    ];
    console.log(userId)
    const [user, setUser] = useState(null);

    useEffect(() => {
      axios.get(`https://jsonplaceholder.typicode.com/users/${userId.id}`)
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error(error);
        });
    }, [userId]);

    if (!user) {
      return <>
        <BreadcrumbComponent crumbs={crumbs}/>
        <Spin style={{display:'flex', alignItems:'center', justifyContent:'center'}} size="large" />;
      </>
    }
    console.log(user)
    const { name, username, email, phone, address } = user;
    console.log(address)
    return (
      <>
        <BreadcrumbComponent crumbs={crumbs}/>
        <div style={{ padding: '20px',width: '20rem', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', borderRadius: '5px', lineHeight: '30px' }}>
          <h2 style={{ marginBottom: '10px' }}>{name}</h2>
          <div><strong>Username:</strong> {username}</div>
          <div><strong>Email:</strong> {email}</div>
          <div><strong>Phone:</strong> {phone}</div>
          <div>
            <strong>Address:</strong> {address.street}, {address.suite}, {address.city}, {address.zipcode}
          </div>
          <div style={{ marginTop: '10px' }}>
            <button style={{ backgroundColor: isFavorite(user) ? '#f5222d' : '#1890ff', color: 'white', border: 'none', padding: '8px', borderRadius: '5px' }} onClick={() => toggleFavorite(user)}>
              {isFavorite(user) ? 'Remove from favorites' : 'Add to favorites'}
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider>
          <Menu theme="dark" mode="inline">
            <Menu.Item key="1">
              <Link to="/">Users</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/favorites">Favorites ({favorites.length})</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content style={{ padding: '20px' }}>
            <Routes>
              <Route exact path="/" element={<UserList />} />
              <Route path="/user/:id" element={<UserDetails />} />
              <Route path="/favorites" element={<FavoritesList />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
