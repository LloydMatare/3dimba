"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/header";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Layers,
  Sparkles,
  Wand2,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Upload from "@/components/upload";
import { createProject, getProjects } from "@/lib/puter.action";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Note: Next.js handles metadata differently through layout.tsx or generateMetadata
// For client components, we'll handle metadata in a separate server component or layout

interface DesignItem {
  id: string;
  name: string;
  sourceImage: string;
  renderedImage?: string;
  timestamp: number;
}

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const isCreatingProjectRef = useRef(false);

  const handleUploadComplete = async (base64Image: string) => {
    try {
      console.log("Image : ", base64Image);

      if (isCreatingProjectRef.current) return false;
      isCreatingProjectRef.current = true;
      const newId = Date.now().toString();
      const name = `Residence ${newId}`;

      const newItem = {
        id: newId,
        name,
        sourceImage: base64Image,
        renderedImage: undefined,
        timestamp: Date.now(),
      };

      const saved = await createProject({ item: newItem, visibility: "private" });

      if (!saved) {
        console.error("Failed to create project");
        return false;
      }

      setProjects((prev) => [saved, ...prev]);

      // Next.js navigation - use router.push instead of navigate
      router.push(`/visualizer/${newId}?initialImage=${encodeURIComponent(saved.sourceImage)}&name=${encodeURIComponent(name)}`);
      // Note: For passing complex state, consider using URL params or context
      // The state object from React Router can be replaced with URL parameters or localStorage

      return true;
    } finally {
      isCreatingProjectRef.current = false;
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const items = await getProjects();
      setProjects(items);
    };

    fetchProjects();
  }, []);

  return (
      <div className="w-full">
        <Navbar />

        <section
          id="product"
          className="relative w-full overflow-hidden px-6 pt-16 pb-12 sm:pt-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_55%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />

          <div className="relative grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <Badge className="w-fit gap-2 rounded-full bg-primary/10 text-primary shadow-sm">
                <Sparkles className="h-4 w-4" />
                ImbaAI 1.0 is live
              </Badge>

              <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Visualize 2D floor plans as photoreal 3D spaces in minutes.
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  ImbaAI is a modern design workspace for architects and builders. Upload a plan, generate a
                  top-down 3D render, and share a living project history with your team.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <a href="#upload">
                    Start building
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg">
                  Watch demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                <span>Trusted by 1,200+ builders</span>
                <span>Render time under 30s</span>
                <span>Auto-hosted previews</span>
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="bg-card/70 backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wand2 className="h-4 w-4 text-primary" />
                    Instant 3D preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Generate a clean, top-down 3D visualization with zero manual modeling.
                </CardContent>
              </Card>
              <Card className="bg-card/70 backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700 motion-safe:delay-150">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Workflow className="h-4 w-4 text-primary" />
                    Project history built in
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Save every version, compare outputs, and collaborate with a single source of truth.
                </CardContent>
              </Card>
              <Card className="bg-card/70 backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700 motion-safe:delay-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="h-4 w-4 text-primary" />
                    Builder-ready exports
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Export high-resolution renders and share hosted project links instantly.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="workflow" className="w-full px-6 py-12">
          <div className="grid w-full gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="flex flex-col gap-3">
              <Badge variant="secondary" className="w-fit">
                Workflow
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight">From upload to 3D, in three steps.</h2>
              <p className="text-sm text-muted-foreground">
                ImbaAI keeps the pipeline fast with a guided workflow, built on shadcn components and smooth
                micro-animations.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Upload", description: "Drag-and-drop any floor plan in seconds." },
                { title: "Render", description: "AI converts the plan into a photoreal 3D view." },
                { title: "Share", description: "Export or host the render with one click." },
              ].map((item, index) => (
                <Card
                  key={item.title}
                  className="bg-card/70 backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {item.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="upload" className="w-full px-6 py-12">
          <div className="grid w-full gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="flex flex-col gap-4">
              <Badge variant="secondary" className="w-fit">
                Upload
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight">Upload a floor plan to get started.</h2>
              <p className="text-sm text-muted-foreground">
                We support JPG, PNG, and WEBP. The system will analyze the layout and prepare a 3D render.
              </p>
            </div>

            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700">
              <Upload onComplete={handleUploadComplete} />
            </div>
          </div>
        </section>

        <section id="projects" className="w-full px-6 py-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Recent projects</h2>
              <p className="text-sm text-muted-foreground">
                Your latest work and shared community projects in one place.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Explore gallery
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="grid w-full gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map(({ id, name, renderedImage, sourceImage, timestamp }) => (
              <Card
                key={id}
                className="group cursor-pointer overflow-hidden bg-card/70 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700"
                onClick={() => router.push(`/visualizer/${id}`)}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={renderedImage || sourceImage}
                    alt="Project"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className="absolute left-4 top-4 bg-background/80 text-foreground shadow-sm">
                    Community
                  </Badge>
                </div>
                <CardContent className="flex items-center justify-between gap-4 py-5">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">{name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{new Date(timestamp).toLocaleDateString()}</span>
                      <span>By Compulink</span>
                    </div>
                  </div>
                  <div className="rounded-full border border-border/60 p-2 text-muted-foreground transition-colors group-hover:text-foreground">
                    <ArrowUpRight size={16} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing" className="w-full px-6 pb-16">
          <Card className="bg-gradient-to-br from-primary/10 via-background to-background">
            <CardContent className="flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Need a custom rollout?</h3>
                <p className="text-sm text-muted-foreground">
                  Talk with our team about enterprise deployments, API access, and private hosting.
                </p>
              </div>
              <Button size="lg">Schedule a call</Button>
            </CardContent>
          </Card>
        </section>
      </div>
  );
}
