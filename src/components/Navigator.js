import React, { Component, Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import "./Navigator.scss";

class MenuGroup extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.wrapperRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      this.setState({ isOpen: false });
    }
  }

  toggleMenu = () => {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  };

  render() {
    const { name, children } = this.props;
    const { isOpen } = this.state;

    return (
      <li className="menu-group" ref={this.wrapperRef}>
        <div className="menu-group-name" onClick={this.toggleMenu}>
          <FormattedMessage id={name} />
        </div>
        <ul className={`menu-list ${isOpen ? "show" : ""}`}>{children}</ul>
      </li>
    );
  }
}

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = { isSubMenuOpen: false };
    this.menuRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside(event) {
    if (this.menuRef && !this.menuRef.current.contains(event.target)) {
      this.setState({ isSubMenuOpen: false });
    }
  }

  toggleSubMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState((prevState) => ({ isSubMenuOpen: !prevState.isSubMenuOpen }));
    if (this.props.onClick) this.props.onClick();
  };

  render() {
    const { name, link, children, active } = this.props;
    const { isSubMenuOpen } = this.state;
    const hasChildren = children && children.length > 0;

    return (
      <li className={`menu ${active ? "active" : ""}`} ref={this.menuRef}>
        {hasChildren ? (
          <Fragment>
            <div className="menu-link" onClick={this.toggleSubMenu}>
              <span>
                <FormattedMessage id={name} />
              </span>
              <i className="icon-right fas fa-angle-right"></i>
            </div>
            <ul className={`sub-menu-list ${isSubMenuOpen ? "show" : ""}`}>
              {children}
            </ul>
          </Fragment>
        ) : (
          <Link
            to={link}
            className="menu-link"
            onClick={this.props.onLinkClick}
          >
            <span>
              <FormattedMessage id={name} />
            </span>
          </Link>
        )}
      </li>
    );
  }
}

class SubMenu extends Component {
  render() {
    const { name, link, active, onLinkClick } = this.props;
    return (
      <li className={`sub-menu ${active ? "active" : ""}`}>
        <Link to={link} className="sub-menu-link" onClick={onLinkClick}>
          <FormattedMessage id={name} />
        </Link>
      </li>
    );
  }
}

const MenuGroupWithRouter = withRouter(MenuGroup);
const MenuWithRouter = withRouter(Menu);
const SubMenuWithRouter = withRouter(SubMenu);

const withRouterInnerRef = (WrappedComponent) => {
  class InnerComponentWithRef extends React.Component {
    render() {
      const { forwardRef, ...rest } = this.props;
      return <WrappedComponent {...rest} ref={forwardRef} />;
    }
  }

  const ComponentWithRef = withRouter(InnerComponentWithRef, { withRef: true });

  return React.forwardRef((props, ref) => {
    return <ComponentWithRef {...props} forwardRef={ref} />;
  });
};

class Navigator extends Component {
  constructor(props) {
    super(props);
    this.state = { expandedMenu: {} };
  }

  toggle = (groupIndex, menuIndex) => {
    const key = `${groupIndex}_${menuIndex}`;
    this.setState((prevState) => {
      const needExpand = !(prevState.expandedMenu[key] === true);
      return {
        expandedMenu: needExpand ? { [key]: true } : {},
      };
    });
  };

  isMenuHasSubMenuActive = (location, subMenus, link) => {
    if (subMenus && subMenus.length > 0) {
      return subMenus.some((subMenu) => {
        // Kiểm tra xem đường dẫn hiện tại có bắt đầu bằng đường dẫn của submenu không
        return (
          location.pathname === subMenu.link ||
          location.pathname.startsWith(subMenu.link + "/")
        );
      });
    }
    // Kiểm tra xem đường dẫn hiện tại có bắt đầu bằng đường dẫn của menu không
    return (
      link &&
      (this.props.location.pathname === link ||
        this.props.location.pathname.startsWith(link + "/"))
    );
  };

  checkActiveMenu = () => {
    const { menus, location } = this.props;

    for (let i = 0; i < menus.length; i++) {
      const group = menus[i];
      if (group.menus && group.menus.length > 0) {
        for (let j = 0; j < group.menus.length; j++) {
          const menu = group.menus[j];
          if (menu.subMenus && menu.subMenus.length > 0) {
            if (this.isMenuHasSubMenuActive(location, menu.subMenus, null)) {
              const key = `${i}_${j}`;
              this.setState({ expandedMenu: { [key]: true } });
              return;
            }
          }
        }
      }
    }
  };

  componentDidMount() {
    this.checkActiveMenu();
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.checkActiveMenu();
    }
  }

  render() {
    const { menus, location, onLinkClick, currentPath } = this.props;
    const pathname = currentPath || (location && location.pathname);
    // const isActive = link
    //   ? location.pathname === link
    //   : children &&
    //     children.some(
    //       (child) => child.link && location.pathname.startsWith(child.link)
    //     );
    return (
      <ul className="navigator-menu list-unstyled">
        {menus.map((group, groupIndex) => (
          <Fragment key={groupIndex}>
            {group.link ? (
              <li
                className={`menu-group ${
                  group.link === pathname ? "active" : ""
                }`}
              >
                <Link
                  to={group.link}
                  className={`menu-group-name ${
                    group.link === pathname ? "active" : ""
                  }`}
                >
                  {group.name}
                </Link>
              </li>
            ) : (
              <MenuGroupWithRouter name={group.name}>
                {group.menus &&
                  group.menus.map((menu, menuIndex) => {
                    const isMenuHasSubMenuActive = this.isMenuHasSubMenuActive(
                      location,
                      menu.subMenus,
                      menu.link
                    );
                    const key = `${groupIndex}_${menuIndex}`;
                    const isSubMenuOpen = this.state.expandedMenu[key] === true;

                    return (
                      <MenuWithRouter
                        key={menuIndex}
                        active={
                          isMenuHasSubMenuActive || menu.link === pathname
                        }
                        name={menu.name}
                        link={menu.link}
                        isOpen={isSubMenuOpen}
                        onClick={() => this.toggle(groupIndex, menuIndex)}
                        onLinkClick={onLinkClick}
                      >
                        {menu.subMenus &&
                          menu.subMenus.map((subMenu, subMenuIndex) => (
                            <SubMenuWithRouter
                              key={subMenuIndex}
                              name={subMenu.name}
                              link={subMenu.link}
                              active={subMenu.link === pathname}
                              onLinkClick={onLinkClick}
                            />
                          ))}
                      </MenuWithRouter>
                    );
                  })}
              </MenuGroupWithRouter>
            )}
          </Fragment>
        ))}
      </ul>
    );
  }
}

export default withRouterInnerRef(connect()(Navigator));
