import { useTranslation } from 'react-i18next';
import { useDashboard } from '@/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeContent } from '@/components/animations/FadeContent';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useDashboard();

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <FadeContent>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-6">
          {t('dashboard.title')}
        </h1>
      </FadeContent>

      {isLoading && <p className="text-muted-foreground">{t('dashboard.loading')}</p>}

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {t('dashboard.error')}
        </div>
      )}

      {data && (
        <FadeContent delay={50}>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.welcome')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('dashboard.userId')}:</span>{' '}
                <span className="font-mono">{data.userId}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('dashboard.message')}:</span>{' '}
                {data.message}
              </p>
            </CardContent>
          </Card>
        </FadeContent>
      )}
    </div>
  );
}
