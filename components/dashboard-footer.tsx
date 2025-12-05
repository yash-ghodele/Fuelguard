"use client"

import { Heart, Github, Linkedin, Mail, MapPin, Phone, FileText, HelpCircle, Shield } from "lucide-react"

export default function DashboardFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-40 border-t bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900/50 backdrop-blur-lg">
      <div className="w-full px-4 md:px-6 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Left: Branding */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg dark:shadow-purple-500/50"></div>
              <div>
                <p className="font-bold text-lg bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">FuelShield</p>
                <p className="text-xs text-muted-foreground">Vehicle Monitoring</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time IoT-based vehicle tracking and fuel monitoring system.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/fleet" className="hover:text-primary transition-colors flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Fleet Management
                </a>
              </li>
              <li>
                <a href="/settings" className="hover:text-primary transition-colors flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Settings
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                  <HelpCircle className="h-3 w-3" />
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-primary" />
                <a href="mailto:yashghodele.work@gmail.com" className="hover:text-primary transition-colors">
                  yashghodele.work@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-primary" />
                <a href="tel:+917666168561" className="hover:text-primary transition-colors">
                  +91 76661 68561
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-primary" />
                <span>Aurangabad, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Credits */}
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1 flex-wrap">
                Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> by{" "}
                <a
                  href="https://yash-ghodele.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent hover:from-blue-400 hover:to-pink-400 transition-all"
                >
                  Yash Ghodele
                </a>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                © {currentYear} FuelShield. All rights reserved.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/yash-ghodele"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/yash-ghodele"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:yashghodele.work@gmail.com"
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
