import { prisma } from "./lib/prisma";


const userId = "6991c0476f82cdf7b7eb6660";

async function main() {
  console.log(`Seeding projects for user: ${userId}`);

  const projects = [
    {
      name: "E-commerce Platform",
      description: "Main web application for the e-commerce store.",
      repo: {
        provider: "github",
        owner: "acme-corp",
        name: "shop-frontend"
      }
    },
    {
      name: "Payment Gateway",
      description: "Internal microservice for processing payments securely.",
      repo: {
        provider: "gitlab",
        owner: "acme-security",
        name: "payment-api"
      }
    },
    {
      name: "Mobile App API",
      description: "Backend services for iOS and Android applications.",
      repo: {
        provider: "github",
        owner: "acme-corp",
        name: "mobile-backend"
      }
    },
    {
      name: "Analytics Dashboard",
      description: "Internal tool for business intelligence and reporting.",
      repo: {
        provider: "github",
        owner: "acme-data",
        name: "analytics-ui"
      }
    },
    {
      name: "Legacy Auth Service",
      description: "Authentication service for older internal applications.",
      repo: null
    },
    {
      name: "Inventory Management",
      description: "Real-time tracking of stock across multiple warehouses.",
      repo: {
        provider: "github",
        owner: "acme-ops",
        name: "inventory-sync"
      }
    },
    {
      name: "Notification Engine",
      description: "Unified service for email, SMS, and push notifications.",
      repo: {
        provider: "azure_devops",
        owner: "acme-infra",
        name: "notifier"
      }
    },
    {
      name: "Customer Support Portal",
      description: "Internal CRM extension for support tickets and user history.",
      repo: {
        provider: "gitlab",
        owner: "acme-external",
        name: "support-portal"
      }
    },
    {
      name: "Data Lake Scraper",
      description: "ETL pipelines for gathering market intelligence data.",
      repo: {
        provider: "bitbucket",
        owner: "acme-data",
        name: "lake-collector"
      }
    },
    {
      name: "Internal Documentation Site",
      description: "Static site generator for technical docs and diagrams.",
      repo: {
        provider: "github",
        owner: "acme-org",
        name: "docs-site"
      }
    },
    {
      name: "Search Indexer",
      description: "Elasticsearch integration for global product search.",
      repo: {
        provider: "github",
        owner: "acme-search",
        name: "indexer-v2"
      }
    },
    {
      name: "Machine Learning Playground",
      description: "Sandboxed environment for testing recommendation models.",
      repo: null
    },
    {
      name: "Compliance Logger",
      description: "Immutable audit logs for financial transactions.",
      repo: {
        provider: "gitlab",
        owner: "acme-legal",
        name: "audit-trail"
      }
    },
    {
      name: "Image Optimization Proxy",
      description: "On-the-fly resizing and compression for user-uploaded assets.",
      repo: {
        provider: "github",
        owner: "acme-assets",
        name: "img-proxy"
      }
    },
    {
      name: "IoT Sensor Hub",
      description: "Edge computing gateway for warehouse environment monitoring.",
      repo: {
        provider: "github",
        owner: "acme-iot",
        name: "gateway-core"
      }
    }

  ];

  for (const project of projects) {
    const created = await prisma.project.create({
      data: {
        ...project,
        ownerId: userId,
      },
    });
    console.log(`Created project: ${created.name} (${created.id})`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
