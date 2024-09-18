'use client';

import Link from 'next/link';
import React, { FC, useEffect, useState } from 'react';
import NavItems from '../utils/NavItems';
import { ThemeSwitcher } from '../utils/ThemeSwitcher';
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from 'react-icons/hi';
import CustomModal from '../utils/CustomModal';
import Login from './Auth/Login';
import Signup from './Auth/SignUp';
import Verification from './Auth/Verification';
import { useLogOutQuery, useSocialAuthMutation } from '@/redux/features/auth/authApi';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import avatar from '../../public/assests/avatar.png';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
    route: string;
    setRoute: (route: string) => void;
};

const Header: FC<Props> = ({ activeItem, setOpen, route, open, setRoute }) => {
    const [active, setActive] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);
    const [logout, setLogout] = useState(false);
    
    const { user } = useSelector((state: any) => state.auth);
    const { data: sessionData } = useSession();
    const [socialAuth, { isSuccess }] = useSocialAuthMutation();

    const {} = useLogOutQuery(undefined, { skip: !logout });

    useEffect(() => {
        if (!user && sessionData) {
            // Perform social login
            socialAuth({
                email: sessionData.user?.email || '',
                name: sessionData.user?.name || '',
                avatar: sessionData.user?.image ?? undefined,
            });
        }

        if (isSuccess) {
            toast.success('Login successfully!');
        }

        if (sessionData === null) {
            setLogout(true);
        }
    }, [sessionData, user, socialAuth, isSuccess]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setActive(true);
            } else {
                setActive(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup event listener
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleClose = (e: any) => {
        if (e.target.id === 'screen') {
            setOpenSidebar(false);
        }
    };

    return (
        <div className="w-full relative">
            <div
                className={`${
                    active
                        ? 'dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-[#fffff1c] shadow-xl transition duration-500'
                        : 'w-full border-b dark:border-[#fffff1c] h-[80px] z-[80] dark:shadow'
                }`}
            >
                <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full">
                    <div className="w-full h-[80px] flex items-center justify-between p-3">
                        <div>
                            <Link href="/" className="text-[25px] font-Poppins font-[500] text-black dark:text-white">
                                ELearning
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <NavItems activeItem={activeItem} isMobile={false} />
                            <ThemeSwitcher />

                            <div className="800px:hidden">
                                <HiOutlineMenuAlt3
                                    size={25}
                                    className="cursor-pointer dark:text-white text-black"
                                    onClick={() => setOpenSidebar(true)}
                                />
                            </div>

                            {user ? (
                                <Link href="/profile">
                                    <Image
                                        src={user.avatar ? user.avatar.url : avatar}
                                        alt=""
                                        width={30}
                                        height={30}
                                        className="w-[30px] h-[30px] rounded-full cursor-pointer"
                                    />
                                </Link>
                            ) : (
                                <HiOutlineUserCircle
                                    size={25}
                                    className="cursor-pointer dark:text-white text-black"
                                    onClick={() => setOpen(true)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {openSidebar && (
                    <div
                        className="flex w-full h-screen top-0 left-0 z-[9999] dark:bg-[unset] bg-[#00000024]"
                        onClick={handleClose}
                        id="screen"
                    >
                        <div className="w-[70%] fixed z-[999999999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
                            <NavItems activeItem={activeItem} isMobile={true} />
                            <HiOutlineUserCircle
                                size={25}
                                className="cursor-pointer ml-5 my-2 text-black dark:text-white"
                                onClick={() => setOpen(true)}
                            />
                            <p className="text-[16px] px-2 pl-5 text-black dark:text-white mt-20">
                                Copyright © 2024 GMS
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals for Login, Sign-Up, and Verification */}
            {route === 'Login' && open && (
                <CustomModal
                    open={open}
                    setOpen={setOpen}
                    setRoute={setRoute}
                    activeItem={activeItem}
                    component={Login}
                />
            )}
            {route === 'Sign-Up' && open && (
                <CustomModal
                    open={open}
                    setOpen={setOpen}
                    setRoute={setRoute}
                    activeItem={activeItem}
                    component={Signup}
                />
            )}
            {route === 'Verification' && open && (
                <CustomModal
                    open={open}
                    setOpen={setOpen}
                    setRoute={setRoute}
                    activeItem={activeItem}
                    component={Verification}
                />
            )}
        </div>
    );
};

export default Header;
