import { Button } from '@/components/ui/button'
import { Microscope, FilePlus2 } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { ViewMode } from '@/app/page'

interface HeaderProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  onStartNewReport: () => void
  isReportGenerated: boolean
}

export default function Header({
  viewMode,
  setViewMode,
  onStartNewReport,
  isReportGenerated,
}: HeaderProps) {
  const handleToggle = (checked: boolean) => {
    setViewMode(checked ? 'extracted' : 'report')
  }

  return (
    <header className='flex h-16 items-center justify-between bg-background px-4 md:px-6 shrink-0 border-b'>
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-3 font-semibold text-lg'>
          <Microscope className='h-6 w-6' />
          <span>Pathology</span>
        </div>

        {isReportGenerated && (
          <Button variant='outline' size='sm' onClick={onStartNewReport}>
            <FilePlus2 className='h-4 w-4' />
            <span className='mt-1'>New Report</span>
          </Button>
        )}
      </div>

      <div className='flex items-center gap-4'>
        {isReportGenerated && (
          <div className='flex items-center space-x-2'>
            <Label
              htmlFor='view-mode-toggle'
              className={
                viewMode === 'report'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }
            >
              Generated Report
            </Label>
            <Switch
              id='view-mode-toggle'
              checked={viewMode === 'extracted'}
              onCheckedChange={handleToggle}
              aria-label='Toggle between Generated Report and Redacted Text'
            />
            <Label
              htmlFor='view-mode-toggle'
              className={
                viewMode === 'extracted'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }
            >
              Redacted Text
            </Label>
          </div>
        )}

        {isReportGenerated && <div className='h-6 w-px bg-border' />}

        <ThemeToggle />
        <Button size='sm'>Export</Button>
      </div>
    </header>
  )
}
