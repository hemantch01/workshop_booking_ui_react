export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FOSSEE, IIT Bombay. All rights reserved.</p>
        <p className="mt-1">Free and Open Source Software for Education</p>
      </div>
    </footer>
  );
}