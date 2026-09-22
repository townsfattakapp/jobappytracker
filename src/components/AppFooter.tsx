import { BrandMark } from './BrandLogo'

export default function AppFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="app-footer" aria-label="Site footer">
      <div className="flex items-center gap-2 min-w-0">
        <BrandMark size={22} />
        <span className="font-semibold text-foreground">Prep</span>
        <span className="text-muted-foreground">by EVOLW</span>
      </div>
      <p className="text-muted-foreground">
        Developed by{' '}
        <a href="https://www.evolw.in" target="_blank" rel="noreferrer" className="app-footer-link">
          Evolw
        </a>
        <span className="mx-1.5 opacity-50">·</span>
        <a href="https://www.evolw.in" target="_blank" rel="noreferrer" className="app-footer-link">
          www.evolw.in
        </a>
        <span className="mx-1.5 opacity-50">·</span>© {year}
      </p>
    </footer>
  )
}
