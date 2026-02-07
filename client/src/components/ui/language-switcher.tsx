import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from 'react-i18next';

const LANGUAGE_LABELS = {
  en: 'English',
  he: 'עברית',
} as const;

export function LanguageSwitcher() {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-foreground hover:bg-muted hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t('nav.selectLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border text-foreground">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => {
              changeLanguage(lang);
            }}
            className={
              language === lang
                ? 'bg-primary/10 text-primary'
                : 'focus:bg-muted focus:text-foreground'
            }
          >
            {LANGUAGE_LABELS[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
