import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMe } from '@/api/queries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';
import { selectUser } from '@/store/userSlice';
import { logout } from '@/store/userSlice';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserMenu() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const user = useSelector(selectUser);
  const { data: meData } = useMe();

  if (!user) {
    return null;
  }

  const photoUrl = meData?.photoUrl ?? null;

  const handleLogout = () => {
    dispatch(logout());
    void navigate(pathTo(ROUTES.HOME, language));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="trigger" className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border/20">
            {photoUrl ? <AvatarImage src={photoUrl} alt={user.name || 'Profile'} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {getInitials(user.name || user.email || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start text-left min-w-0 flex-1 gap-0 sm:flex">
            <span className="text-sm font-medium leading-tight truncate max-w-[140px]">
              {user.name || t('nav.guest')}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[140px] leading-tight">
              {user.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link
            to={pathTo(ROUTES.DASHBOARD, language)}
            className="flex cursor-pointer items-center"
          >
            <LayoutDashboard className="me-2 h-4 w-4" />
            {t('nav.dashboard')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={pathTo(ROUTES.PROFILE, language)} className="flex cursor-pointer items-center">
            <User className="me-2 h-4 w-4" />
            {t('nav.myAccount')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="me-2 h-4 w-4" />
          {t('nav.logOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
