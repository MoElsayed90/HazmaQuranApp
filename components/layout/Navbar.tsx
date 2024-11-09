import Link from "next/link";
import { Button } from "../ui/button";
import HamzaLogo from "@/public/Logo.svg"
import Image from "next/image";
const Navbar = () => {
  return (
    <div className="navbar bg-background shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-background rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <a className="text-primary">Item 1</a>
            </li>
            <li>
              <a className="text-primary">Item 1</a>
            </li>
            <li>
              <a className="text-primary">Item 3</a>
            </li>
          </ul>
        </div>
        <Link href={"/"} ><Image src={HamzaLogo} alt="Hamza" width={140} height={10}/></Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a className="text-secondary">الرئيسيه</a>
          </li>
          <li>
            <a className="text-secondary">القراء</a>
          </li>
          <li>
            <a className="text-secondary">من نحن</a>
          </li>
        </ul>
      </div>
      <div className="navbar-end text-white">
        <Button variant={"outline"}>أتصل بنا</Button>
      </div>
    </div>
  );
};

export default Navbar;
