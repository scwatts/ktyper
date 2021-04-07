import React from 'react';
import { Header, Message } from 'semantic-ui-react'


import './HomePage.css';


function HomePage() {
  return (
    <>
      <Message
        id='centered_message'
        warning
        content='🚧 ktyper is under active construction 🚧'
      />
      <Header as='h1'>Home</Header>
      <p>
        ktyper identifies species from MALDI-TOF spectra using a statistical
        model. We currently support identification of members from the K.
        pneumoniae species complex and K. oxytoca species complex.
      </p>
    </>
  );
}

export default HomePage;
