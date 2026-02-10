'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ExitIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect, useState } from "react";

const UserDropdown = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Pas connecté - afficher par défaut
        setIsLoggedIn(false);
        setUserId('');
        setUserName('');
        setAdminEmail('');
        setIsAdmin(false);
        setAvatarUrl('');
        return;
      }
      
      // Utilisateur connecté - charger ses données
      const id = localStorage.getItem('userId') || '';
      const name = localStorage.getItem('userName') || '';
      const email = localStorage.getItem('adminEmail') || '';
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      
      setUserId(id);
      setUserName(name);
      setAdminEmail(email);
      setIsAdmin(isAdmin);
      setIsLoggedIn(true);
      
      // Charger l'avatar s'il existe
      if (id) {
        const avatarKey = `userAvatar_${id}`;
        const avatar = localStorage.getItem(avatarKey) || '';
        setAvatarUrl(avatar);
      }
    };

    loadUserData();

    // Écouter les changements du localStorage
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Monitor avatar changes
  useEffect(() => {
    if (!userId) return;
    
    const avatarKey = `userAvatar_${userId}`;
    const currentAvatar = localStorage.getItem(avatarKey) || '';
    
    if (currentAvatar !== avatarUrl) {
      setAvatarUrl(currentAvatar);
    }
  }, [userId]);

  const handleSignout = async () => {
    try {
      // Remove only session data, NOT avatars
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      
      // IMPORTANT: Do NOT remove avatars - they should persist for next login
      
      router.push("/sign-in");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const displayName = userName || 'User';
  const displayEmail = adminEmail || 'user@gmail.com';
  
  return (
   <DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="ghost" className="flex items-center gap-3 text-gray-400 hover:text-cyan-500">
    <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-600">
      {avatarUrl && avatarUrl.trim() ? (
        <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" onError={(e) => {e.currentTarget.style.display = 'none'}} />
      ) : (
        <img src="/assets/user.jpg" alt="User avatar" className="w-full h-full object-cover" />
      )}
    </div>
    <div className="hidden md:flex flex-col items-start">
      <span className="text-base font-medium text-gray-400">
        {isAdmin ? 'Admin' : userName || 'User'}
      </span>
      {isAdmin && <span className="text-xs text-cyan-400">Administrator</span>}
    </div>

    </Button></DropdownMenuTrigger>
  <DropdownMenuContent className="text-gray-400">
    <DropdownMenuLabel>
      <div className="flex relative items-center gap-3 py-2">
        <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-600 flex-shrink-0">
          {avatarUrl && avatarUrl.trim() ? (
            <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" onError={(e) => {e.currentTarget.style.display = 'none'}} />
          ) : (
            <img src="/assets/user.jpg" alt="User avatar" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-base font-medium text-gray-400">
            {isAdmin ? 'Administrator' : userName || 'User'}
          </span>
          <span className="text-sm text-gray-500">{adminEmail || 'user@gmail.com'}</span>
          {isAdmin && <span className="text-xs text-cyan-400 mt-1">Admin Access Active</span>}
        </div>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator className="bg-gray-600" />
    
    {isAdmin && (
      <>
        <DropdownMenuItem asChild>
          <Link href="/admin" className="text-gray-100 text-md font-medium focus:bg-transparent focus:text-cyan-500 transition-colors cursor-pointer flex items-center">
            <span className="mr-2">⚙️</span>
            Admin Panel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-600" />
      </>
    )}
    
    {isLoggedIn && (
      <DropdownMenuItem 
        onSelect={handleSignout} 
        className="text-gray-100 text-md font-medium focus:bg-transparent focus:text-cyan-500 transition-colors cursor-pointer"
      >
        <ExitIcon className="h-4 w-4 mr-2 hidden sm:block" />
        Sign Out
      </DropdownMenuItem>
    )}
  </DropdownMenuContent>
</DropdownMenu>
  )
}

export default UserDropdown
