import React from 'react'
import { Link } from 'react-router-dom'
import { NavLink, Outlet } from "react-router-dom";
import { RiHome4Line } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from 'react';
import { FaUsers } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import { SiGmail } from "react-icons/si";
import { MdSecurity } from "react-icons/md";
import { MdLogout } from "react-icons/md";
import { HiBars3BottomLeft } from "react-icons/hi2";
import { CiSearch } from "react-icons/ci";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaIdBadge } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import Inscription from './inscription';
import { BsFiletypePdf } from "react-icons/bs";
import { MdOutlineMessage } from "react-icons/md";


export default function Sidebar() {
    const [open1, setOpen1] = useState(false)
    const [openMenu, setOpenMenu] = useState(false)
    const location = useLocation();
    const navigation = useNavigate()

    /*
     const decoded = jwtDecode(localStorage.getItem("admin#token"));
    


    const timeLeft = decoded.exp * 1000 - Date.now();

    setTimeout(() => {
        navigation("/")
    }, timeLeft);
    
    */

    useEffect(() => {
        if (localStorage.getItem("admin#token") === null) {
            navigation("/")
        }
    }, [navigation]);

    useEffect(() => {
        if (window.innerWidth <= 1200) {
            setOpenMenu(true);
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth <= 1200) {
            setOpenMenu(true);
        }
    }, [location.pathname]);

    const [searchValue, setSearchValue] = useState("");

    function handleSearch(e) {
        setSearchValue(e.target.value);
    }


    return (
        <div className="container">
            <div className={`sidebar ${openMenu ? "close" : ""}`}>
                <div className="logo">
                    <img src="/images/logo-1.png" alt="" />
                </div>
                <div className="menu-close"><IoCloseCircle className='i' onClick={() => setOpenMenu(!openMenu)} /></div>
                <ul className="menu">
                    <li>
                        <NavLink to="/sidebar/dashboard" className={({ isActive }) => isActive ? "link active" : "link"}>
                            <span><RiHome4Line className='i' />Dashboard</span>
                        </NavLink>
                    </li>
                    <li className='dropdown'>
                        <a href='#' className="link" onClick={() => { setOpen1(!open1) }}>
                            <span>< FaUsers className='i' />Inscriptions</span>
                            <IoIosArrowDown className={open1 ? "arrow active" : "arrow"} />
                        </a>
                        <div className={open1 ? "submenu active" : "submenu"}>
                            <NavLink to="/sidebar/inscription" className={({ isActive }) => isActive ? "link active" : "link"}><span>Total</span></NavLink>
                        </div>
                        <div className={open1 ? "submenu active" : "submenu"}>
                            <NavLink to="/sidebar/inscription-reussie" className={({ isActive }) => isActive ? "link active" : "link"}><span>Réussies</span></NavLink>
                        </div>
                        <div className={open1 ? "submenu active" : "submenu"}>
                            <NavLink to="/sidebar/inscription-non-finalisee" className={({ isActive }) => isActive ? "link active" : "link"}><span>Non finalisées</span></NavLink>
                        </div>
                        <div className={open1 ? "submenu active" : "submenu"}>
                            <NavLink to="/sidebar/inscrire" className={({ isActive }) => isActive ? "link active" : "link"}><span>Inscrire un participant</span></NavLink>
                        </div>
                    </li>
                    <li>
                        <NavLink to="/sidebar/message" className={({ isActive }) => isActive ? "link active" : "link"}>
                            <span><MdOutlineMessage className='i' />Message</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sidebar/newsletter" className={({ isActive }) => isActive ? "link active" : "link"}>
                            <span><SiGmail className='i' />Newsletter</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sidebar/password" className={({ isActive }) => isActive ? "link active" : "link"}>
                            <span><MdSecurity className='i' />Sécurité</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/sidebar/logout" className={({ isActive }) => isActive ? "link active" : "link"}>
                            <span><MdLogout className='i' />Deconnexion</span>
                        </NavLink>
                    </li>
                </ul>
            </div >
            <div className="contents">
                <div className="navbar">
                    <div className="header-left">
                        <HiBars3BottomLeft className='i-bars' onClick={() => setOpenMenu(!openMenu)} />
                        <div className="input-container">
                            <CiSearch className="i" />
                            <input type="text" placeholder="Rechercher..." value={searchValue} onChange={handleSearch} />
                        </div>
                    </div>
                    {/*
                    <div className="header-right">
                        <div className='notif'><IoMdNotificationsOutline className='i' /><span>01</span></div>
                        {JSON.parse(localStorage.getItem("admin#token")).role == "super-admin" ? <img src="/images/djogan.jpeg" alt="" /> : <img src="/images/apo.jpeg" alt="" />}
                    </div>
                    */}
                </div>
                <div className='outlet'>
                    <Outlet context={{ searchValue }} />
                </div>
            </div>

        </div>
    )
}
