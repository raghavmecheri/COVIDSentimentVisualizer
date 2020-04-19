import React from 'react';
import { FaGithub } from 'react-icons/fa';

import Container from 'components/Container';

const Header = () => {
  return (
    <header>
      <Container type="content">
        <h1>COVID Sentiment</h1>
        <ul>
          <li>
            <a href="https://github.com/raghavmecheri/coronavirus-effect-map">
              <FaGithub /> Github
            </a>
          </li>
        </ul>
      </Container>
    </header>
  );
};

export default Header;
