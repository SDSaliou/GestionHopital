"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const withRoleProtection = (WrappedComponent, verifServices) => {
    return (props) => {
        const router = useRouter();
        const [userRole, setUserRole] = useState(null); 
        const [showMessage, setShowMessage] = useState(false);

        useEffect(() => {
            const service = localStorage.getItem("service");
            setUserRole(service);

            if (!service || !verifServices.includes(service)) {
                setShowMessage(true);

                const time = setTimeout(() => {
                router.push("/login");
                }, 2000);
                return () => clearTimeout(time);
            }
        }, [router, verifServices]);

        if (showMessage) {
            return (
                <div className="flex items-center justify-center h-screen">
                    <p className="text-lg font-semibold text-red-500">
                        Veuillez vous connecter, s'il vous plaît...
                    </p>
                </div>
            )
        }
        if (!userRole || !verifServices.includes(userRole)) {
            return null;
        }

        
        return <WrappedComponent {...props} />;
    };
};

export default withRoleProtection;
