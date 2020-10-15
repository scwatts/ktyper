import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'semantic-ui-react'


function MenuComponent() {
  const page = useLocation();
  const activeItem = page.pathname.split('/')[1];

  return (
    <div>
      <Menu pointing secondary>
        <Menu.Item
          name='home'
          as={Link}
          to='/'
          active={activeItem===''}
        />
        <Menu.Item
          name='submit'
          as={Link}
          to='/submit'
          active={activeItem==='submit'}
        />
        <Menu.Item
          name='jobs'
          as={Link}
          to='/jobs'
          active={activeItem==='jobs'}
        />
        <Menu.Item
          name='results'
          as={Link}
          to='/results'
          active={activeItem==='results'}
        />
      </Menu>
    </div>
  );
}

export default MenuComponent;
