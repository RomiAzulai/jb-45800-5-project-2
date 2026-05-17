import { BarChart3, Bot, Home, Info, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { setSearchTerm } from "../store/uiSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/reports", label: "Live Reports", icon: BarChart3 },
  { to: "/ai", label: "AI Advice", icon: Bot },
  { to: "/about", label: "About", icon: Info }
];

function Navbar() {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.ui.searchTerm);

  return (
    <header className="navbar">
      <NavLink to="/" className="brand" aria-label="Cryptonite home">
        <span className="brand-mark" aria-hidden="true">
          ◆
        </span>
        <span className="brand-text">Cryptonite</span>
      </NavLink>
      <nav className="nav-links" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <label className="search-box">
        <Search size={18} aria-hidden="true" />
        <input
          value={searchTerm}
          onChange={(event) => dispatch(setSearchTerm(event.target.value))}
          placeholder="Search coins"
          type="search"
        />
      </label>
    </header>
  );
}

export default Navbar;
