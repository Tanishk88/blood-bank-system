import React, { useState } from 'react';
import { 
  Cloud, 
  Server, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Database,
  Cpu,
  Layers
} from 'lucide-react';

const CloudDeployPage = () => {
  const [activeTab, setActiveTab] = useState('aws');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const awsSteps = [
    {
      title: '1. Create ECR Repositories',
      desc: 'Create Elastic Container Registry repositories for server and client containers',
      command: `aws ecr create-repository --repository-name blood-bank-server --region us-east-1
aws ecr create-repository --repository-name blood-bank-client --region us-east-1`,
    },
    {
      title: '2. Build & Push Docker Images',
      desc: 'Authenticate Docker to AWS ECR and push the images',
      command: `# Login to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and Tag Server Image
docker build -t blood-bank-server ./server
docker tag blood-bank-server:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blood-bank-server:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blood-bank-server:latest

# Build and Tag Client Image
docker build -t blood-bank-client ./client
docker tag blood-bank-client:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blood-bank-client:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blood-bank-client:latest`,
    },
    {
      title: '3. Deploy to AWS ECS (Fargate)',
      desc: 'Register the Task Definition and update the ECS Service',
      command: `aws ecs register-task-definition --cli-input-json file://cloud/aws-ecs/task-definition.json
aws ecs update-service --cluster blood-bank-cluster --service blood-bank-service --force-new-deployment`,
    },
  ];

  const gcpSteps = [
    {
      title: '1. Authenticate with Google Cloud',
      desc: 'Log in to gcloud CLI and set your GCP Project ID',
      command: `gcloud auth login
gcloud config set project <YOUR_GCP_PROJECT_ID>
gcloud services enable run.googleapis.com cloudbuild.googleapis.com`,
    },
    {
      title: '2. Deploy Backend to Cloud Run',
      desc: 'Deploy the Express API container directly to Google Cloud Run with automatic scaling',
      command: `cd server
gcloud run deploy blood-bank-api \\
  --source . \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars MONGODB_URI="<YOUR_MONGODB_ATLAS_URI>",JWT_SECRET="<YOUR_SECRET>"`,
    },
    {
      title: '3. Deploy Frontend to Cloud Run / Firebase',
      desc: 'Deploy the static/nginx client container or Firebase Hosting',
      command: `cd client
gcloud run deploy blood-bank-web \\
  --source . \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars VITE_API_URL="<CLOUD_RUN_API_URL>"`,
    },
  ];

  const composeSteps = [
    {
      title: 'Single-Command Production Stack via Docker Compose',
      desc: 'Runs MongoDB + Express Backend + React Nginx Frontend with automated networking and health checks',
      command: `cd cloud
docker compose up -d --build`,
    },
  ];

  const currentSteps = activeTab === 'aws' ? awsSteps : activeTab === 'gcp' ? gcpSteps : composeSteps;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-6 h-6 text-sky-600" /> Cloud Deployment Guide
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Production architectural blueprints and automation commands for AWS ECS, Google Cloud Run, and Docker
          </p>
        </div>

        {/* Cloud Provider Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab('aws')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'aws'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AWS (ECS Fargate)
          </button>
          <button
            onClick={() => setActiveTab('gcp')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'gcp'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Cloud Run
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'compose'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Docker Compose
          </button>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Container Architecture</h4>
          </div>
          <p className="text-xs text-slate-500">
            Multi-stage Docker builds for minimal attack surface, non-root users, and Nginx production web server.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Managed Cloud Database</h4>
          </div>
          <p className="text-xs text-slate-500">
            Seamlessly connects to MongoDB Atlas (Free Tier / Dedicated M10+) or AWS DocumentDB using <code className="text-red-600">MONGODB_URI</code>.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Zero-Downtime Probes</h4>
          </div>
          <p className="text-xs text-slate-500">
            Integrated <code className="text-red-600 font-mono">/health</code> route for AWS ALB target group checks and Cloud Run container health.
          </p>
        </div>
      </div>

      {/* Step by Step Execution Instructions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-slate-700" /> Deployment Steps for {activeTab.toUpperCase()}
        </h3>

        <div className="space-y-6">
          {currentSteps.map((step, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{step.title}</h4>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(step.command, idx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  {copiedIndex === idx ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Script
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre">
                  {step.command}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CloudDeployPage;
