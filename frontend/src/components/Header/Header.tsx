import React from 'react';
import { NavLink, Link } from 'react-router-dom';

import Logo from 'assets/logo.svg';
import Search from 'assets/search.svg';
import Pencil from 'assets/pencil.svg';
import { PALETTE } from 'constants/palette';
import ROUTE from 'constants/routes';
import { ButtonStyle } from 'types';
import Styled, { IconButton } from './Header.styles';

interface Props {
  isFolded?: boolean;
}

const Header = ({ isFolded = false }: Props) => {
  const navLinkActiveStyle = {
    borderBottom: `2px solid ${PALETTE.WHITE_400}`,
  };

  return (
    <Styled.Root isFolded={isFolded}>
      <svg height="100%" width="100vw">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={PALETTE.PRIMARY_200} stopOpacity="1" />
            <stop offset="100%" stopColor={PALETTE.PRIMARY_400} stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect x="-30vw" y="0" width="160vw" height="100%" fill="url(#grad1)" />
      </svg>

      <Styled.HeaderContent>
        <Styled.LogoWrapper>
          <Link to={ROUTE.HOME}>
            <Logo width="200px" />
          </Link>
        </Styled.LogoWrapper>
        <nav>
          <Styled.NavContainer>
            <li>
              <NavLink to="/" activeStyle={navLinkActiveStyle}>
                Feed
              </NavLink>
            </li>
            <li>
              <NavLink to="/best" activeStyle={navLinkActiveStyle}>
                Best 10
              </NavLink>
            </li>
            <li>
              <NavLink to="/hosting" activeStyle={navLinkActiveStyle}>
                Joel’s Hosting
              </NavLink>
            </li>
            <li>
              <NavLink to="/makers" activeStyle={navLinkActiveStyle}>
                Toy Makers
              </NavLink>
            </li>
          </Styled.NavContainer>
        </nav>
        <Styled.ButtonsContainer>
          <IconButton>
            <Search width="32px" />
          </IconButton>
          <Link to={ROUTE.UPLOAD}>
            <IconButton>
              <Pencil width="22px" />
            </IconButton>
          </Link>

          <Styled.SignInButton buttonStyle={ButtonStyle.OUTLINE} reverse={true}>
            Sign In
          </Styled.SignInButton>
        </Styled.ButtonsContainer>
      </Styled.HeaderContent>
    </Styled.Root>
  );
};

export default Header;
