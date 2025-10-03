import PropTypes from 'prop-types';

// ==============================|| NAVIGATION SCROLL TO TOP ||============================== //

export default function NavigationScroll({ children }) {
  // Scroll handling is now done in MinimalLayout which has access to Router context
  return children || null;
}

NavigationScroll.propTypes = { children: PropTypes.oneOfType([PropTypes.any, PropTypes.node]) };
