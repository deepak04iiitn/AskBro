import CreateWorkspaceForm from '@/components/auth/CreateWorkspaceForm'

export const metadata = {
  title: 'Create a Workspace',
  description:
    'Create a private AskBro workspace for your team in under 2 minutes. Upload documents, invite members, and start asking questions right away.',
  keywords: [
    'create workspace',
    'new workspace',
    'team knowledge base setup',
    'AskBro setup',
    'document AI workspace',
    'private knowledge base',
  ],
  openGraph: {
    title: 'Create a Workspace — AskBro',
    description: 'Set up your team\'s private document intelligence workspace. Upload, search, and ask questions about any document.',
  },
}

export default function CreateWorkspacePage() {
  return <CreateWorkspaceForm />
}
