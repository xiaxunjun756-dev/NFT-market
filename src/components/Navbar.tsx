import fullLogo from "../assets/full_logo.webp";
import { Link, useLocation } from "react-router-dom";


function Navbar() {
  const location = useLocation();

  const linkClass = (isActive: boolean) =>
    `border-b-2 border-transparent p-2 hover:border-b-current ${isActive ? "border-b-current" : ""}`;

  return (
    <nav className="flex w-full items-center justify-between p-2.5">
      <img
        src={fullLogo}
        alt="NFT Marketplace"
        width={120}
        height={40}
        className="-mt-2"
      />
      <ul className="mr-10 flex list-none items-end gap-4 p-0 text-lg font-bold">
        <li className={linkClass(location.pathname === "/")}>
          <Link to="/">Marketplace</Link>
        </li>
        <li className={linkClass(location.pathname === "/sellNFT")}>
          <Link to="/sellNFT">List My NFT</Link>
        </li>
        <li className={linkClass(location.pathname === "/profile")}>
          <Link to="/profile">Profile</Link>
        </li>
        <li className="p-2">
          <appkit-button />
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
