"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Layers,
  Shirt,
  Workflow,
  Save,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormRow } from "@/components/shared/FormRow";
import { ImageField } from "@/components/shared/ImageField";
import { PageHeader } from "@/components/layout/PageHeader";
import { useHomeContent, useUpdateHomeContent } from "@/hooks/use-catalog";
import type { HomeContent } from "@/lib/types";
import { storeUrl } from "@/lib/format";

const defaultContent: HomeContent = {
  hero: {
    badge: "Tiruppur · India's Knitwear Capital",
    title: "Factory-Direct\nCustom Apparel",
    description:
      "Tees, polos, hoodies and uniforms — cut, stitched, printed and quality-checked under one roof, then delivered anywhere in India with your branding on every piece.",
    heroImage: "",
    bgImageDesktop: "",
    bgImageMobile: "",
    primaryBtnText: "Shop the Range",
    primaryBtnLink: "/products",
    secondaryBtnText: "Bulk Enquiry",
    secondaryBtnLink: "/contact",
    stats: [
      { end: 100, suffix: "%", label: "In-House Production" },
      { end: 6, suffix: "", label: "QC Checks Per Piece" },
      { end: 25, suffix: "+", label: "Product Lines" },
    ],
  },
  shopByRange: {
    title: "Shop by Range",
    feature: {
      title: "Hoodies Essentials",
      text: "Premium zip and non-zip hoodies — warm, durable and retail-grade.",
      href: "/collections/unisex-hoodie-zip-325",
      buttonText: "Shop Hoodies",
      image: "/products/crew-white.svg",
    },
    tiles: [
      {
        title: "Men",
        href: "/collections/mens-rn-half-180",
        image: "http://localhost:4010/api/upload/media/teeszone/dropdown/mens_dropdown_img.webp",
        buttonText: "Shop now",
        sale: false,
      },
      {
        title: "Women",
        href: "/collections/womens-rn-half-180",
        image: "http://localhost:4010/api/upload/media/teeszone/dropdown/womens_dropdown_img.webp",
        buttonText: "Shop now",
        sale: false,
      },
      {
        title: "Kids",
        href: "/collections/kids-rn-half-180",
        image: "http://localhost:4010/api/upload/media/teeszone/dropdown/kids_dropdown_img.webp",
        buttonText: "Shop now",
        sale: false,
      },
      {
        title: "Mega Sale",
        href: "/collections/mega-sale",
        image: "/products/tee-yellow.svg",
        buttonText: "Shop now",
        sale: true,
      },
    ],
  },
  fabricLibrary: {
    title: "The Fabric Library",
    subtitle:
      "Eight knits, each engineered for a job. Pick one to see what it does best.",
  },
  processSteps: {
    title: "The TeesZone Process",
    subtitle: "From first message to delivered boxes in four steps.",
    steps: [
      {
        title: "Share Your Requirement",
        text: "Product, quantity, size split and your logo — on WhatsApp, the cart, or the enquiry form.",
      },
      {
        title: "Approve the Mockup",
        text: "We send a digital mockup and fabric options. Nothing goes to production before you sign off.",
      },
      {
        title: "We Produce & QC",
        text: "Cut, stitch, print and a six-point check on every piece in our Tiruppur facility.",
      },
      {
        title: "Doorstep Delivery",
        text: "Packed, dispatched and tracked to your office, school or venue — anywhere in India.",
      },
    ],
  },
};

export function HomeContentView() {
  const { data: remoteData, isLoading } = useHomeContent();
  const [form, setForm] = useState<HomeContent>(defaultContent);

  useEffect(() => {
    if (remoteData) {
      setForm({
        hero: { ...defaultContent.hero, ...(remoteData.hero || {}) },
        shopByRange: {
          ...defaultContent.shopByRange,
          ...(remoteData.shopByRange || {}),
          feature: {
            ...defaultContent.shopByRange.feature,
            ...(remoteData.shopByRange?.feature || {}),
          },
          tiles:
            remoteData.shopByRange?.tiles?.length
              ? remoteData.shopByRange.tiles
              : defaultContent.shopByRange.tiles,
        },
        fabricLibrary: {
          ...defaultContent.fabricLibrary,
          ...(remoteData.fabricLibrary || {}),
        },
        processSteps: {
          ...defaultContent.processSteps,
          ...(remoteData.processSteps || {}),
          steps:
            remoteData.processSteps?.steps?.length
              ? remoteData.processSteps.steps
              : defaultContent.processSteps.steps,
        },
      });
    }
  }, [remoteData]);

  const updateMutation = useUpdateHomeContent(() => {
    toast.success("Home page content published successfully!");
  });

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Home Page Content"
          description="Manage texts, images, and highlights on the storefront home page."
        />
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
          Loading home page settings…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home Page Content"
        description="Configure texts, showcase images, background images, and cards for the storefront home page."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <a href={storeUrl("/")} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 size-4" />
                Preview Store
              </a>
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              <Save className="size-4" />
              {updateMutation.isPending ? "Publishing…" : "Publish Changes"}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
          <TabsTrigger value="hero" className="gap-2">
            <Sparkles className="size-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="shop-by-range" className="gap-2">
            <Layers className="size-4" />
            Shop By Range
          </TabsTrigger>
          <TabsTrigger value="fabric-library" className="gap-2">
            <Shirt className="size-4" />
            Fabric Library
          </TabsTrigger>
          <TabsTrigger value="process" className="gap-2">
            <Workflow className="size-4" />
            TeesZone Process
          </TabsTrigger>
        </TabsList>

        {/* ----------------- 1. HERO SECTION ----------------- */}
        <TabsContent value="hero" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Text &amp; Messaging</CardTitle>
              <CardDescription>
                Main titles, badge, and copy shown in the storefront hero section.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormRow
                label="Eyebrow / Badge Text"
                htmlFor="h-badge"
                className="sm:col-span-2"
              >
                <Input
                  id="h-badge"
                  value={form.hero.badge}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, badge: e.target.value },
                    })
                  }
                  placeholder="e.g. Tiruppur · India's Knitwear Capital"
                />
              </FormRow>

              <FormRow
                label="Main Headline"
                htmlFor="h-title"
                className="sm:col-span-2"
                hint="Use newline or <br/> for line breaks"
              >
                <Textarea
                  id="h-title"
                  rows={2}
                  value={form.hero.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, title: e.target.value },
                    })
                  }
                  placeholder="Factory-Direct&#10;Custom Apparel"
                />
              </FormRow>

              <FormRow
                label="Subtitle Description"
                htmlFor="h-desc"
                className="sm:col-span-2"
              >
                <Textarea
                  id="h-desc"
                  rows={3}
                  value={form.hero.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, description: e.target.value },
                    })
                  }
                  placeholder="Apparel description..."
                />
              </FormRow>

              <FormRow label="Primary Button Text" htmlFor="h-pbtn">
                <Input
                  id="h-pbtn"
                  value={form.hero.primaryBtnText}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, primaryBtnText: e.target.value },
                    })
                  }
                  placeholder="Shop the Range"
                />
              </FormRow>

              <FormRow label="Primary Button Link" htmlFor="h-plink">
                <Input
                  id="h-plink"
                  value={form.hero.primaryBtnLink}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, primaryBtnLink: e.target.value },
                    })
                  }
                  placeholder="/products"
                />
              </FormRow>

              <FormRow label="Secondary Button Text" htmlFor="h-sbtn">
                <Input
                  id="h-sbtn"
                  value={form.hero.secondaryBtnText}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, secondaryBtnText: e.target.value },
                    })
                  }
                  placeholder="Bulk Enquiry"
                />
              </FormRow>

              <FormRow label="Secondary Button Link" htmlFor="h-slink">
                <Input
                  id="h-slink"
                  value={form.hero.secondaryBtnLink}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, secondaryBtnLink: e.target.value },
                    })
                  }
                  placeholder="/contact"
                />
              </FormRow>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hero Images &amp; Backgrounds</CardTitle>
              <CardDescription>
                Upload images to AWS S3 or enter external/local image URLs. Leave blank to use original default assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-1">
              <FormRow
                label="Hero Apparel Showcase Image"
                hint="Main right-hand side t-shirt display image. Supports direct S3 upload."
              >
                <ImageField
                  value={form.hero.heroImage}
                  onChange={(url) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, heroImage: url },
                    })
                  }
                  placeholder="Leave empty for default or upload custom image..."
                />
              </FormRow>

              <FormRow
                label="Desktop Background Image"
                hint="Large panoramic background image displayed on screens ≥ 768px."
              >
                <ImageField
                  value={form.hero.bgImageDesktop}
                  onChange={(url) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, bgImageDesktop: url },
                    })
                  }
                  placeholder="Leave empty for default or upload desktop background..."
                />
              </FormRow>

              <FormRow
                label="Mobile Background Image"
                hint="Optimized vertical background image displayed on mobile devices < 768px."
              >
                <ImageField
                  value={form.hero.bgImageMobile}
                  onChange={(url) =>
                    setForm({
                      ...form,
                      hero: { ...form.hero, bgImageMobile: url },
                    })
                  }
                  placeholder="Leave empty for default or upload mobile background..."
                />
              </FormRow>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hero Key Metric Stats</CardTitle>
              <CardDescription>
                The 3 numerical proof points displayed in the hero section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {form.hero.stats.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border p-4 bg-muted/20 space-y-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Stat #{idx + 1}
                    </p>
                    <FormRow label="Count / Number">
                      <Input
                        type="number"
                        value={s.end}
                        onChange={(e) => {
                          const next = [...form.hero.stats];
                          next[idx] = { ...s, end: Number(e.target.value) || 0 };
                          setForm({
                            ...form,
                            hero: { ...form.hero, stats: next },
                          });
                        }}
                      />
                    </FormRow>
                    <FormRow label="Suffix (%, +, etc.)">
                      <Input
                        value={s.suffix}
                        onChange={(e) => {
                          const next = [...form.hero.stats];
                          next[idx] = { ...s, suffix: e.target.value };
                          setForm({
                            ...form,
                            hero: { ...form.hero, stats: next },
                          });
                        }}
                        placeholder="%"
                      />
                    </FormRow>
                    <FormRow label="Label">
                      <Input
                        value={s.label}
                        onChange={(e) => {
                          const next = [...form.hero.stats];
                          next[idx] = { ...s, label: e.target.value };
                          setForm({
                            ...form,
                            hero: { ...form.hero, stats: next },
                          });
                        }}
                        placeholder="In-House Production"
                      />
                    </FormRow>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----------------- 2. SHOP BY RANGE ----------------- */}
        <TabsContent value="shop-by-range" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shop by Range: Header &amp; Feature Card</CardTitle>
              <CardDescription>
                Configure the section title and the large featured category banner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormRow label="Section Title" htmlFor="s-title">
                <Input
                  id="s-title"
                  value={form.shopByRange.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      shopByRange: {
                        ...form.shopByRange,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="Shop by Range"
                />
              </FormRow>

              <div className="rounded-xl border border-border p-5 bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    ★
                  </span>
                  <h4 className="font-semibold text-sm">
                    Featured Card (e.g. Hoodies Essentials)
                  </h4>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormRow label="Card Title">
                    <Input
                      value={form.shopByRange.feature.title}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          shopByRange: {
                            ...form.shopByRange,
                            feature: {
                              ...form.shopByRange.feature,
                              title: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Hoodies Essentials"
                    />
                  </FormRow>

                  <FormRow label="Button Text">
                    <Input
                      value={form.shopByRange.feature.buttonText}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          shopByRange: {
                            ...form.shopByRange,
                            feature: {
                              ...form.shopByRange.feature,
                              buttonText: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Shop Hoodies"
                    />
                  </FormRow>

                  <FormRow label="Link / URL" className="sm:col-span-2">
                    <Input
                      value={form.shopByRange.feature.href}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          shopByRange: {
                            ...form.shopByRange,
                            feature: {
                              ...form.shopByRange.feature,
                              href: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="/collections/unisex-hoodie-zip-325"
                    />
                  </FormRow>

                  <FormRow label="Description Copy" className="sm:col-span-2">
                    <Textarea
                      rows={2}
                      value={form.shopByRange.feature.text}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          shopByRange: {
                            ...form.shopByRange,
                            feature: {
                              ...form.shopByRange.feature,
                              text: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Premium zip and non-zip hoodies..."
                    />
                  </FormRow>

                  <FormRow
                    label="Feature Image (S3 Upload)"
                    className="sm:col-span-2"
                  >
                    <ImageField
                      value={form.shopByRange.feature.image}
                      onChange={(url) =>
                        setForm({
                          ...form,
                          shopByRange: {
                            ...form.shopByRange,
                            feature: {
                              ...form.shopByRange.feature,
                              image: url,
                            },
                          },
                        })
                      }
                    />
                  </FormRow>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shop by Range: Grid Tiles</CardTitle>
              <CardDescription>
                The 4 sub-range tiles (Men, Women, Kids, Mega Sale).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                {form.shopByRange.tiles.map((tile, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border p-4 bg-muted/15 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Tile #{i + 1}: {tile.title}
                      </span>
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <span>Sale Badge</span>
                        <Switch
                          checked={tile.sale}
                          onCheckedChange={(checked) => {
                            const next = [...form.shopByRange.tiles];
                            next[i] = { ...tile, sale: checked };
                            setForm({
                              ...form,
                              shopByRange: {
                                ...form.shopByRange,
                                tiles: next,
                              },
                            });
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormRow label="Title">
                        <Input
                          value={tile.title}
                          onChange={(e) => {
                            const next = [...form.shopByRange.tiles];
                            next[i] = { ...tile, title: e.target.value };
                            setForm({
                              ...form,
                              shopByRange: {
                                ...form.shopByRange,
                                tiles: next,
                              },
                            });
                          }}
                          placeholder="e.g. Men"
                        />
                      </FormRow>

                      <FormRow label="Button Text">
                        <Input
                          value={tile.buttonText}
                          onChange={(e) => {
                            const next = [...form.shopByRange.tiles];
                            next[i] = { ...tile, buttonText: e.target.value };
                            setForm({
                              ...form,
                              shopByRange: {
                                ...form.shopByRange,
                                tiles: next,
                              },
                            });
                          }}
                          placeholder="Shop now"
                        />
                      </FormRow>

                      <FormRow label="Link" className="sm:col-span-2">
                        <Input
                          value={tile.href}
                          onChange={(e) => {
                            const next = [...form.shopByRange.tiles];
                            next[i] = { ...tile, href: e.target.value };
                            setForm({
                              ...form,
                              shopByRange: {
                                ...form.shopByRange,
                                tiles: next,
                              },
                            });
                          }}
                          placeholder="/collections/mens-rn-half-180"
                        />
                      </FormRow>

                      <FormRow
                        label="Tile Image (S3 Upload)"
                        className="sm:col-span-2"
                      >
                        <ImageField
                          value={tile.image}
                          onChange={(url) => {
                            const next = [...form.shopByRange.tiles];
                            next[i] = { ...tile, image: url };
                            setForm({
                              ...form,
                              shopByRange: {
                                ...form.shopByRange,
                                tiles: next,
                              },
                            });
                          }}
                        />
                      </FormRow>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----------------- 3. THE FABRIC LIBRARY ----------------- */}
        <TabsContent value="fabric-library" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The Fabric Library Section Heading</CardTitle>
              <CardDescription>
                Controls the main headline and introductory text for the Fabric Library block.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormRow label="Section Title" htmlFor="f-title">
                <Input
                  id="f-title"
                  value={form.fabricLibrary.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fabricLibrary: {
                        ...form.fabricLibrary,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="The Fabric Library"
                />
              </FormRow>

              <FormRow label="Section Subtitle" htmlFor="f-sub">
                <Textarea
                  id="f-sub"
                  rows={2}
                  value={form.fabricLibrary.subtitle}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fabricLibrary: {
                        ...form.fabricLibrary,
                        subtitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Eight knits, each engineered for a job..."
                />
              </FormRow>

              <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
                <CheckCircle2 className="size-5 text-accent shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">
                    Looking to edit individual fabric knits, descriptions, highlights, or images?
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Individual fabrics are managed under the catalog database. You can add, edit, or upload fabric images at any time in the{" "}
                    <Link
                      href="/fabrics"
                      className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                    >
                      Fabrics Catalog Management
                    </Link>{" "}
                    tab.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ----------------- 4. THE TEESZONE PROCESS ----------------- */}
        <TabsContent value="process" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The TeesZone Process: Header</CardTitle>
              <CardDescription>
                Section title and subtext introducing the 4 manufacturing and delivery steps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormRow label="Section Title" htmlFor="p-title">
                <Input
                  id="p-title"
                  value={form.processSteps.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      processSteps: {
                        ...form.processSteps,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="The TeesZone Process"
                />
              </FormRow>

              <FormRow label="Section Subtitle" htmlFor="p-sub">
                <Textarea
                  id="p-sub"
                  rows={2}
                  value={form.processSteps.subtitle}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      processSteps: {
                        ...form.processSteps,
                        subtitle: e.target.value,
                      },
                    })
                  }
                  placeholder="From first message to delivered boxes in four steps."
                />
              </FormRow>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>The 4 Process Steps</CardTitle>
              <CardDescription>
                Customize each of the 4 steps shown to customers on the home page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {form.processSteps.steps.map((st, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border p-4 bg-muted/15 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-accent font-bold text-white text-xs">
                        {i + 1}
                      </span>
                      <h4 className="font-semibold text-sm">Step {i + 1}</h4>
                    </div>

                    <FormRow label="Step Title">
                      <Input
                        value={st.title}
                        onChange={(e) => {
                          const next = [...form.processSteps.steps];
                          next[i] = { ...st, title: e.target.value };
                          setForm({
                            ...form,
                            processSteps: {
                              ...form.processSteps,
                              steps: next,
                            },
                          });
                        }}
                        placeholder="e.g. Share Your Requirement"
                      />
                    </FormRow>

                    <FormRow label="Step Description">
                      <Textarea
                        rows={3}
                        value={st.text}
                        onChange={(e) => {
                          const next = [...form.processSteps.steps];
                          next[i] = { ...st, text: e.target.value };
                          setForm({
                            ...form,
                            processSteps: {
                              ...form.processSteps,
                              steps: next,
                            },
                          });
                        }}
                        placeholder="Step description..."
                      />
                    </FormRow>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
