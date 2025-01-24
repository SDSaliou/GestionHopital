"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const withRoleProtection = (WrappedComponent, verifServices) => {
    return (props) => {
        const router = useRouter();
        const [userRole, setUserRole] = useState(null); // Définir correctement le type de userRole

        useEffect(() => {
            const service = localStorage.getItem("service");
            setUserRole(service);

            if (!service || !verifServices.includes(service)) {
                
                router.push("/login");
            }
        }, [router, verifServices]);

        
        if (!userRole || !verifServices.includes(userRole)) {
            return null;
        }

        
        return <WrappedComponent {...props} />;
    };
};

export default withRoleProtection;
