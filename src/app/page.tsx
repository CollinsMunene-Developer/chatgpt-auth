"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Github,
  Terminal,
  LucideIcon,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Azure, Docker } from '@/public/icons/icons';
import UserNav from '@/components/Header-auth';

interface PlatformIcon {
  type: 'lucide' | 'static';
  icon: LucideIcon | StaticImageData;
}

interface Platform {
  icon: PlatformIcon;
  label: string;
}

interface Feature {
  title: string;
  description: string;
}

const Page = () => {
  const { theme } = useTheme();
  
  const platforms: Platform[] = [
    { icon: { type: 'static', icon: Azure }, label: "Azure Cloud" },
    { icon: { type: 'lucide', icon: Database }, label: "Kubernetes" },
    { icon: { type: 'static', icon: Docker }, label: "Docker" },
    { icon: { type: 'lucide', icon: Github }, label: "GitHub" },
  ];

  const features: Feature[] = [
    {
      title: "Automated Deployments",
      description: "Set up once, deploy anywhere with our intelligent automation pipeline."
    },
    {
      title: "Multi-Cloud Support",
      description: "Deploy to any major cloud provider with unified configuration and management."
    },
    {
      title: "Container Orchestration",
      description: "Seamless Kubernetes and Docker integration for scalable deployments."
    },
    {
      title: "Real-Time Monitoring",
      description: "Track performance metrics and receive instant alerts for any issues."
    }
  ];

  const renderIcon = (platformIcon: PlatformIcon) => {
    if (platformIcon.type === 'lucide') {
      const Icon = platformIcon.icon as LucideIcon;
      return <Icon className="h-12 w-12 text-primary mb-4" />;
    } else {
      return (
        <Image 
          src={platformIcon.icon as StaticImageData}
          alt=""
          className="h-12 w-12 mb-4"
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Terminal className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">DeployMaster</span>
            </motion.div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="hover:scale-105 transition-transform">Home</Button>
              <Button variant="ghost" className="hover:scale-105 transition-transform">Documentation</Button>
              <Button variant="ghost" className="hover:scale-105 transition-transform">Pricing</Button>
              <Button variant="ghost" className="hover:scale-105 transition-transform">Contact</Button>
            </nav>
          </div>

          <UserNav />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Seamless Auto-Deployments to Any Platform
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Deploy your applications effortlessly to any cloud platform. Streamline your workflow with automated deployments, comprehensive monitoring, and intelligent scaling.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 hover:scale-105 transition-all">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="hover:scale-105 transition-all">
                View Documentation
              </Button>
            </div>
          </motion.div>

          {/* Platform Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mb-20">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center p-6 rounded-lg bg-card shadow-sm hover:shadow-lg transition-all"
              >
                {renderIcon(platform.icon)}
                <span className="text-sm font-medium">{platform.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-lg bg-card hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-4">
                <motion.a 
                  href="mailto:contact@deploymaster.com"
                  className="flex items-center text-muted-foreground hover:text-primary"
                  whileHover={{ x: 5 }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  contact@deploymaster.com
                </motion.a>
                <motion.a 
                  href="tel:+1234567890"
                  className="flex items-center text-muted-foreground hover:text-primary"
                  whileHover={{ x: 5 }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  +1 (234) 567-890
                </motion.a>
                <motion.div 
                  className="flex items-center text-muted-foreground"
                  whileHover={{ x: 5 }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  123 Tech Street, Silicon Valley, CA
                </motion.div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <div className="space-y-2">
                {['About', 'Careers', 'Blog', 'Legal'].map((item) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="block text-muted-foreground hover:text-primary"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <div className="space-y-2">
                {['Documentation', 'API Reference', 'Status', 'Support'].map((item) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="block text-muted-foreground hover:text-primary"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>© 2024 DeployMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;